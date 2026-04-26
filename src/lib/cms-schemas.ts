/**
 * CMS V1 — section schema map
 * ---------------------------
 * Declares which sections sales can edit, what fields each one carries,
 * and (for card sections) whether group CRUD is exposed in the admin UI.
 *
 * Adding a new editable section:
 *   1. Add an entry here.
 *   2. Wire the front-end view to read from `loadCmsSection(key)` /
 *      `loadCmsCards(key)` and merge with the static fallback.
 *   3. The admin UI is fully driven by this file — no per-section forms
 *      to write.
 *
 * The maps are deliberately empty in 5.A. Sub-phases 5.B–5.F populate
 * them as each section's editor lands.
 */

export type SectionPage = "home" | "about" | "capabilities" | "trust";

export type FieldType = "text" | "textarea" | "paragraphs" | "image";

export type FieldSpec = {
  key: string;
  label: string;
  type: FieldType;
  /** Hint shown under the field in admin UI. */
  help?: string;
  /** For paragraphs: minimum number of paragraph slots to render in the form. */
  paragraphMin?: number;
  /** For paragraphs: maximum slots the form will allow. */
  paragraphMax?: number;
  /** Soft character-count target — warning only, never blocks save. */
  softMax?: number;
};

export type SectionSchema = {
  /** Stable key written to cms_sections.section_key. e.g. "home.hero". */
  key: string;
  page: SectionPage;
  /** Sales-facing label, e.g. "Home — hero banner". */
  label: string;
  /** Sales-facing description: where this appears on the public site. */
  description: string;
  fields: FieldSpec[];
};

export type CardMetaField = {
  key: string;
  label: string;
  /** "text" stores a plain string; "bilingual" stores { en, zh }. */
  type: "text" | "bilingual";
  help?: string;
};

export type CardSectionSchema = {
  /** section_key joining cms_groups. */
  key: string;
  page: SectionPage;
  label: string;
  description: string;
  /** When false, sales cannot add or remove groups — there's exactly one
   *  implicit group, and the admin UI hides group management. */
  allowGroupCRUD: boolean;
  /** Visible default group label when allowGroupCRUD is false. */
  defaultGroupLabel?: string;
  cardFields: {
    title?: { label: string; help?: string };
    description?: { label: string; help?: string };
    image?: { label: string; help?: string };
    /** Extra fields persisted to cms_cards.meta. */
    meta?: CardMetaField[];
  };
};

// Populated incrementally as each sub-phase ships.
export const sectionSchemas: SectionSchema[] = [
  {
    key: "home.hero",
    page: "home",
    label: "Home — Hero banner",
    description:
      "Top of the home page. Eyebrow + headline + subheadline above the marquee.",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        type: "text",
        help: "Small uppercase line above the headline.",
        softMax: 80,
      },
      {
        key: "headline",
        label: "Headline",
        type: "textarea",
        help: "Big serif headline. Keep it short.",
        softMax: 140,
      },
      {
        key: "subheadline",
        label: "Subheadline",
        type: "textarea",
        help: "One or two sentences under the headline.",
        softMax: 280,
      },
    ],
  },
  {
    key: "about.hero",
    page: "about",
    label: "About — Hero",
    description: "Top of the About page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "headline", label: "Headline", type: "textarea", softMax: 140 },
      {
        key: "body",
        label: "Body",
        type: "textarea",
        help: "Intro paragraph under the headline.",
        softMax: 600,
      },
    ],
  },
  {
    key: "about.story",
    page: "about",
    label: "About — Our story",
    description:
      "Story section under the About hero. Up to 5 paragraphs — leave extra slots blank to use fewer.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "heading", label: "Heading", type: "textarea", softMax: 140 },
      {
        key: "paragraphs",
        label: "Paragraphs",
        type: "paragraphs",
        help: "Each paragraph is shown as its own block on the page.",
        paragraphMin: 1,
        paragraphMax: 5,
        softMax: 600,
      },
    ],
  },
  {
    key: "about.values",
    page: "about",
    label: "About — Why choose us heading",
    description:
      "Section header above the three value cards. The cards themselves are managed separately.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "heading", label: "Heading", type: "textarea", softMax: 140 },
    ],
  },
  {
    key: "about.factoryStrength",
    page: "about",
    label: "About — Factory strength",
    description:
      "Header above the certificates strip. Sets context for the credentials shown below it.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "heading", label: "Heading", type: "textarea", softMax: 140 },
      { key: "body", label: "Body", type: "textarea", softMax: 400 },
    ],
  },
  {
    key: "about.events",
    page: "about",
    label: "About — Meet us",
    description:
      "Header for the trade-shows / factory / team gallery section.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "heading", label: "Heading", type: "textarea", softMax: 140 },
      {
        key: "intro",
        label: "Intro paragraph",
        type: "textarea",
        softMax: 400,
      },
    ],
  },
  {
    key: "capabilities.customization",
    page: "capabilities",
    label: "Capabilities — Customization intro",
    description:
      "Intro text above the customization cards (printing, handles, pockets...). The cards themselves are managed separately.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
      { key: "heading", label: "Heading", type: "textarea", softMax: 140 },
      { key: "body", label: "Body", type: "textarea", softMax: 400 },
    ],
  },
];

