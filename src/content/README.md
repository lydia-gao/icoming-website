# Content files

All user-facing text and content for the website lives in this directory so
non-developers can update copy without touching components.

| File | What it covers |
|---|---|
| `home.ts` | Home page — hero, marquee tiles, section copy, CTAs |
| `about.ts` | About page — story, timeline, values, events |
| `capabilities.ts` | Capabilities — materials, printing, MOQ, lead time, QC, compliance |
| `trust.ts` | Certifications & credentials shown on the home-page trust strip |
| `contact.ts` | Contact channels and labels |
| `_types.ts` | Shared types + the `placeholder()` helper |

Other content sources:
- `../data/company.ts` — company name, emails, phone, address, social links
- `../data/categories.ts` — the 17 product categories
- `../data/products.ts` — individual products shown on the site

## Placeholders

Business facts we haven't verified are marked with `placeholder(label, needs)`
instead of a real value:

```ts
import { placeholder } from "./_types";

certifications: placeholder(
  "Active certifications",
  "List the certifications you currently hold (BSCI, REACH, OEKO-TEX, etc.)",
)
```

When the site renders, each placeholder becomes a visible "to be provided"
card that shows exactly what info is missing. To fill one in, replace the whole
`placeholder(...)` call with the real data matching the shape of other entries
in that file.

The full checklist of what still needs business input lives in the project
root as `CONTENT-TODO.md`.

## Editing tips

- Strings with special characters (`'`, `&`, etc.): TypeScript accepts them
  fine inside double-quoted or backtick template strings.
- Multi-line paragraphs: use `\n` or put each paragraph as its own array entry
  (see `aboutContent.story.paragraphs`).
- Links inside copy aren't supported from plain strings — ask a developer if
  you need clickable inline text.
- After any edit, run `npm run build` to catch typos before deploying.
