import { placeholder } from "./_types";

/**
 * CAPABILITIES PAGE CONTENT
 * -------------------------
 * Material and printing lists are generic industry capabilities
 * that match what the reference materials describe as product lines.
 *
 * Specific numbers (MOQ, lead time, compliance certifications, QC
 * standards) have been REMOVED until verified. Each is tagged with
 * a placeholder() so the page shows a clear "to be provided" block.
 */

export const capabilitiesContent = {
  hero: {
    eyebrow: "Capabilities",
    headline: "Materials, printing, and customization — all under one roof.",
    body:
      "Our in-house team handles material sourcing, production, printing, and inspection. This page is an overview of what we can make; if you don't see something, ask — chances are we've made it.",
  },

  materials: {
    eyebrow: "Fabrics & materials",
    heading: "What we make bags from.",
    // Derived from actual product catalog in reference materials.
    items: [
      { name: "Cotton canvas", note: "Natural, recycled, and organic cotton options" },
      { name: "Jute / burlap", note: "Natural and laminated for water resistance" },
      { name: "Non-woven PP", note: "Plain or laminated (matte/gloss)" },
      { name: "Kraft paper", note: "Brown, white, and coated variants" },
      { name: "Tyvek / DuPont paper", note: "Lightweight, tear-resistant" },
      { name: "Polyester / Oxford", note: "210D to 1680D, for sports and heavy-duty bags" },
      { name: "PEVA / PVC", note: "Transparent and food-contact options" },
      { name: "Felt", note: "Polyester and synthetic-blend felt" },
      { name: "RPET", note: "Post-consumer-recycled polyester" },
    ],
  },

  printing: {
    eyebrow: "Printing & finishing",
    heading: "Customization techniques.",
    // These are standard industry techniques; we can reasonably claim
    // them without making up specific numbers.
    items: [
      { name: "Screen printing", note: "1+ colors on fabric and paper" },
      { name: "Digital print", note: "Photographic prints on fabric" },
      { name: "Heat transfer", note: "Vivid, durable artwork" },
      { name: "Embroidery", note: "Thread and 3D puff embroidery" },
      { name: "Flexo / offset print", note: "For paper-bag runs" },
      { name: "Hot stamping / foil", note: "Metallic and custom foils" },
      { name: "Debossing / embossing", note: "For leather-feel finishes" },
      { name: "Sublimation", note: "All-over print on polyester" },
    ],
  },

  moq: {
    title: "MOQ",
    heading: "Flexible minimums, transparent tiers.",
    // Removed fabricated numbers. Real MOQ tiers need to be supplied by
    // the sales team — they vary by material and product.
    body: placeholder(
      "MOQ tiers by product line",
      "List realistic minimum-order quantities for: cotton totes, non-woven bags, cooler bags, garment bags, paper bags, cosmetic pouches, etc. Example format: 'Cotton tote: 500 pcs; Non-woven promo: 2,000 pcs'.",
    ),
  },

  leadTime: {
    title: "Lead time",
    heading: "Predictable timelines, no surprises.",
    body: placeholder(
      "Production lead times",
      "Confirm typical lead times for: sampling, standard production, and peak-season. E.g. 'Sampling 7–10 days; production 25–35 days; peak-season +7 days'.",
    ),
  },

  qc: {
    eyebrow: "Quality control",
    heading: "Inspection at every stage.",
    // Removed the fabricated three-stage details (AQL levels,
    // third-party inspector names). Placeholder until verified.
    stages: placeholder(
      "QC process details",
      "Describe your actual inspection steps (incoming materials, inline, pre-shipment). If you use a specific AQL level or work with third-party inspectors (SGS, BV, QIMA), list them here.",
    ),
  },

  compliance: {
    eyebrow: "Compliance",
    heading: "Documentation for your market.",
    body:
      "We support customers in Europe, North America, Asia-Pacific and beyond. Test reports and declarations are available on request.",
    // Removed all fabricated cert claims (BSCI, REACH, Prop 65, GOTS, OEKO-TEX, FSC).
    // Only the Alibaba/SGS Supplier Assessment is real — that lives on the Trust strip.
    certifications: placeholder(
      "Active certifications",
      "List the certifications you actually hold today (e.g. BSCI audit, REACH, Prop 65, OEKO-TEX 100, GOTS, FSC, ISO 9001). Only list what you currently have valid documentation for.",
    ),
  },

  cta: {
    heading: "Tell us what you need — we'll quote within a day.",
    body:
      "Share a reference design, target quantity, and market. A dedicated sales contact will walk you through materials, printing, and an accurate production timeline.",
    primary: { label: "Start your project", href: "/contact" },
    secondary: { label: "Browse products", href: "/products" },
  },
};
