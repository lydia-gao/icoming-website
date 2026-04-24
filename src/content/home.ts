import { placeholder, type Metric } from "./_types";

/**
 * HOME PAGE CONTENT
 * -----------------
 * All copy and content for the home page lives here.
 * Non-developers: search for `placeholder(` to find items
 * that still need real business info.
 */

export const homeContent = {
  hero: {
    eyebrow: "Pingyang · Wenzhou, China",
    headline: "Eco-friendly bag manufacturing, built on trust.",
    subheadline:
      "A family-run factory producing cotton totes, non-woven shoppers, cooler bags, and custom packaging for brands, retailers, and distributors worldwide.",
    primaryCta: { label: "Browse products", href: "/products" },
    secondaryCta: { label: "See capabilities", href: "/capabilities" },
  },

  // Only verified metrics below. Fabricated ones have been replaced
  // with placeholder() calls — they render as "to be provided" cards.
  heroMetrics: [
    { label: "Founded", value: "2006" },
    { label: "Factory floor", value: "2,000 m²" },
    { label: "Team", value: "~30 people" },
    placeholder(
      "Export regions",
      "Confirm the regions/countries you currently ship to, e.g. 'N. America, EU, AU, SE Asia'.",
    ),
  ] satisfies Metric[],

  sections: {
    categories: {
      eyebrow: "Product categories",
      heading: "One factory, many product families.",
      body:
        "From cotton shoppers to insulated food-delivery backpacks, we keep tooling and material expertise under one roof — so buyers can source a whole bag line from one supplier.",
    },

    editorial: {
      eyebrow: "Made with care",
      heading: "Quiet craft, quietly consistent.",
      body:
        "Every piece leaves the factory inspected. Most of our customers have worked with us for years — because they can talk to the same people who run the production floor.",
      // Uses real editorial flat-lay images (already in public/images/editorial/)
      left: {
        image: "/images/editorial/corduroy-duo-white.jpg",
        caption: "Corduroy tote — natural & black",
      },
      right: {
        image: "/images/editorial/drawstring-styled.jpg",
        caption: "Transparent drawstring — lifestyle shot",
      },
    },

    featured: {
      eyebrow: "Featured products",
      heading: "A few representative models.",
      body:
        "Proven base designs with full customization available — tailor material, size, print, and finishing for your brand.",
    },

    process: {
      eyebrow: "How we work together",
      heading: "A predictable 4-step process, from brief to delivery.",
      steps: [
        { step: "01", title: "Share your brief", body: "Reference images, target quantity, market, and timeline." },
        { step: "02", title: "Quote & sample", body: "Cost quote, then pre-production sample for your approval." },
        { step: "03", title: "Approve & produce", body: "Sign-off on artwork, material, and specification sheet." },
        { step: "04", title: "QC & ship", body: "Final inspection before loading; we support FOB, EXW, and CIF terms." },
      ],
    },

    trust: {
      eyebrow: "Credentials",
      heading: "Verified supplier credentials.",
      body:
        "We're an assessed supplier on Alibaba via SGS. Full certification documents available on request.",
    },

    finalCta: {
      heading: "Ready to source your next bag line?",
      body:
        "Save any product to your inquiry list — tell us your brand, target quantity, and market, and we'll reply within one business day.",
      primary: { label: "Start browsing", href: "/products" },
      secondary: { label: "Talk to sales", href: "/contact" },
    },
  },
};

// Marquee tiles — the file list matches what's in /public/images/marquee/.
// Add or remove tiles freely; the Marquee component handles any count.
export const marqueeTiles: { src: string; alt: string }[] = [
  { src: "/images/marquee/AaDEoB.jpg", alt: "Cotton bag" },
  { src: "/images/marquee/arJEQE.jpg", alt: "Transparent cosmetic pouch" },
  { src: "/images/marquee/AWnyuB.jpg", alt: "Paper shopping bag" },
  { src: "/images/marquee/bCFhvG.jpg", alt: "Mesh bag" },
  { src: "/images/marquee/bgNaM.jpg", alt: "Mini jute tote" },
  { src: "/images/marquee/bhwTfE.png", alt: "Mesh produce bag" },
  { src: "/images/marquee/BujwLB.jpg", alt: "Mesh shopping bag" },
  { src: "/images/marquee/bYnzFH.jpg", alt: "Canvas specialty bag" },
  { src: "/images/marquee/CAyZbD.jpg", alt: "Cooler bag" },
  { src: "/images/marquee/CnUgBK.jpg", alt: "Canvas bag" },
  { src: "/images/marquee/dcFEKL.jpg", alt: "Polyester drawstring bag" },
  { src: "/images/marquee/DjbsmB.jpg", alt: "Kraft shopping bag" },
  { src: "/images/marquee/DlKGBF.jpg", alt: "Felt tote" },
  { src: "/images/marquee/dzaMeF.jpg", alt: "Product" },
  { src: "/images/marquee/eapZrD.jpg", alt: "Product" },
  { src: "/images/marquee/eCKqE.jpg", alt: "Shopping trolley bag" },
  { src: "/images/marquee/eiKADC.jpg", alt: "Printed canvas bag" },
  { src: "/images/marquee/FcFHc.jpg", alt: "Product shot" },
  { src: "/images/marquee/fCnCIJ.jpg", alt: "Product shot" },
  { src: "/images/marquee/ffbuaI.jpg", alt: "Product shot" },
  { src: "/images/marquee/fGNsSG.jpg", alt: "Product" },
  { src: "/images/marquee/GDCGtK.jpg", alt: "Product shot" },
  { src: "/images/marquee/gHxRl.jpg", alt: "Folding trolley bag" },
  { src: "/images/marquee/gzDSKI.jpg", alt: "Grocery shopping bag" },
  { src: "/images/marquee/HbZkuJ.jpg", alt: "Felt storage bag" },
  { src: "/images/marquee/IdFTQF.jpg", alt: "Product shot" },
  { src: "/images/marquee/iGKtGJ.jpg", alt: "Product" },
  { src: "/images/marquee/IoECJC.jpg", alt: "Waterproof beach tote" },
  { src: "/images/marquee/JOXhL.jpg", alt: "Product" },
  { src: "/images/marquee/JPcZqD.jpg", alt: "Product shot" },
  { src: "/images/marquee/jRmxxC.jpg", alt: "Product shot" },
  { src: "/images/marquee/LbtKJI.jpg", alt: "Cooler tote bag" },
  { src: "/images/marquee/LcKtOH.jpg", alt: "Product" },
  { src: "/images/marquee/LgytCD.jpg", alt: "Product" },
  { src: "/images/marquee/lYDaXG.jpg", alt: "Product" },
  { src: "/images/marquee/MKclNC.jpg", alt: "Wedding garment bag" },
  { src: "/images/marquee/OUBNLJ.jpg", alt: "Kraft paper bag" },
  { src: "/images/marquee/PoYXGG.jpg", alt: "Product" },
  { src: "/images/marquee/PThafE.jpg", alt: "Laminated non-woven bag" },
  { src: "/images/marquee/QLiyRB.jpg", alt: "Organic cotton tote" },
  { src: "/images/marquee/QLPMwC.jpg", alt: "Product" },
  { src: "/images/marquee/qXovSK.jpg", alt: "Product" },
  { src: "/images/marquee/rFCKLB.jpg", alt: "Product" },
  { src: "/images/marquee/RMcPlK.jpg", alt: "Promotional cotton bag" },
];
