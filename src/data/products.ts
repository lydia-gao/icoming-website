import type { Product } from "./types";

/**
 * PRODUCT CATALOG — sample set for V1.
 *
 * Each product carries a descriptive summary and a generic description
 * (safe to ship). Fields that depend on real business info — specific
 * MOQ, lead time, fabric weight, dimensions — are left empty here;
 * the product page shows a clean "Spec sheet available on request"
 * block until the sales team fills them in.
 *
 * When you're ready to publish real specs for a product, replace the
 * empty `specs: []` with real spec objects, and fill in `moq` / `leadTime`.
 */

export const products: Product[] = [
  {
    slug: "promotional-cotton-canvas-tote",
    name: "Promotional Cotton Canvas Tote Bag",
    categorySlug: "cotton-bag",
    summary:
      "Classic heavyweight cotton tote with self-fabric double handles — a clean blank for custom printing.",
    description:
      "A staple for retail brands, event giveaways, and sustainability campaigns. We stock natural and black base colors with full Pantone matching on custom orders. Printing options include screen, digital, heat-transfer, and embroidery. Gusseted base, inner pocket, and zipper closure available as customizations.",
    images: ["/images/products/cotton-promotional-tote.jpg"],
    specs: [],
    customization: ["Logo print", "Custom size", "Inner pocket", "Side gusset", "Zipper closure"],
    materials: ["Cotton canvas", "Recycled cotton", "Organic cotton"],
    featured: true,
  },
  {
    slug: "recycled-canvas-shopping-bag",
    name: "Recycled Canvas Shopping Bag",
    categorySlug: "cotton-bag",
    summary:
      "Soft recycled cotton shopper — lighter weight for affordable promotional runs.",
    description:
      "Woven from recycled cotton scraps diverted from textile waste. Slightly textured finish that holds ink beautifully. Ideal for bookstores, cafés, and eco-conscious retail. Ships flat-packed to reduce freight cost.",
    images: ["/images/products/cotton-recycled-canvas.jpg"],
    specs: [],
    customization: ["Logo", "Multi-panel print", "Label tag"],
    materials: ["Recycled cotton"],
  },
  {
    slug: "water-resistant-drawstring-backpack",
    name: "Water-Resistant Drawstring Sport Backpack",
    categorySlug: "drawstring-bag",
    summary:
      "Lightweight cinch sack for gyms, schools, and outdoor events — water-resistant polyester.",
    description:
      "Durable polyester with PU coating. Reinforced bottom corners to prevent tear-through from the drawstring. Perfect for sports teams, summer camps, trade-show swag, and yoga studios.",
    images: ["/images/products/drawstring-sport.jpg"],
    specs: [],
    customization: ["Logo print", "Front zip pocket", "Headphone port", "Reflective trim"],
    materials: ["Polyester 210D", "Nylon", "Cotton (on request)"],
    featured: true,
  },
  {
    slug: "food-delivery-insulated-backpack",
    name: "Insulated Food Delivery Backpack",
    categorySlug: "cooler-bag",
    summary:
      "Heavy-duty thermal backpack for restaurants and couriers.",
    description:
      "Oxford polyester shell with foam insulation and food-safe lining. Reinforced padded straps, waterproof zipper, and a clear pocket for delivery receipts. Popular with local restaurants and gig-economy platforms.",
    images: ["/images/products/cooler-delivery-backpack.jpg"],
    specs: [],
    customization: ["Logo print / embroidery", "Custom size", "Dual compartments", "Reflective strip"],
    materials: ["Oxford polyester", "Non-woven laminated"],
    featured: true,
  },
  {
    slug: "folding-non-woven-shopping-tote",
    name: "Folding Non-Woven Shopping Tote",
    categorySlug: "non-woven-bag",
    summary:
      "Budget-friendly reusable PP non-woven tote that folds into an integrated pouch.",
    description:
      "Recyclable PP non-woven fabric — affordable for large-volume promotional runs. Flat-packs into an internal pouch. A staple for supermarkets, pharmacies, and conference giveaways.",
    images: ["/images/products/non-woven-folding.jpg"],
    specs: [],
    customization: ["Multi-color print", "Gusset reinforcement", "Lamination (matte/gloss)"],
    materials: ["PP non-woven", "Laminated non-woven", "RPET non-woven"],
    featured: true,
  },
  {
    slug: "brown-kraft-paper-bag-handles",
    name: "Recycled Kraft Paper Bag with Handles",
    categorySlug: "paper-bag",
    summary:
      "Brown kraft shopper with twisted paper handles — retail-ready packaging.",
    description:
      "Made from recycled kraft paper. Twisted paper handles glued to an internal reinforcement patch for extra load strength. Perfect for boutique retail, bakeries, and takeaway.",
    images: ["/images/products/paper-kraft-handles.jpg"],
    specs: [],
    customization: ["Flexo / offset print", "Hot stamping", "Debossing", "Die-cut window"],
    materials: ["Recycled kraft", "White kraft", "Coated art paper"],
  },
  {
    slug: "eco-jute-burlap-tote",
    name: "Eco Jute Burlap Tote Bag",
    categorySlug: "jute-bag",
    summary:
      "Naturally biodegradable jute tote — premium eco gift packaging.",
    description:
      "Woven from natural jute fiber. Laminated interior option for water resistance. Ideal for wine gift sets, eco-retail, wedding favors, and hotel amenity packaging.",
    images: ["/images/products/jute-burlap-tote.jpg"],
    specs: [],
    customization: ["Screen print", "Heat transfer", "Leather patch label"],
    materials: ["Jute", "Jute–cotton blend"],
  },
  {
    slug: "canvas-zipper-cosmetic-pouch",
    name: "Canvas Zipper Cosmetic Pouch",
    categorySlug: "cosmetic-bag",
    summary:
      "Multi-purpose cotton-canvas zipper pouch — for toiletries, DIY craft, or retail packaging.",
    description:
      "Cotton canvas with a smooth metal zipper. A flat-base variant stands upright on a counter. Great for makeup brands, craft kits, and corporate welcome gifts.",
    images: ["/images/products/cosmetic-canvas-pouch.jpg"],
    specs: [],
    customization: ["Digital print", "Embroidery", "Woven tag"],
    materials: ["Cotton canvas", "Linen", "PU leather accent"],
  },
  {
    slug: "non-woven-wedding-dress-cover",
    name: "Non-Woven Wedding Dress Garment Bag",
    categorySlug: "garment-bag",
    summary:
      "Breathable non-woven dress cover with optional clear window and full-length zipper.",
    description:
      "Designed for bridal boutiques, tailors, and costume rental. Breathable non-woven fabric prevents mildew while protecting the garment. Optional PEVA window and custom bottom gusset for ball gowns.",
    images: ["/images/products/garment-wedding-cover.jpg"],
    specs: [],
    customization: ["Logo print", "Custom size", "Foldable design", "Hanger hole shape"],
    materials: ["PP non-woven", "RPET non-woven", "PEVA"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}
