import type { Locale } from "@/lib/i18n";
import type { Product } from "./types";

/**
 * PRODUCT CATALOG — sample set for V1 (bilingual overlay).
 *
 * Each product's English fields are the source of truth. Chinese (and
 * future locales) live under `translations.zh` as optional overlays:
 * any field you don't override falls back to English.
 *
 * Fields that depend on real business info — specific MOQ, lead time,
 * fabric weight, dimensions — are left empty here; the product page
 * shows a clean "Spec sheet available on request" block until the
 * sales team fills them in.
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
    translations: {
      zh: {
        name: "宣传用全棉帆布手提袋",
        summary: "厚磅全棉帆布手提袋,配同色双提手——适合定制印刷的经典空白款。",
        description:
          "零售品牌、活动赠品及可持续推广的常备款。本色与黑色为常备色,定制订单可按 Pantone 精准对色。印刷方式包括丝印、数码、热转印和刺绣。可选增加加宽底、内袋及拉链封口。",
        customization: ["Logo 印刷", "定制尺寸", "内袋", "侧边底", "拉链封口"],
        materials: ["棉帆布", "再生棉", "有机棉"],
      },
    },
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
    translations: {
      zh: {
        name: "再生棉帆布购物袋",
        summary: "柔软的再生棉购物袋——克重更轻,适合高性价比的宣传批次。",
        description:
          "采用纺织废料中回收的再生棉纤维织造。表面略带纹理,印刷着色效果出色。适合书店、咖啡馆及环保型零售。可平铺包装,降低运费。",
        customization: ["Logo", "多面印刷", "标签吊牌"],
        materials: ["再生棉"],
      },
    },
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
    translations: {
      zh: {
        name: "防泼水束口运动背包",
        summary: "轻便的束口袋,适用于健身房、学校及户外活动——防泼水涤纶面料。",
        description:
          "耐磨涤纶配 PU 涂层。底部加强设计,防止束绳撕裂。适用于运动队、夏令营、展会礼品及瑜伽馆。",
        customization: ["Logo 印刷", "前拉链口袋", "耳机线孔", "反光条"],
        materials: ["210D 涤纶", "尼龙", "棉布(可选)"],
      },
    },
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
    translations: {
      zh: {
        name: "保温外卖背包",
        summary: "重型保温背包,适用于餐厅及外卖员。",
        description:
          "牛津涤纶外壳,配泡沫保温层及食品级内衬。加厚肩带、防水拉链,并带有放置订单小票的透明口袋。广泛用于本地餐厅及众包外卖平台。",
        customization: ["Logo 印刷/刺绣", "定制尺寸", "双隔层", "反光条"],
        materials: ["牛津涤纶", "覆膜无纺布"],
      },
    },
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
    translations: {
      zh: {
        name: "可折叠无纺布购物袋",
        summary: "经济实惠的可重复使用 PP 无纺布袋——可折叠收纳至内置小袋。",
        description:
          "可回收 PP 无纺布——大批量宣传订单的高性价比选择。可折叠至内置小袋。超市、药房及会议礼品的常用款。",
        customization: ["多色印刷", "底部加强", "覆膜(亚光/亮光)"],
        materials: ["PP 无纺布", "覆膜无纺布", "RPET 无纺布"],
      },
    },
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
    translations: {
      zh: {
        name: "带提手的再生牛皮纸袋",
        summary: "棕色牛皮纸购物袋,配纸绳提手——零售级包装。",
        description:
          "采用再生牛皮纸制作。纸绳提手通过内部加强贴片粘接,承重更强。适合精品零售、面包店及外带场景。",
        customization: ["柔印 / 胶印", "烫金", "压凹", "模切开窗"],
        materials: ["再生牛皮纸", "白牛皮纸", "涂层艺术纸"],
      },
    },
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
    translations: {
      zh: {
        name: "环保黄麻手提袋",
        summary: "天然可降解的黄麻手提袋——高端环保礼品包装。",
        description:
          "采用天然黄麻纤维织造。可选覆膜内衬提升防水性。适合红酒礼盒、环保零售、婚礼伴手礼及酒店洗漱用品包装。",
        customization: ["丝网印刷", "热转印", "皮质标签"],
        materials: ["黄麻", "黄麻棉混纺"],
      },
    },
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
    translations: {
      zh: {
        name: "帆布拉链化妆包",
        summary: "多用途棉帆布拉链包——适用于洗漱用品、DIY 手工或零售包装。",
        description:
          "棉帆布配顺滑金属拉链。平底款可在桌面直立放置。适合化妆品牌、手工套装及企业欢迎礼包。",
        customization: ["数码印刷", "刺绣", "织唛标"],
        materials: ["棉帆布", "亚麻", "PU 皮革配饰"],
      },
    },
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
    translations: {
      zh: {
        name: "无纺布婚纱防尘罩",
        summary: "透气无纺布婚纱防尘罩,可选透明视窗及全长拉链。",
        description:
          "专为婚纱店、裁缝及礼服租赁设计。透气无纺布防止发霉的同时保护衣物。可选 PEVA 视窗和定制底部加宽,适配大蓬裙。",
        customization: ["Logo 印刷", "定制尺寸", "折叠设计", "衣架孔形状"],
        materials: ["PP 无纺布", "RPET 无纺布", "PEVA"],
      },
    },
  },
];

/** Resolve a product for a given locale, merging translation overlay over English. */
export function resolveProduct(product: Product, locale: Locale): Product {
  if (locale === "en") return product;
  const overlay = product.translations?.[locale as Exclude<Locale, "en">];
  if (!overlay) return product;
  return { ...product, ...overlay };
}

export function getLocalizedProducts(locale: Locale): Product[] {
  return products.map((p) => resolveProduct(p, locale));
}

export function getProductBySlug(slug: string, locale: Locale = "en"): Product | undefined {
  const p = products.find((p) => p.slug === slug);
  return p ? resolveProduct(p, locale) : undefined;
}

export function getProductsByCategory(categorySlug: string, locale: Locale = "en"): Product[] {
  return products
    .filter((p) => p.categorySlug === categorySlug)
    .map((p) => resolveProduct(p, locale));
}

export function getFeaturedProducts(limit = 4, locale: Locale = "en"): Product[] {
  return products
    .filter((p) => p.featured)
    .slice(0, limit)
    .map((p) => resolveProduct(p, locale));
}
