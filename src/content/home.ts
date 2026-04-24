import type { Locale } from "@/lib/i18n";
import { placeholder, type Metric } from "./_types";

/**
 * HOME PAGE CONTENT — bilingual
 * -----------------------------
 * Both languages MUST share the same shape (enforced by `typeof en`).
 * To add/remove a section, update both languages.
 *
 * Non-developers: search for `placeholder(` to find items that still
 * need real business info.
 */

const en = {
  hero: {
    eyebrow: "Pingyang · Wenzhou, China",
    headline: "Eco-friendly bag manufacturing, built on trust.",
    subheadline:
      "A family-run factory producing cotton totes, non-woven shoppers, cooler bags, and custom packaging for brands, retailers, and distributors worldwide.",
    primaryCta: { label: "Browse products", href: "/products" },
    secondaryCta: { label: "See capabilities", href: "/capabilities" },
  },

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

const zh: typeof en = {
  hero: {
    eyebrow: "中国浙江 · 温州平阳",
    headline: "以信任为本的环保袋制造。",
    subheadline:
      "一家家族经营的工厂,为全球品牌、零售商及分销商生产棉布手提袋、无纺布购物袋、保温袋及定制包装。",
    primaryCta: { label: "浏览产品", href: "/products" },
    secondaryCta: { label: "了解生产能力", href: "/capabilities" },
  },

  heroMetrics: [
    { label: "成立年份", value: "2006" },
    { label: "厂房面积", value: "2,000 m²" },
    { label: "团队规模", value: "约 30 人" },
    placeholder(
      "出口区域",
      "请确认目前出货的国家/地区,例如 '北美、欧盟、澳洲、东南亚'。",
    ),
  ] satisfies Metric[],

  sections: {
    categories: {
      eyebrow: "产品分类",
      heading: "一家工厂,多条产品线。",
      body:
        "从棉布购物袋到保温外卖背包,模具开发与材料经验都集中在同一屋檐下——客户可以在一家供应商处完成整条袋类产品的采购。",
    },

    editorial: {
      eyebrow: "用心制作",
      heading: "安静的匠心,始终如一的品质。",
      body:
        "每一件产品出厂前都经过检验。多数客户与我们合作多年——因为他们可以直接与车间的负责人对话。",
      left: {
        image: "/images/editorial/corduroy-duo-white.jpg",
        caption: "灯芯绒手提袋 — 本色与黑色",
      },
      right: {
        image: "/images/editorial/drawstring-styled.jpg",
        caption: "透明束口袋 — 场景实拍",
      },
    },

    featured: {
      eyebrow: "精选产品",
      heading: "几款代表性款式。",
      body:
        "成熟的基础款式,支持全方位定制——材质、尺寸、印刷及后道工艺均可根据品牌需求调整。",
    },

    process: {
      eyebrow: "合作流程",
      heading: "从需求到交付的四步流程,稳定可控。",
      steps: [
        { step: "01", title: "分享需求", body: "参考图、目标数量、销售市场及交期。" },
        { step: "02", title: "报价与打样", body: "成本报价,随后提供量产前样品供您确认。" },
        { step: "03", title: "确认与生产", body: "确认稿件、材料及规格书后进入量产。" },
        { step: "04", title: "品控与发货", body: "装柜前最终检验;支持 FOB、EXW 及 CIF 贸易条款。" },
      ],
    },

    trust: {
      eyebrow: "资质",
      heading: "经核验的供应商资质。",
      body:
        "我们通过 SGS 阿里巴巴实地认证。完整证书资料可根据需求提供。",
    },

    finalCta: {
      heading: "准备开发下一款新袋?",
      body:
        "将心仪的产品加入询盘清单——告知我们品牌、目标数量及市场,我们将在一个工作日内回复。",
      primary: { label: "开始浏览", href: "/products" },
      secondary: { label: "联系销售", href: "/contact" },
    },
  },
};

export const homeContent: Record<Locale, typeof en> = { en, zh };

const marqueeTilesEn = [
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

const altZh: Record<string, string> = {
  "Cotton bag": "棉布袋",
  "Transparent cosmetic pouch": "透明化妆袋",
  "Paper shopping bag": "纸质购物袋",
  "Mesh bag": "网眼袋",
  "Mini jute tote": "迷你黄麻手提袋",
  "Mesh produce bag": "网眼果蔬袋",
  "Mesh shopping bag": "网眼购物袋",
  "Canvas specialty bag": "帆布特色袋",
  "Cooler bag": "保温袋",
  "Canvas bag": "帆布袋",
  "Polyester drawstring bag": "涤纶束口袋",
  "Kraft shopping bag": "牛皮纸购物袋",
  "Felt tote": "毛毡手提袋",
  "Product": "产品",
  "Shopping trolley bag": "购物拉杆袋",
  "Printed canvas bag": "印花帆布袋",
  "Product shot": "产品实拍",
  "Folding trolley bag": "可折叠拉杆袋",
  "Grocery shopping bag": "超市购物袋",
  "Felt storage bag": "毛毡收纳袋",
  "Waterproof beach tote": "防水沙滩手提袋",
  "Cooler tote bag": "保温手提袋",
  "Wedding garment bag": "婚纱防尘罩",
  "Kraft paper bag": "牛皮纸袋",
  "Laminated non-woven bag": "覆膜无纺布袋",
  "Organic cotton tote": "有机棉手提袋",
  "Promotional cotton bag": "宣传用棉布袋",
};

export const marqueeTiles: Record<Locale, { src: string; alt: string }[]> = {
  en: marqueeTilesEn,
  zh: marqueeTilesEn.map((t) => ({ src: t.src, alt: altZh[t.alt] ?? t.alt })),
};