export const cardSectionSchemas: CardSectionSchema[] = [
  {
    key: "capabilities.customization",
    page: "capabilities",
    label: "Capabilities — Customization cards",
    description:
      "Groups of cards under the Customization section (printing methods, Pantone, handles, pockets, additional features). You can add, rename, reorder, or delete groups, and manage cards inside each group.",
    allowGroupCRUD: true,
    cardFields: {
      title: {
        label: "Card title",
        help: "Short name like \"Screen printing\" or \"Pantone matched dyeing\".",
      },
      description: {
        label: "Description",
        help: "1–2 sentences about this option.",
      },
      image: {
        label: "Image",
        help: "Optional. Recommended 4:3 aspect ratio. JPG / PNG / WebP up to 10 MB.",
      },
    },
  },
  {
    key: "about.values.items",
    page: "about",
    label: "About — Why choose us cards",
    description:
      "Three cards under the \"What we value\" heading. Title + body, no image.",
    allowGroupCRUD: false,
    defaultGroupLabel: "Values",
    cardFields: {
      title: {
        label: "Title",
        help: "Short heading (e.g. \"Long-term partnership\").",
      },
      description: {
        label: "Body",
        help: "1-2 sentences explaining this value.",
      },
    },
  },
  {
    key: "about.events.factory",
    page: "about",
    label: "About — Factory gallery",
    description:
      "Photos of the factory floor shown in the Meet Us section. Recommended 4–6 photos in landscape orientation.",
    allowGroupCRUD: false,
    defaultGroupLabel: "Factory photos",
    cardFields: {
      title: {
        label: "Caption",
        help: "Short caption shown under the photo (e.g. \"Sewing line\").",
      },
      image: {
        label: "Photo",
        help: "Recommended 4:3 aspect ratio. JPG / PNG / WebP up to 10 MB.",
      },
    },
  },
  {
    key: "about.events.team",
    page: "about",
    label: "About — Team gallery",
    description:
      "Photos of the office and sales team shown in the Meet Us section. Recommended 2–4 photos.",
    allowGroupCRUD: false,
    defaultGroupLabel: "Team photos",
    cardFields: {
      title: {
        label: "Caption",
        help: "Short caption shown under the photo.",
      },
      image: {
        label: "Photo",
        help: "Recommended 4:3 aspect ratio. JPG / PNG / WebP up to 10 MB.",
      },
    },
  },
  {
    key: "about.events.tradeshows",
    page: "about",
    label: "About — Trade-show gallery",
    description:
      "Photos from trade shows and events shown in the Meet Us section.",
    allowGroupCRUD: false,
    defaultGroupLabel: "Trade-show photos",
    cardFields: {
      title: {
        label: "Caption",
        help: "Short caption shown under the photo (e.g. \"Booth — buyers walkthrough\").",
      },
      image: {
        label: "Photo",
        help: "Recommended 4:3 aspect ratio. JPG / PNG / WebP up to 10 MB.",
      },
    },
  },
  {
    key: "trust.credentials",
    page: "trust",
    label: "Trust — Credentials",
    description:
      "Certification documents shown in the Factory Strength strip on the About page (SGS, BSCI, REACH, etc.).",
    allowGroupCRUD: false,
    defaultGroupLabel: "Credentials",
    cardFields: {
      title: {
        label: "Title",
        help: "Name of the certificate (e.g. \"SGS Supplier Assessment Certificate\").",
      },
      description: {
        label: "Subtitle",
        help: "Short context line shown under the title.",
      },
      image: {
        label: "Certificate scan",
        help: "Photo or scan of the certificate. JPG / PNG / WebP up to 10 MB. Optional — cards without an image render with an icon.",
      },
      meta: [
        {
          key: "issuer",
          label: "Issuer",
          type: "bilingual",
          help: "Who issued the certificate (e.g. \"SGS / Alibaba\"). Optional.",
        },
        {
          key: "validity",
          label: "Validity",
          type: "bilingual",
          help: "Validity period or status (e.g. \"2024-2026\"). Optional.",
        },
      ],
    },
  },
];

export function findSectionSchema(key: string): SectionSchema | undefined {
  return sectionSchemas.find((s) => s.key === key);
}

export function findCardSectionSchema(
  key: string,
): CardSectionSchema | undefined {
  return cardSectionSchemas.find((s) => s.key === key);
}

export const SECTION_PAGES: Array<{ key: SectionPage; label: string }> = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "capabilities", label: "Capabilities" },
  { key: "trust", label: "Trust & credentials" },
];
