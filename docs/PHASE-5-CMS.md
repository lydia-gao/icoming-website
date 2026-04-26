# Phase 5 — Content CMS V1

Sales can edit text, images, and cards on the public site without a
deploy. **The static content in `src/content/*.ts` remains the
default**; CMS rows override per-field (singletons) or all-or-nothing
per section (cards). Empty database = site renders exactly as it did
before Phase 5.

This guide covers: what's editable, the data model, applying the
migration to a Supabase project, and how to extend the CMS to a new
section.

## What sales can edit today

Visit `/admin/content` after signing in.

**Singleton sections** (text + images, single record, per-field overrides):

| Page | Section |
|------|---------|
| Home | Hero (eyebrow + headline + subheadline) |
| About | Hero (eyebrow + headline + body) |
| About | Our story (eyebrow + heading + up to 5 paragraphs) |
| About | Why choose us heading (eyebrow + heading) |
| About | Factory strength (eyebrow + heading + body) |
| About | Meet us (eyebrow + heading + intro) |
| Capabilities | Customization intro (eyebrow + heading + body) |

**Card collections** (groups → cards, image optional, soft-delete with restore):

| Page | Section | Group CRUD | Static seed |
|------|---------|------------|-------------|
| About | Why choose us cards | single group | yes (3 default values) |
| About | Factory gallery | single group | no |
| About | Team gallery | single group | no |
| About | Trade-show gallery | single group | no |
| Capabilities | Customization cards | **multi-group** | yes (5 default groups) |
| Trust | Credentials | single group | no |

Card collections with a static seed expose a **"Pre-fill with current
defaults"** button when the section is empty. This copies the bilingual
text from `src/content/*.ts` into the CMS so sales has a starting point;
images are not auto-seeded.

## Data model

Three tables, all in `public`. Migration: `supabase/migrations/0004_cms.sql`.

```text
cms_sections                  one row per editable singleton
  section_key text PK         e.g. "home.hero"
  page text                   home | about | capabilities | trust
  fields jsonb                { eyebrow: { en, zh }, paragraphs: [{en,zh}, ...] }
  updated_at, updated_by

cms_groups                    multi-group sections + implicit single groups
  id uuid PK
  section_key text            e.g. "capabilities.customization"
  title_en, title_zh
  position integer
  active boolean              soft-delete flag (active=false hides everywhere)
  updated_at, updated_by

cms_cards                     cards under a group
  id uuid PK
  group_id uuid FK            cms_groups.id (cascade delete)
  title_en, title_zh
  description_en, description_zh
  image_path text             path inside cms-images bucket; null = no image
  image_alt_en, image_alt_zh
  position integer
  active boolean              soft-delete flag
  meta jsonb                  per-section extras (issuer/validity for credentials)
  updated_at, updated_by
```

Storage bucket `cms-images` is public — anyone can read URLs; only
admins can upload (`is_admin()` policy on `storage.objects`).

## RLS summary

- **Public read** on all three CMS tables. Soft-deleted rows
  (`active=false`) are filtered out for `anon` / non-admin roles.
- **Admin write** (insert / update / delete) gated by the
  `is_admin()` Postgres function (same allowlist as inquiry admin
  surface).
- The marketing site reads via `getPublicSupabase()` (publishable
  key, no session) — no service-role required for front-end render.

## Applying the migration

The Supabase project is pre-existing for this codebase. To install
the CMS schema:

1. Open the Supabase dashboard → SQL editor → New query.
2. Paste the contents of `supabase/migrations/0004_cms.sql`.
3. Run. The migration is idempotent; safe to re-run.
4. Verify: in the Table Editor you should now see `cms_sections`,
   `cms_groups`, `cms_cards`, and a `cms-images` bucket under
   Storage.

No application restart is needed — admin pages and front-end
fallback both work immediately.

## Extending to a new section

The admin UI is **fully driven by `src/lib/cms-schemas.ts`** —
adding an editable section is mostly a config change, no admin
form code to write.

### Singleton (text/image)

1. Add an entry to `sectionSchemas`:
   ```ts
   {
     key: "about.story.subhead",   // unique
     page: "about",
     label: "About — Story subhead",
     description: "What sales sees in the page list.",
     fields: [
       { key: "eyebrow", label: "Eyebrow", type: "text", softMax: 60 },
       { key: "body", label: "Body", type: "textarea", softMax: 400 },
     ],
   }
   ```
2. Add a switch case to `getStaticDefaults` in
   `src/lib/cms-defaults.ts` so the editor pre-fills with the
   current static value.
3. Wire the front-end view:
   ```ts
   const cms = await loadCmsSection("about.story.subhead");
   const subhead = {
     eyebrow: pickField(cms?.fields, "eyebrow", locale) ?? staticEyebrow,
     body: pickField(cms?.fields, "body", locale) ?? staticBody,
   };
   ```

### Card collection

1. Add an entry to `cardSectionSchemas`:
   ```ts
   {
     key: "about.materials",
     page: "about",
     label: "About — Materials cards",
     description: "...",
     allowGroupCRUD: false,        // true for multi-group like customization
     defaultGroupLabel: "Materials",
     cardFields: {
       title: { label: "Material name", help: "..." },
       description: { label: "Note", help: "..." },
       image: { label: "Photo", help: "..." },
       meta: [
         { key: "weight", label: "Weight", type: "bilingual" },
       ],
     },
   }
   ```
2. *(Optional)* Add a switch case to
   `getCardSectionStaticGroups` in `src/lib/cms-card-defaults.ts`
   so the "Pre-fill with current defaults" button works.
3. Wire the front-end view to read `loadCmsCards("about.materials")`
   and replace the static array when `cards.length > 0`.

### Don't forget

- **Cache invalidation.** Add the page to `pathsForPage()` in
  `src/lib/cms-revalidate.ts` if it's a new page; the existing
  switch already covers home / about / capabilities / trust.
- **Static fallback parity.** Static files in `src/content/*.ts`
  are still source-of-truth when the DB is empty. Updating either
  is a valid change; CMS just overrides per-field.
- **`zh: typeof en` constraint.** Adding a field to the static
  EN object requires the same key in ZH or the build fails. CMS
  schemas don't enforce this — bilingual parity in CMS rows is
  warning-only at the form level.

## Soft delete + restore

- Cards/groups deleted from the admin UI go to `active=false`.
  Public RLS hides them; admin "Show deleted" panel on the card
  manager exposes a per-row "Restore" button.
- Restoring a group also re-exposes its previously-active cards
  (they were hidden because the parent group was inactive).
- Hard delete is not exposed in the UI. To purge a row entirely,
  use the Supabase dashboard.

## Backups and orphan cleanup (V1 caveats)

- **Image orphans**: replacing or removing a card image leaves the
  old object in `cms-images`. V1 accepts this; volume is low. A
  cleanup script can sweep unreferenced paths in V2.
- **Sales attribution**: every write stamps `updated_by` with the
  auth user's UUID. Not surfaced in the UI yet — query the table
  directly for an audit trail.
