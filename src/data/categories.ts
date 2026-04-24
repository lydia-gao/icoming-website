import type { Locale } from "@/lib/i18n";
import type { Category } from "./types";

/**
 * Categories live in English; each may carry a `translations` overlay
 * keyed by non-default locales. Missing translation keys fall back to
 * the English field at resolve time.
 */

export const categories: Category[] = [
  {
    slug: "cotton-bag",
    name: "Cotton & Canvas Bags",
    shortDescription:
      "Reusable cotton totes and canvas shoppers for retail, promotions, and daily use.",
    longDescription:
      "Made from organic or recycled cotton canvas. Fully customizable with screen print, digital print, embroidery, or heat transfer.",
    heroImage: "/images/categories/cotton.jpg",
    translations: {
      zh: {
        name: "棉布与帆布袋",
        shortDescription: "可重复使用的棉布手提袋与帆布购物袋,适用于零售、宣传及日常使用。",
        longDescription: "采用有机棉或再生棉帆布制作。支持丝网印刷、数码印刷、刺绣及热转印等多种定制方式。",
      },
    },
  },
  {
    slug: "non-woven-bag",
    name: "Non-Woven Bags",
    shortDescription:
      "Affordable, recyclable PP non-woven shopping totes in any shape, color, and size.",
    heroImage: "/images/categories/non-woven.jpg",
    translations: {
      zh: {
        name: "无纺布袋",
        shortDescription: "经济实惠、可回收的 PP 无纺布购物袋,支持任意形状、颜色及尺寸。",
      },
    },
  },
  {
    slug: "cooler-bag",
    name: "Cooler & Thermal Bags",
    shortDescription:
      "Insulated lunch and food-delivery bags with waterproof PEVA or aluminum lining.",
    heroImage: "/images/categories/cooler.jpg",
    translations: {
      zh: {
        name: "保温袋",
        shortDescription: "保温午餐袋与外卖袋,配防水 PEVA 或铝箔内衬。",
      },
    },
  },
  {
    slug: "drawstring-bag",
    name: "Drawstring Backpacks",
    shortDescription:
      "Lightweight polyester, cotton, or nylon cinch sacks for sports, schools, and events.",
    heroImage: "/images/categories/drawstring.jpg",
    translations: {
      zh: {
        name: "束口背包",
        shortDescription: "轻便的涤纶、棉布或尼龙束口袋,适用于运动、校园及活动。",
      },
    },
  },
  {
    slug: "garment-bag",
    name: "Garment & Suit Covers",
    shortDescription:
      "Non-woven and PEVA garment bags for suits, dresses, and wedding gowns.",
    heroImage: "/images/categories/garment.jpg",
    translations: {
      zh: {
        name: "西服袋与防尘罩",
        shortDescription: "无纺布及 PEVA 材质的服装袋,适用于西装、礼服及婚纱。",
      },
    },
  },
  {
    slug: "paper-bag",
    name: "Paper Bags",
    shortDescription:
      "Kraft and coated paper shoppers with twisted, flat, or rope handles.",
    heroImage: "/images/categories/paper.jpg",
    translations: {
      zh: {
        name: "纸袋",
        shortDescription: "牛皮纸及涂层纸购物袋,可选纸绳、扁纸或绳子提手。",
      },
    },
  },
  {
    slug: "jute-bag",
    name: "Jute & Burlap Bags",
    shortDescription:
      "Natural jute totes with custom printing — biodegradable and durable.",
    heroImage: "/images/categories/jute.jpg",
    translations: {
      zh: {
        name: "黄麻袋",
        shortDescription: "天然黄麻手提袋,支持定制印刷——可降解且耐用。",
      },
    },
  },
  {
    slug: "cosmetic-bag",
    name: "Cosmetic & Toiletry Bags",
    shortDescription:
      "Makeup pouches, travel toiletry bags, and jewelry pouches in canvas, PVC, velvet, or PU.",
    heroImage: "/images/categories/cosmetic.jpg",
    translations: {
      zh: {
        name: "化妆包与洗漱包",
        shortDescription: "化妆包、旅行洗漱包及首饰袋,可选帆布、PVC、天鹅绒及 PU 材质。",
      },
    },
  },
  {
    slug: "folding-bag",
    name: "Folding Shopping Bags",
    shortDescription:
      "Compact polyester and nylon fold-up bags that slip into a pocket or pouch.",
    heroImage: "/images/categories/folding.jpg",
    translations: {
      zh: {
        name: "折叠购物袋",
        shortDescription: "小巧的涤纶及尼龙可折叠袋,可收纳至口袋或小袋中。",
      },
    },
  },
  {
    slug: "food-bag",
    name: "Food Delivery Bags",
    shortDescription:
      "Heavy-duty insulated backpacks and totes for restaurants and food delivery.",
    heroImage: "/images/categories/food.jpg",
    translations: {
      zh: {
        name: "外卖送餐袋",
        shortDescription: "重型保温背包及手提袋,适用于餐厅及外卖配送。",
      },
    },
  },
  {
    slug: "felt-bag",
    name: "Felt Bags",
    shortDescription:
      "Wool and synthetic felt tote and storage bags with a premium, minimal feel.",
    heroImage: "/images/categories/felt.jpg",
    translations: {
      zh: {
        name: "毛毡袋",
        shortDescription: "羊毛及合成毛毡手提袋与收纳袋,简约高级的质感。",
      },
    },
  },
  {
    slug: "cart-shopping-bag",
    name: "Cart & Trolley Bags",
    shortDescription:
      "Wheeled foldable shopping trolleys and heavy-duty grocery cart bags.",
    heroImage: "/images/categories/cart.jpg",
    translations: {
      zh: {
        name: "购物拉杆袋",
        shortDescription: "带轮可折叠购物拉杆车及重型超市购物袋。",
      },
    },
  },
  {
    slug: "mesh-bag",
    name: "Mesh & Produce Bags",
    shortDescription:
      "Reusable mesh bags for produce, laundry, and zero-waste shopping.",
    heroImage: "/images/categories/mesh.jpg",
    translations: {
      zh: {
        name: "网眼与果蔬袋",
        shortDescription: "可重复使用的网眼袋,适用于果蔬、洗衣及零废弃购物。",
      },
    },
  },
  {
    slug: "shoe-bag",
    name: "Shoe Bags",
    shortDescription:
      "Travel and storage shoe pouches in cotton, non-woven, or waterproof fabric.",
    heroImage: "/images/categories/shoe.jpg",
    translations: {
      zh: {
        name: "鞋袋",
        shortDescription: "旅行及收纳用鞋袋,可选棉布、无纺布或防水面料。",
      },
    },
  },
  {
    slug: "zipper-pouches",
    name: "Zipper Pouches",
    shortDescription:
      "Resealable stand-up and flat zipper pouches for retail packaging.",
    heroImage: "/images/categories/zipper.jpg",
    translations: {
      zh: {
        name: "拉链袋",
        shortDescription: "可重复开合的自立款及平底款拉链袋,适用于零售包装。",
      },
    },
  },
  {
    slug: "dupont-paper-bag",
    name: "DuPont Paper Bags",
    shortDescription:
      "Lightweight, tear-resistant Tyvek-style DuPont paper totes and pouches.",
    heroImage: "/images/categories/dupont.jpg",
    translations: {
      zh: {
        name: "杜邦纸袋",
        shortDescription: "轻质抗撕的 Tyvek 杜邦纸手提袋及收纳袋。",
      },
    },
  },
  {
    slug: "canvas-bag",
    name: "Canvas Specialty Bags",
    shortDescription:
      "Specialty canvas designs: yoga mat carriers, pencil cases, craft pouches.",
    heroImage: "/images/categories/canvas.jpg",
    translations: {
      zh: {
        name: "帆布专款",
        shortDescription: "特色帆布款式:瑜伽垫袋、笔袋、手工收纳包。",
      },
    },
  },
];

/** Resolve a category for a given locale, merging translation overlay over English. */
export function resolveCategory(category: Category, locale: Locale): Category {
  if (locale === "en") return category;
  const overlay = category.translations?.[locale as Exclude<Locale, "en">];
  if (!overlay) return category;
  return { ...category, ...overlay };
}

export function getLocalizedCategories(locale: Locale): Category[] {
  return categories.map((c) => resolveCategory(c, locale));
}

export function getCategoryBySlug(slug: string, locale: Locale = "en"): Category | undefined {
  const c = categories.find((c) => c.slug === slug);
  return c ? resolveCategory(c, locale) : undefined;
}
