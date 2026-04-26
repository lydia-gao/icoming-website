import { aboutContent } from "@/content/about";
import { capabilitiesContent } from "@/content/capabilities";
import { homeContent } from "@/content/home";
import type { Locale } from "./i18n";
import type { SectionSchema } from "./cms-schemas";

/**
 * Static fallback values for each editable singleton section.
 *
 * The CMS layer is *additive* — these defaults remain the canonical
 * source when no DB row exists for a section. The admin editor pre-fills
 * its form with these values so sales sees the current text rather than
 * an empty form, and "Reset to default" deletes the DB row to restore
 * them.
 *
 * Adding a new section: extend the switch in `getStaticDefault` so the
 * editor can pre-fill and the public view can fall back.
 */

export type StaticDefault =
  | { type: "text"; en: string; zh: string }
  | { type: "paragraphs"; en: string[]; zh: string[] };

export type StaticDefaultsMap = Record<string, StaticDefault>;

/**
 * Returns the bilingual static defaults for every field in a section,
 * or null if the section key isn't recognized.
 */
export function getStaticDefaults(
  sectionKey: string,
): StaticDefaultsMap | null {
  switch (sectionKey) {
    case "home.hero": {
      const en = homeContent.en.hero;
      const zh = homeContent.zh.hero;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        headline: { type: "text", en: en.headline, zh: zh.headline },
        subheadline: { type: "text", en: en.subheadline, zh: zh.subheadline },
      };
    }
    case "about.hero": {
      const en = aboutContent.en.hero;
      const zh = aboutContent.zh.hero;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        headline: { type: "text", en: en.headline, zh: zh.headline },
        body: { type: "text", en: en.body, zh: zh.body },
      };
    }
    case "about.story": {
      const en = aboutContent.en.story;
      const zh = aboutContent.zh.story;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        heading: { type: "text", en: en.heading, zh: zh.heading },
        paragraphs: {
          type: "paragraphs",
          en: en.paragraphs,
          zh: zh.paragraphs,
        },
      };
    }
    case "about.events": {
      const en = aboutContent.en.events;
      const zh = aboutContent.zh.events;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        heading: { type: "text", en: en.heading, zh: zh.heading },
        intro: { type: "text", en: en.intro, zh: zh.intro },
      };
    }
    case "about.values": {
      const en = aboutContent.en.values;
      const zh = aboutContent.zh.values;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        heading: { type: "text", en: en.heading, zh: zh.heading },
      };
    }
    case "about.factoryStrength": {
      const en = aboutContent.en.factoryStrength;
      const zh = aboutContent.zh.factoryStrength;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        heading: { type: "text", en: en.heading, zh: zh.heading },
        body: { type: "text", en: en.body, zh: zh.body },
      };
    }
    case "capabilities.customization": {
      const en = capabilitiesContent.en.customization;
      const zh = capabilitiesContent.zh.customization;
      return {
        eyebrow: { type: "text", en: en.eyebrow, zh: zh.eyebrow },
        heading: { type: "text", en: en.heading, zh: zh.heading },
        body: { type: "text", en: en.body, zh: zh.body },
      };
    }
    default:
      return null;
  }
}

/**
 * Look up a single field's static default. Convenience for views that
 * already know the section + field they want.
 */
export function getStaticField(
  sectionKey: string,
  fieldKey: string,
  locale: Locale,
): string | string[] | null {
  const defaults = getStaticDefaults(sectionKey);
  if (!defaults) return null;
  const entry = defaults[fieldKey];
  if (!entry) return null;
  return entry[locale];
}

/**
 * Build initial form values for the editor: every field on the schema,
 * pre-filled with whichever value exists — DB first, then static defaults.
 *
 * dbFields shape: { fieldKey: { en: "...", zh: "..." } } for text,
 *                 { fieldKey: [ { en, zh }, ... ] } for paragraphs.
 */
export function buildInitialFormValues(
  schema: SectionSchema,
  dbFields: Record<string, unknown> | null,
): Record<string, EditorFieldValue> {
  const defaults = getStaticDefaults(schema.key);
  const out: Record<string, EditorFieldValue> = {};

  for (const field of schema.fields) {
    const dbValue = dbFields?.[field.key];

    if (field.type === "paragraphs") {
      const dbParagraphs = pullParagraphs(dbValue);
      if (dbParagraphs) {
        out[field.key] = { type: "paragraphs", value: dbParagraphs };
      } else {
        const def = defaults?.[field.key];
        const en = def && def.type === "paragraphs" ? def.en : [];
        const zh = def && def.type === "paragraphs" ? def.zh : [];
        const len = Math.max(en.length, zh.length, field.paragraphMin ?? 1);
        const pairs: BilingualPair[] = [];
        for (let i = 0; i < len; i++) {
          pairs.push({ en: en[i] ?? "", zh: zh[i] ?? "" });
        }
        out[field.key] = { type: "paragraphs", value: pairs };
      }
      continue;
    }

    // text / textarea
    const dbText = pullBilingualText(dbValue);
    if (dbText) {
      out[field.key] = { type: "text", value: dbText };
    } else {
      const def = defaults?.[field.key];
      const en = def && def.type === "text" ? def.en : "";
      const zh = def && def.type === "text" ? def.zh : "";
      out[field.key] = { type: "text", value: { en, zh } };
    }
  }

  return out;
}

export type BilingualPair = { en: string; zh: string };

export type EditorFieldValue =
  | { type: "text"; value: BilingualPair }
  | { type: "paragraphs"; value: BilingualPair[] };

function pullBilingualText(value: unknown): BilingualPair | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const en = typeof obj.en === "string" ? obj.en : null;
  const zh = typeof obj.zh === "string" ? obj.zh : null;
  if (en === null && zh === null) return null;
  return { en: en ?? "", zh: zh ?? "" };
}

function pullParagraphs(value: unknown): BilingualPair[] | null {
  if (!Array.isArray(value)) return null;
  const out: BilingualPair[] = [];
  for (const entry of value) {
    const pair = pullBilingualText(entry);
    if (pair) out.push(pair);
  }
  return out.length > 0 ? out : null;
}
