---
name: ICOMing website rebuild
description: Context for the Pingyang Icom Bag Co. website rebuild project — company, goals, stack, and scope
type: project
originSessionId: e459f8d1-34cb-403a-b0e9-292a8597b700
---
Rebuilding the company website for **Pingyang Icom Bag Co., Ltd.** (brand: "i-coming"), a family-owned eco-friendly / promotional bag manufacturer based in Wenzhou, Zhejiang, China (founded 2006, ~2,000 m² factory, ~30 workers). Primary user contact: Lydia Gao (Lydia.Gao@cci.com).

**Why:** A previous outsourced web project failed; the vendor refused to hand over source and only provided a messy scraped mirror of the old site (in `D:\vscode\icoming\Reference Materials\`). The family wants a professional, trust-building, standalone B2B product-showcase site so they stop relying entirely on Alibaba for customer acquisition.

**How to apply:**
- Treat this as a B2B catalog/lead-gen site for **overseas buyers**, NOT e-commerce. Flow: browse → save products of interest → submit inquiry → sales follows up via email / WhatsApp / whichever channel. Inquiry channels are intentionally flexible, not locked in.
- **Trust-building is the #1 priority** — overseas buyers often find them on Alibaba first and come to the website to validate legitimacy. Emphasize: factory photos/video, certifications, production capabilities, customization options, MOQ/process transparency, sustainability messaging.
- Reference Materials folder is reference ONLY. Old URLs, design, and CMS markup do NOT need to be preserved. Content (product copy, images, categories, company info, blog articles) IS reusable.
- 17 product categories, ~158 product-detail pages, ~101 blog articles, 2,932 product images, logo PNG, contact info (sale1@ / sale7@i-coming.com, +86-13336976300, +86-18657791652, Plaza No. 2 Chezhan Road, Lucheng Dist., Wenzhou).
- Socials: Facebook (I-com-bag), YouTube, Pinterest.
- Ignore the scraped CMS JS/CSS (`sitewidget-*` widget-scoped classes) and the auth/account pages — they were CMS defaults, no real user system exists.

**Confirmed tech stack (2026-04-23):**
- Next.js (App Router) + React + TypeScript + Tailwind CSS
- Deploy to Vercel
- No separate FastAPI/Node backend for V1 — Next.js API routes are enough
- Product data lives in local TypeScript files; can migrate to a headless CMS later
- Inquiry form submits to a Next.js API route; email integration intentionally deferred
- Blog is de-prioritized for V1 (may preserve a small resource section later if needed)

**V1 scope (proof-of-concept):** homepage + product catalog structure + a few sample product pages + about + capabilities/customization + contact/inquiry flow. Scale remaining ~150 products after direction is approved.
