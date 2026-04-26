# Content to collect from the business

This is a checklist of real information and assets the business team needs to
provide before the site goes live. Each item below corresponds to a
`placeholder(...)` entry in `src/content/*.ts` — the site renders these as
clearly-marked "to be provided" blocks so nothing is fabricated in the meantime.

Work through this in roughly the order listed. Anything marked **[Priority]** is
blocking a visible section on the home page or capabilities page.

---

## 1. Company metrics (homepage hero strip)

Located in: `src/content/home.ts` → `heroMetrics`

- [ ] **[Priority]** Export regions / countries served
  _e.g. "30+ countries", or a list of regions like "North America, EU, Australia, SE Asia"._
- [ ] (Optional) Any other headline metric worth showing next to "Founded 2006 / 2,000 m² / 30 people"
  _e.g. "500+ active SKUs", "10M+ bags shipped annually", "20+ years of repeat clients"._

## 2. Certifications & compliance

Located in: `src/content/trust.ts` → `credentials[]`
and `src/content/capabilities.ts` → `compliance.certifications`

Upload each document as a clean image (JPG/PNG, ~1200px on long edge) into
`public/images/trust/` and update the corresponding entry.

- [ ] **[Priority]** Current SGS / Alibaba Assessed Supplier — is the 2018–2019 cert on file still valid, or is there a newer one to replace it?
- [ ] **BSCI audit report** (if held) — upload the most recent
- [ ] **REACH compliance / test reports**
- [ ] **California Prop 65 test reports**
- [ ] **OEKO-TEX Standard 100** certificate (if you supply certified fabrics)
- [ ] **GOTS** certificate (if you supply GOTS organic cotton)
- [ ] **FSC chain-of-custody** certificate (if you supply FSC paper)
- [ ] **ISO 9001** or equivalent quality-system cert
- [ ] Any client-specific audit reports you're willing to share (e.g. Sedex, Disney, Walmart)

## 3. Manufacturing capabilities (MOQ, lead time, QC)

Located in: `src/content/capabilities.ts`

- [ ] **[Priority]** Realistic MOQ tiers by product line
  _Example format we'll use:_
  - Cotton tote: from ___ pcs
  - Non-woven shopper: from ___ pcs
  - Cooler / delivery bag: from ___ pcs
  - Garment bag: from ___ pcs
  - Paper bag: from ___ pcs
  - Cosmetic pouch: from ___ pcs
  - Jute tote: from ___ pcs
- [ ] **[Priority]** Typical lead times
  - Sampling: ___ days after artwork approval
  - Standard production: ___ days
  - Peak-season buffer (which months?): +___ days
- [ ] **[Priority]** QC process — do you want to describe it publicly?
  - What inspection stages do you actually run? (incoming materials / inline / pre-shipment)
  - Do you use an AQL inspection level? Which one?
  - Do you accept third-party inspections (SGS, BV, QIMA, etc.)?
- [ ] Shipping terms actually supported: FOB (which port?), EXW, CIF, DDP?

## 4. Company timeline & story

Located in: `src/content/about.ts` → `timeline.entries`

- [ ] Milestone #2 — one key moment between 2006 and today
  _(e.g. year you opened your own factory, first big client won, major product-line expansion, first trade show, sustainability initiative)_
- [ ] Milestone #3 — another key moment
- [ ] Any corrections to the current story copy in `aboutContent.story.paragraphs`

## 5. Trade-show / events history

Located in: `src/content/about.ts` → `events`

Real trade-show photos are already in `public/images/events/` (4 booth photos).

- [ ] Which trade shows do you regularly attend?
  _e.g. Canton Fair, HK Printing & Packaging Fair, IPPE, Cologne messe_
- [ ] Dates of most recent shows attended
- [ ] Dates of upcoming shows where customers can meet you in person

## 6. Better factory photography (high-value upgrade)

Current imagery is strong on product shots but **missing real factory/team
content**. This is the single biggest upgrade for trust-building. Two
specific About-page slots ("Inside the factory" and "Office & team") render
as `placeholder` cards until photos arrive.

