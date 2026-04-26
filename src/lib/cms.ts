import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "./supabase-public";
import type { Locale } from "./i18n";

/**
 * CMS read API used by public server components.
 *
 * Layered design:
 *   1. Static defaults in src/content/*.ts and src/data/*.ts are always-on.
 *   2. CMS rows in cms_sections / cms_groups / cms_cards override per-field
 *      when present. Empty rows = renders identically to the static defaults.
 *
 * Reads go through `unstable_cache` tagged with CMS_CACHE_TAG so an admin
 * save can flush all CMS reads with a single `revalidateTag(CMS_CACHE_TAG)`.
 */

export const CMS_CACHE_TAG = "cms";
export const CMS_IMAGES_BUCKET = "cms-images";

// -------- Types matching the DB schema --------

export type CmsSectionRow = {
  section_key: string;
  page: string;
  fields: Record<string, unknown>;
  updated_at: string;
};

export type CmsGroupRow = {
  id: string;
  section_key: string;
  title_en: string | null;
  title_zh: string | null;
  position: number;
  active: boolean;
};

export type CmsCardRow = {
  id: string;
  group_id: string;
  title_en: string | null;
  title_zh: string | null;
  description_en: string | null;
  description_zh: string | null;
  image_path: string | null;
  image_alt_en: string | null;
  image_alt_zh: string | null;
  position: number;
  active: boolean;
  meta: Record<string, unknown>;
};

// -------- Field accessors --------

/**
 * Pull a locale-specific text value from a stored bilingual field.
 * Stored shape: { en: "...", zh: "..." }. Returns null when the value
 * is missing or whitespace-only — callers should fall back to the
 * static default in that case (NOT to the other locale, which would
 * bleed languages across pages).
 */
export function pickLocaleText(
  field: unknown,
  locale: Locale,
): string | null {
  if (!field || typeof field !== "object") return null;
  const value = (field as Record<string, unknown>)[locale];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Pull a row from cms_sections.fields by field key.
 * Convenience wrapper around pickLocaleText.
 */
export function pickField(
  fields: Record<string, unknown> | undefined,
  fieldKey: string,
  locale: Locale,
): string | null {
  if (!fields) return null;
  return pickLocaleText(fields[fieldKey], locale);
}

/**
 * Pick a bilingual paragraphs array (e.g. about.story.paragraphs).
 * Stored shape: [ { en, zh }, { en, zh }, ... ].
 * Returns null when the field is absent OR all paragraphs are empty.
 */
export function pickParagraphs(
  fields: Record<string, unknown> | undefined,
  fieldKey: string,
  locale: Locale,
): string[] | null {
  if (!fields) return null;
  const raw = fields[fieldKey];
  if (!Array.isArray(raw)) return null;
  const out = raw
    .map((p) => pickLocaleText(p, locale))
    .filter((s): s is string => !!s);
  return out.length > 0 ? out : null;
}

/**
 * Resolve a stored image_path into a URL renderable by next/image.
 *
 * The CMS uses image_path for two cases:
 *   1. Sales-uploaded images live in the `cms-images` Supabase bucket;
 *      image_path is the storage object key (e.g. "abc-123.jpg").
 *      Resolved to a public Supabase URL.
 *   2. Statically-shipped images that pre-seed sections (tradeshow
 *      photos, default cert scans) live under `/public/images/...`
 *      and are stored as `/images/.../foo.jpg`. Returned as-is so
 *      next/image serves them from the app's CDN.
 *
 * Returns null if the path is empty.
 */
export function cmsImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Local public-folder path or absolute URL — pass through.
  if (path.startsWith("/") || /^https?:\/\//i.test(path)) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${CMS_IMAGES_BUCKET}/${encodedPath}`;
}

// -------- Read functions (uncached) --------

async function fetchCmsSection(key: string): Promise<CmsSectionRow | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("cms_sections")
    .select("section_key, page, fields, updated_at")
    .eq("section_key", key)
    .maybeSingle();

  if (error || !data) return null;
  return {
    section_key: data.section_key,
    page: data.page,
    fields:
      data.fields && typeof data.fields === "object" && !Array.isArray(data.fields)
        ? (data.fields as Record<string, unknown>)
        : {},
    updated_at: data.updated_at,
  };
}

async function fetchCmsCards(
  sectionKey: string,
): Promise<{ groups: CmsGroupRow[]; cards: CmsCardRow[] }> {
  const supabase = getPublicSupabase();
  if (!supabase) return { groups: [], cards: [] };

  const { data: groupsData, error: groupsErr } = await supabase
    .from("cms_groups")
    .select("id, section_key, title_en, title_zh, position, active")
    .eq("section_key", sectionKey)
    .eq("active", true)
    .order("position", { ascending: true });

  if (groupsErr || !groupsData || groupsData.length === 0) {
    return { groups: [], cards: [] };
  }

  const groupIds = groupsData.map((g) => g.id);
  const { data: cardsData, error: cardsErr } = await supabase
    .from("cms_cards")
    .select(
      "id, group_id, title_en, title_zh, description_en, description_zh, image_path, image_alt_en, image_alt_zh, position, active, meta",
    )
    .in("group_id", groupIds)
    .eq("active", true)
    .order("position", { ascending: true });

  if (cardsErr) {
    return { groups: groupsData as CmsGroupRow[], cards: [] };
  }

  const cards = (cardsData ?? []).map((c) => ({
    ...c,
    meta:
      c.meta && typeof c.meta === "object" && !Array.isArray(c.meta)
        ? (c.meta as Record<string, unknown>)
        : {},
  })) as CmsCardRow[];

  return { groups: groupsData as CmsGroupRow[], cards };
}

// -------- Cached public reads --------

/**
 * Cached read of a singleton CMS section. Returns null when no row exists,
 * which the caller treats as "use the static default".
 */
export const loadCmsSection = unstable_cache(
  fetchCmsSection,
  ["cms-section"],
  { tags: [CMS_CACHE_TAG], revalidate: 60 },
);

/**
 * Cached read of groups + cards for a card section. Returns
 * { groups: [], cards: [] } when nothing has been customized — the
 * caller treats that as "use the static default".
 */
export const loadCmsCards = unstable_cache(
  fetchCmsCards,
  ["cms-cards"],
  { tags: [CMS_CACHE_TAG], revalidate: 60 },
);
