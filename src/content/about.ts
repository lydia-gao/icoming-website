import type { Locale } from "@/lib/i18n";
import { placeholder } from "./_types";

/**
 * ABOUT PAGE CONTENT — bilingual
 */

const en = {
  hero: {
    eyebrow: "About us",
    headline: "A family factory making bags for the world's brands.",
    body: "Pingyang ICom Bag Co., Ltd. is an industrial-and-trade company specializing in the research, development, production, and sales of shopping bags, non-woven bags, packaging bags, suit covers, and takeaway insulation bags.",
  },

  story: {
    eyebrow: "Our story",
    heading: "From trader to trusted manufacturer.",
    paragraphs: [
      "We started out as a pure foreign-trade company, sourcing bags for overseas clients. After years of factory visits, sampling runs, and cost negotiations, our clients pushed us to set up our own production so quality could be locked in at the source.",
      "The factory is located in Pingyang County; the business department is in Wenzhou City. We run a 2,000 m² production floor with roughly 30 workers and dedicated business teams for overseas accounts.",
      "Most of our customers find us through industry sourcing platforms — and stay with us for years because they can talk to the same people who run the factory floor.",
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
        body: "Two sales teams, a dedicated sampling room, and a product catalog spanning 17 categories.",
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
        body: "Honest lead times, honest quantities, honest pricing. No intermediaries filtering messages.",
      },
      {
        title: "Long-term partnership",
        body: "Many of our customers have worked with us for years. We're not optimizing for the one-off deal.",
      },
    ],
  },

  events: {
    eyebrow: "Events & trade shows",
    heading: "Meet us in person.",
    body: placeholder(
      "Trade-show history",
      "List which trade shows you attend (HK Printing & Packaging Fair, Canton Fair, etc.) and the most recent ones, with dates. Trade-show photos are already available in /public/images/events/.",
    ),
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
    headline: "为全球品牌制袋的家族工厂。",
    body: "平阳爱康箱包有限公司是一家工贸一体的企业,专注于购物袋、无纺布袋、包装袋、西服袋以及外卖保温袋的研发、生产与销售。",
  },

  story: {
    eyebrow: "我们的故事",
    heading: "从外贸商到值得信赖的制造商。",
    paragraphs: [
      "我们最初是一家纯外贸公司,为海外客户采购各类箱包。经过多年的工厂走访、打样和成本谈判,客户鼓励我们建立自己的生产基地,将品质从源头锁定。",
      "工厂位于平阳县,业务部门设在温州市。拥有 2,000 m² 的生产车间和约 30 名工人,并设有专门服务海外客户的业务团队。",
      "多数客户是通过行业采购平台找到我们的——他们之所以长期合作,是因为随时都可以直接与车间负责人沟通。",
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
        body: "两支销售团队、独立打样间,以及涵盖 17 个品类的产品目录。",
      },
    ],
  },

  values: {
    eyebrow: "我们的价值观",
    heading: "我们的经营方式。",
    items: [
      {
        title: "环保优先",
        body: "优先采用可回收、可降解和再生面料。如有需求,可提供无塑料包装。",
      },
      {
        title: "透明沟通",
        body: "如实告知交期、产能和价格。没有中间环节过滤信息。",
      },
      {
        title: "长期合作",
        body: "多数客户与我们合作多年。我们追求的不是一次性的订单。",
      },
    ],
  },

  events: {
    eyebrow: "展会与活动",
    heading: "期待与您面对面。",
    body: placeholder(
      "参展记录",
      "列出常规参展的展会名称(香港印刷包装展、广交会等)及最近参加的展会和日期。参展照片可在 /public/images/events/ 查看。",
    ),
  },

  cta: {
    heading: "欢迎参观我们的工厂(线上或线下均可)。",
    body: "我们很乐意通过视频通话带您实时参观,或邀请您亲自到访我们的平阳工厂。",
    primary: { label: "联系我们", href: "/contact" },
    secondary: { label: "查看生产能力", href: "/capabilities" },
  },
};

export const aboutContent: Record<Locale, typeof en> = { en, zh };