Ideally a small photoshoot (half a day with any competent local photographer)
covering:

**Inside the factory** → save into `public/images/factory/`, list under
`aboutContent.events.gallery.factory.photos` in `src/content/about.ts`:

- [ ] Production floor — sewing machines in use, workers at stations (respecting privacy)
- [ ] Cutting tables and fabric rolls
- [ ] QC/inspection station
- [ ] Printing area (screen-print / DTG)
- [ ] Finished-goods packing area
- [ ] Exterior of the factory building with ICOM BAG signage

**Office & team** → save into `public/images/team/`, list under
`aboutContent.events.gallery.team.photos`:

- [ ] Sales-team workspace
- [ ] Sample / showroom room
- [ ] One wide "group photo" of the sales team (if comfortable)

**Customization technique cards (Capabilities page)** → save into
`public/images/customization/`, set the `image` field on the relevant
items in `src/content/capabilities.ts → customization.groups[].items[]`:

- [ ] Printing methods — close-ups of screen print, embroidery, foil, debossing on real product
- [ ] Pantone color matching — color-card next to dyed fabric swatches
- [ ] Handles — close-ups of cotton webbing, jute, PU, wood/bamboo, rope, self-fabric
- [ ] Pockets — interior + exterior pocket detail shots
- [ ] Additional features — gusset, magnetic snap, hangtag, drawcord stopper close-ups

- [ ] Optional: a short 30–60s factory walkthrough video.

Each image: high resolution (2000px+ on long edge), natural daylight where
possible, no posed marketing smiles — working shots feel more authentic.

## 7. Product-level details (when you're ready to scale past the 9 samples)

Located in: `src/data/products.ts`

Current V1 has 9 representative products. Each one currently shows "Detailed
specs confirmed per order" because we don't have verified specs. When ready:

- [ ] For the 9 current products, fill in accurate `specs`, `moq`, `leadTime`
- [ ] Decide which additional products to publish (out of ~150 in the old
  reference material — too many to migrate in one go)
- [ ] For each new product: title, category, summary, description, image file, specs, MOQ, lead time, customization options, materials
- [ ] Confirm or update category names and descriptions in `src/data/categories.ts`

## 8. Client proof / social proof (when comfortable)

Currently the site has none. Optional additions that would lift trust:

- [ ] **Client logos** (with permission) — even 4–6 recognisable retail brands adds instant credibility
- [ ] **A short written testimonial** from 1–3 long-standing overseas customers
- [ ] **Case study** — one project told in depth: brief → sample → production → result

Even one of these is high-impact. All are optional.

## 9. Finalize legal / contact details

Located in: `src/data/company.ts`

- [ ] Confirm both sales emails are correct (`sale1@i-coming.com`, `sale7@i-coming.com`)
- [ ] Confirm phone numbers are up to date
- [ ] WhatsApp number — is `+86-18657791652` still the preferred channel for overseas customers?
- [ ] Confirm registered legal name is still "Pingyang Icom Bag Co., Ltd."
- [ ] Confirm address for the contact page
- [ ] Social links — Facebook, YouTube, Pinterest — are these still active and current?

## 10. Domain & deployment

- [ ] Decide on the live domain (use `i-coming.com` or pick a new one?)
- [ ] Decide which email inbox should receive inquiry-form submissions
- [ ] Pick an email provider to wire into the `/api/inquiry` route (Resend recommended for Vercel)
- [ ] Approve the site for production deployment to Vercel

---

## How the placeholder system works

When you see a **dashed clay-colored box** anywhere on the live preview saying
"To be provided — [label]", that's a placeholder from this checklist.

To fill one in, open `src/content/` and find the `placeholder(...)` call whose
`label` matches. Replace the whole `placeholder(...)` call with real content
using the same shape as the other entries in that file.

No developer intervention needed for most items — editing a content file is
usually a 1–2 line change. Ask if anything is unclear.
