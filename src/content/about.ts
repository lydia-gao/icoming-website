import type { Locale } from "@/lib/i18n";
import { categories } from "@/data/categories";
import { placeholder } from "./_types";

/**
 * ABOUT PAGE CONTENT — bilingual
 *
 * The "Today" timeline entry references categories.length so the
 * category count stays in sync as the catalog evolves (Phase 6
 * product CMS will add/remove categories).
 */

const en = {
  hero: {
    eyebrow: "About us",
    headline: "A Pingyang factory making bags for overseas brands.",
    body: "Pingyang ICom Bag Co., Ltd. is a manufacturer based in Pingyang, Zhejiang. We design, produce, and ship shopping bags, non-woven bags, packaging bags, garment covers, and food-delivery bags — mostly private-label and OEM orders for overseas brands.",
  },

  story: {
    eyebrow: "Our story",
    heading: "From trader to manufacturer.",
    paragraphs: [
      "We started as a foreign-trade company sourcing bags for overseas customers. After years of factory visits, sampling runs, and cost negotiations, our customers pushed us to set up our own production so quality could be controlled at the source.",
      "The factory sits in Pingyang County; the sales office is in Wenzhou City. 3,000 m² of production floor, around 60 workers, and dedicated overseas-sales teams for every account.",
      "Most of our customers find us through industry sourcing platforms — and stay with us for years because they can reach the people running the production floor directly.",
    ],
  },

  timeline: {
    eyebrow: "Milestones",
    heading: "Our journey so far.",
    entries: [
      {
        year: "2006",
        title: "Founded",
        body: "Pingyang ICom Bag Co., Ltd. established as a foreign-trade company serving overseas bag buyers.",
      },
      placeholder(
        "Milestone #2",
        "Optional: add a key milestone (e.g. year you opened your own factory, first major overseas client, first product line expansion).",
      ),
      placeholder(
        "Milestone #3",
        "Optional: add another milestone (e.g. expansion into cooler/garment bags, certification achievement, major trade-show launch).",
      ),
      {
        year: "Today",
        title: "Serving brands worldwide",
        body: `Two sales teams, a dedicated sampling room, and a product catalog spanning ${categories.length} categories.`,
      },
    ],
  },

  values: {
    eyebrow: "What we value",
    heading: "How we operate.",
    items: [
      {
        title: "Sustainability as default",
        body: "We lead with recyclable, biodegradable, and recycled fabrics. Plastic-free packaging on request.",
      },
      {
        title: "Transparent communication",
        body: "Honest lead times, honest quantities, honest pricing — no intermediaries filtering your messages.",
      },
      {
        title: "Long-term partnership",
        body: "Many of our customers have worked with us for years. We're not optimizing for the one-off deal.",
      },
    ],
  },

  factoryStrength: {
    eyebrow: "Factory strength",
    heading: "Verified capabilities and credentials.",
    body:
      "SGS-assessed via Alibaba.com. Full certification documents and test reports available on request.",
  },

  events: {
    eyebrow: "Events & trade shows",
    heading: "Meet us in person.",
    intro:
      "We attend industry trade shows throughout the year and welcome customer visits to our Pingyang facility. A few recent photos below.",
    gallery: {
      tradeshows: {
        title: "Trade shows",
        photos: [
          { src: "/images/events/tradeshow-1.jpg", caption: "Booth — buyers walkthrough" },
          { src: "/images/events/tradeshow-2.jpg", caption: "Sample wall" },
          { src: "/images/events/tradeshow-3.jpg", caption: "Catalog handover" },
          { src: "/images/events/tradeshow-4.jpg", caption: "Booth — full view" },
        ],
      },
      factory: {
        title: "Inside the factory",
        photos: placeholder(
          "Factory walkthrough photos",
          "Add 4-6 production-floor shots: sewing stations, cutting tables, fabric rolls, QC, packing area. Save into /public/images/factory/ and list them here.",
        ),
      },
      team: {
        title: "Office & team",
        photos: placeholder(
          "Office / team photos",
          "Add 2-4 office shots: sales-team workspace, sample room, group portrait if comfortable. Save into /public/images/team/ and list them here.",
        ),
      },
    },
  },

  cta: {
    heading: "Visit our factory (virtually or in person).",
    body: "We're happy to share a live walkthrough over video call, or host you at our Pingyang facility.",
    primary: { label: "Contact us", href: "/contact" },
    secondary: { label: "See capabilities", href: "/capabilities" },
  },
};

