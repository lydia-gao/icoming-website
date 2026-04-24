# Reference Materials

Raw source material from the previous web vendor — a partial scrape of
the old `i-coming.com` site. Kept in the repo as reference when we
extract more products, images, or content for the new site.

**The rebuilt site does not depend on this folder at runtime.** Only
curated assets copied into `/public/images/` and typed content in
`/src/data/` and `/src/content/` are used by the live site.

## What's here

| Folder | Size | Files | Use |
|---|---|---|---|
| `html/` top-level (`*.html`) | ~105 MB | ~305 | Real product detail, category, article, and static pages. Primary source for extracting more product copy and identifying image references. |
| `img/` | ~375 MB | ~3,021 | Every product and lifestyle image from the old site, hashed filenames. Cross-reference via `data-original="../img/X.jpg"` in the HTML pages. |
| `styleRelated/` | ~18 MB | ~142 | Decorative assets (icons, fonts, gradients). Small, kept for completeness. |
| Top-level JPGs (4 files) | ~2 MB | 4 | Trade-show booth photos (customers + staff at the Cases & Bags show). |

## What was excluded (via `.gitignore`)

- `html/news/` (314.6 MB, 795 files) — auto-generated SEO doorway pages. Not real articles.
- `html/products/` (191.9 MB, 606 files) — same, SEO keyword-landing pages.
- `script/` (4.4 MB, 72 files) — CMS JavaScript glue. Unreadable and unusable.
- `style/` (2.4 MB, 151 files) — CMS widget CSS. Tangled per-widget hashes, not worth salvaging.
- `.Temp/` — empty directory.

If you later decide you need the SEO doorways (e.g. for a URL redirect
map during migration), edit `.gitignore` at the project root to remove
those entries and commit the files.

## How to use this folder

### Extracting more products into the live catalog

1. Find the product HTML page you want: `html/*-pd*.html`.
2. Read the title, description, and `data-original="../img/X.jpg"` references.
3. Copy the matching image(s) from `img/` into `/public/images/products/`
   with a readable filename (see existing names).
4. Add a new entry to `/src/data/products.ts`.

### Finding more category cover images

Category pages are `html/*-pl*.html`. Each lists products with `img/` references.

### Finding blog/article content

Articles are `html/*-id*.html`. ~101 articles on bag materials, printing,
care, and use-cases. Consider curating the best 10-20 for a blog section later.
