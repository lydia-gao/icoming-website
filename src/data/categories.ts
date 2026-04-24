import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "cotton-bag",
    name: "Cotton & Canvas Bags",
    shortDescription:
      "Reusable cotton totes and canvas shoppers for retail, promotions, and daily use.",
    longDescription:
      "Made from organic or recycled cotton canvas. Fully customizable with screen print, digital print, embroidery, or heat transfer.",
    heroImage: "/images/categories/cotton.jpg",
  },
  {
    slug: "non-woven-bag",
    name: "Non-Woven Bags",
    shortDescription:
      "Affordable, recyclable PP non-woven shopping totes in any shape, color, and size.",
    heroImage: "/images/categories/non-woven.jpg",
  },
  {
    slug: "cooler-bag",
    name: "Cooler & Thermal Bags",
    shortDescription:
      "Insulated lunch and food-delivery bags with waterproof PEVA or aluminum lining.",
    heroImage: "/images/categories/cooler.jpg",
  },
  {
    slug: "drawstring-bag",
    name: "Drawstring Backpacks",
    shortDescription:
      "Lightweight polyester, cotton, or nylon cinch sacks for sports, schools, and events.",
    heroImage: "/images/categories/drawstring.jpg",
  },
  {
    slug: "garment-bag",
    name: "Garment & Suit Covers",
    shortDescription:
      "Non-woven and PEVA garment bags for suits, dresses, and wedding gowns.",
    heroImage: "/images/categories/garment.jpg",
  },
  {
    slug: "paper-bag",
    name: "Paper Bags",
    shortDescription:
      "Kraft and coated paper shoppers with twisted, flat, or rope handles.",
    heroImage: "/images/categories/paper.jpg",
  },
  {
    slug: "jute-bag",
    name: "Jute & Burlap Bags",
    shortDescription:
      "Natural jute totes with custom printing — biodegradable and durable.",
    heroImage: "/images/categories/jute.jpg",
  },
  {
    slug: "cosmetic-bag",
    name: "Cosmetic & Toiletry Bags",
    shortDescription:
      "Makeup pouches, travel toiletry bags, and jewelry pouches in canvas, PVC, velvet, or PU.",
    heroImage: "/images/categories/cosmetic.jpg",
  },
  {
    slug: "folding-bag",
    name: "Folding Shopping Bags",
    shortDescription:
      "Compact polyester and nylon fold-up bags that slip into a pocket or pouch.",
    heroImage: "/images/categories/folding.jpg",
  },
  {
    slug: "food-bag",
    name: "Food Delivery Bags",
    shortDescription:
      "Heavy-duty insulated backpacks and totes for restaurants and food delivery.",
    heroImage: "/images/categories/food.jpg",
  },
  {
    slug: "felt-bag",
    name: "Felt Bags",
    shortDescription:
      "Wool and synthetic felt tote and storage bags with a premium, minimal feel.",
    heroImage: "/images/categories/felt.jpg",
  },
  {
    slug: "cart-shopping-bag",
    name: "Cart & Trolley Bags",
    shortDescription:
      "Wheeled foldable shopping trolleys and heavy-duty grocery cart bags.",
    heroImage: "/images/categories/cart.jpg",
  },
  {
    slug: "mesh-bag",
    name: "Mesh & Produce Bags",
    shortDescription:
      "Reusable mesh bags for produce, laundry, and zero-waste shopping.",
    heroImage: "/images/categories/mesh.jpg",
  },
  {
    slug: "shoe-bag",
    name: "Shoe Bags",
    shortDescription:
      "Travel and storage shoe pouches in cotton, non-woven, or waterproof fabric.",
    heroImage: "/images/categories/shoe.jpg",
  },
  {
    slug: "zipper-pouches",
    name: "Zipper Pouches",
    shortDescription:
      "Resealable stand-up and flat zipper pouches for retail packaging.",
    heroImage: "/images/categories/zipper.jpg",
  },
  {
    slug: "dupont-paper-bag",
    name: "DuPont Paper Bags",
    shortDescription:
      "Lightweight, tear-resistant Tyvek-style DuPont paper totes and pouches.",
    heroImage: "/images/categories/dupont.jpg",
  },
  {
    slug: "canvas-bag",
    name: "Canvas Specialty Bags",
    shortDescription:
      "Specialty canvas designs: yoga mat carriers, pencil cases, craft pouches.",
    heroImage: "/images/categories/canvas.jpg",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
