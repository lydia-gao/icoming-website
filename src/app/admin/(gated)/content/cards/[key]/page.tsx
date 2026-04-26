import Link from "next/link";
import { notFound } from "next/navigation";
import type { CmsCardRow, CmsGroupRow } from "@/lib/cms";
import { hasCardSectionStaticGroups } from "@/lib/cms-card-defaults";
import {
  findCardSectionSchema,
  type SectionPage,
} from "@/lib/cms-schemas";
import { seedCardSection } from "@/lib/cms-seed";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";
import { CardManager } from "./CardManager";

export const metadata = { title: "Edit cards" };

export default async function CardSectionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const schema = findCardSectionSchema(key);
  if (!schema) notFound();

  const supabase = getServiceSupabase();
  let activeGroups: CmsGroupRow[] = [];
  let activeCards: CmsCardRow[] = [];
  let deletedGroups: CmsGroupRow[] = [];
  let deletedCards: CmsCardRow[] = [];

  if (supabase) {
    let allGroups = await loadGroups(supabase, key);

    // Auto-seed: a section with static defaults but no rows of any
    // kind in the DB — including soft-deleted ones — gets pre-filled
    // on first admin visit so sales sees the current site as a
    // starting point instead of an empty manager.
    //
    // We deliberately don't flush the public CMS cache here.
    // revalidateTag isn't allowed during a render in Next 15, and the
    // public cache TTL (60s) is short enough that the public site
    // catches up quickly. Admin reads are uncached, so the manager
    // sees the seeded data immediately. Subsequent admin edits go
    // through API routes that do flush properly.
    if (allGroups.length === 0 && hasCardSectionStaticGroups(key)) {
      const admin = await requireAdminRow();
      const result = await seedCardSection(
        supabase,
        key,
        admin?.user_id ?? null,
      );
      if (result.ok) {
        allGroups = await loadGroups(supabase, key);
      } else {
        console.error("[cms] auto-seed failed", result.error, { key });
      }
    }

    activeGroups = allGroups.filter((g) => g.active);
    deletedGroups = allGroups.filter((g) => !g.active);

    if (allGroups.length > 0) {
      const { data: cardsData } = await supabase
        .from("cms_cards")
        .select(
          "id, group_id, title_en, title_zh, description_en, description_zh, image_path, image_alt_en, image_alt_zh, position, active, meta",
        )
        .in(
          "group_id",
          allGroups.map((g) => g.id),
        )
        .order("position", { ascending: true });
      const allCards = ((cardsData ?? []) as CmsCardRow[]).map((c) => ({
        ...c,
        meta:
          c.meta && typeof c.meta === "object" && !Array.isArray(c.meta)
            ? c.meta
            : {},
      }));
      const activeGroupIds = new Set(activeGroups.map((g) => g.id));
      activeCards = allCards.filter(
        (c) => c.active && activeGroupIds.has(c.group_id),
      );
      // Deleted cards visible for restore: only those under groups still
      // active. Cards under a deleted group come back when the group is
      // restored, so they don't belong in the per-card restore list.
      deletedCards = allCards.filter(
        (c) => !c.active && activeGroupIds.has(c.group_id),
      );
    }
  }

  const previewPath = previewPathForPage(schema.page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/content/${schema.page}`}
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
          >
            <span aria-hidden>←</span> {pageLabel(schema.page)}
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-semibold">
            {schema.label}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">
            {schema.description}
          </p>
        </div>
        {previewPath && (
          <Link
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300 hover:text-ink-900"
          >
            Preview <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      <CardManager
        schema={schema}
        initialGroups={activeGroups}
        initialCards={activeCards}
        initialDeletedGroups={deletedGroups}
        initialDeletedCards={deletedCards}
        hasStaticDefaults={hasCardSectionStaticGroups(schema.key)}
      />
    </div>
  );
}

function pageLabel(page: SectionPage): string {
  switch (page) {
    case "home":
      return "Home";
    case "about":
      return "About";
    case "capabilities":
      return "Capabilities";
    case "trust":
      return "Trust & credentials";
  }
}

function previewPathForPage(page: SectionPage): string | null {
  switch (page) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "capabilities":
      return "/capabilities";
    case "trust":
      return "/about";
  }
}

async function loadGroups(
  supabase: NonNullable<ReturnType<typeof getServiceSupabase>>,
  sectionKey: string,
): Promise<CmsGroupRow[]> {
  const { data } = await supabase
    .from("cms_groups")
    .select("id, section_key, title_en, title_zh, position, active")
    .eq("section_key", sectionKey)
    .order("position", { ascending: true });
  return (data ?? []) as CmsGroupRow[];
}