const zh: typeof en = {
  hero: {
    eyebrow: "关于我们",
    headline: "为全球品牌制袋的温州平阳工厂。",
    body: "平阳爱康箱包有限公司是一家工贸一体的制袋企业,自主完成研发、生产与销售,主要承接海外品牌的 OEM 与代工订单。产品涵盖购物袋、无纺布袋、包装袋、西服袋及外卖保温袋。",
  },

  story: {
    eyebrow: "我们的故事",
    heading: "从外贸商到自有工厂。",
    paragraphs: [
      "我们最初是一家纯外贸公司,为海外客户采购各类箱包。多年的工厂走访、打样和成本谈判之后,客户推动我们自建生产线,把品质从源头管起来。",
      "工厂位于平阳县,业务部门设在温州市。3,000 m² 的生产车间、约 60 名工人,以及专门服务海外客户的业务团队。",
      "多数客户是通过行业采购平台找到我们的——之所以能够长期合作,是因为他们可以随时直接与车间负责人沟通。",
    ],
  },

  timeline: {
    eyebrow: "发展历程",
    heading: "我们的成长轨迹。",
    entries: [
      {
        year: "2006",
        title: "公司成立",
        body: "平阳爱康箱包有限公司成立,以外贸公司身份服务海外箱包买家。",
      },
      placeholder(
        "里程碑 #2",
        "可选:补充一项重要里程碑(例如自建工厂的年份、首个重要海外客户、首条新产品线的拓展)。",
      ),
      placeholder(
        "里程碑 #3",
        "可选:再补充一项里程碑(例如拓展保温袋/西服袋产品线、获得认证、参加重要展会)。",
      ),
      {
        year: "至今",
        title: "服务全球品牌",
        body: `两支销售团队、独立打样间,以及涵盖 ${categories.length} 个品类的产品目录。`,
      },
    ],
  },

  values: {
    eyebrow: "我们的价值观",
    heading: "我们的经营方式。",
    items: [
      {
        title: "环保为标配",
        body: "优先采用可回收、可降解和再生面料。如有需求,可提供无塑料包装。",
      },
      {
        title: "透明沟通",
        body: "交期透明、产能透明、价格透明——没有中间环节过滤您的信息。",
      },
      {
        title: "长期合作",
        body: "多数客户与我们合作多年。我们追求的不是一次性的订单。",
      },
    ],
  },

  factoryStrength: {
    eyebrow: "工厂实力",
    heading: "经核验的产能与资质。",
    body:
      "已通过 SGS 在阿里巴巴的实地认证,完整证书与测试报告可根据需求提供。",
  },

  events: {
    eyebrow: "展会与活动",
    heading: "期待与您面对面。",
    intro:
      "我们全年参加多场行业展会,也欢迎客户到平阳工厂实地考察。以下是近期的一些照片。",
    gallery: {
      tradeshows: {
        title: "展会现场",
        photos: [
          { src: "/images/events/tradeshow-1.jpg", caption: "展位 — 客户洽谈" },
          { src: "/images/events/tradeshow-2.jpg", caption: "样品墙" },
          { src: "/images/events/tradeshow-3.jpg", caption: "目录交接" },
          { src: "/images/events/tradeshow-4.jpg", caption: "展位全景" },
        ],
      },
      factory: {
        title: "工厂内部",
        photos: placeholder(
          "工厂走访照片",
          "请提供 4-6 张生产现场照片:车缝工位、裁剪台、面料卷、品检、打包区。保存至 /public/images/factory/,并在此处列出。",
        ),
      },
      team: {
        title: "办公室与团队",
        photos: placeholder(
          "办公室 / 团队照片",
          "请提供 2-4 张办公室照片:销售团队工位、打样间、合影(如方便)。保存至 /public/images/team/,并在此处列出。",
        ),
      },
    },
  },

  cta: {
    heading: "欢迎参观我们的工厂(线上或线下均可)。",
    body: "我们很乐意通过视频通话带您实时参观,或邀请您亲自到访我们的平阳工厂。",
    primary: { label: "联系我们", href: "/contact" },
    secondary: { label: "查看生产能力", href: "/capabilities" },
  },
};

export const aboutContent: Record<Locale, typeof en> = { en, zh };
