import type { Locale } from "@/lib/i18n";
import { placeholder } from "./_types";

/**
 * CAPABILITIES PAGE CONTENT — bilingual
 */

const en = {
  hero: {
    eyebrow: "Capabilities",
    headline: "Materials, printing, and customization — all under one roof.",
    body:
      "Our in-house team handles material sourcing, production, printing, and inspection. This page is an overview of what we can make; if you don't see something, ask — chances are we've made it.",
  },

  materials: {
    eyebrow: "Fabrics & materials",
    heading: "What we make bags from.",
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

const zh: typeof en = {
  hero: {
    eyebrow: "生产能力",
    headline: "材料、印刷与定制——全部在同一屋檐下完成。",
    body:
      "从原料采购、生产、印刷到检验,均由自有团队完成。本页面为我们的能力概览;若未看到您需要的款式,欢迎咨询——很可能我们已经做过。",
  },

  materials: {
    eyebrow: "面料与材料",
    heading: "制袋使用的材料。",
    items: [
      { name: "棉帆布", note: "本色、再生及有机棉可选" },
      { name: "黄麻 / 麻布", note: "原色或覆膜防水" },
      { name: "无纺布 (PP)", note: "素面或覆膜(亚光/亮光)" },
      { name: "牛皮纸", note: "棕色、白色及涂层款式" },
      { name: "杜邦纸 (Tyvek)", note: "轻质、抗撕" },
      { name: "涤纶 / 牛津布", note: "210D 至 1680D,适用于运动及重型袋" },
      { name: "PEVA / PVC", note: "透明款及食品级款可选" },
      { name: "毛毡", note: "涤纶及混纺毛毡" },
      { name: "RPET", note: "消费后再生涤纶" },
    ],
  },

  printing: {
    eyebrow: "印刷与后道",
    heading: "定制工艺。",
    items: [
      { name: "丝网印刷", note: "适用于面料及纸张,多色可选" },
      { name: "数码印刷", note: "面料上的照片级印刷" },
      { name: "热转印", note: "色彩鲜艳、持久耐用" },
      { name: "刺绣", note: "平绣及 3D 立体绣" },
      { name: "柔印 / 胶印", note: "适用于纸袋批量生产" },
      { name: "烫金 / 烫印", note: "金属色及定制烫金" },
      { name: "压凹 / 压凸", note: "营造皮质触感" },
      { name: "热升华", note: "涤纶材质上的满版印花" },
    ],
  },

  moq: {
    title: "起订量",
    heading: "灵活的起订量,透明的阶梯。",
    body: placeholder(
      "各产品线起订量",
      "列出实际的最低起订数量,如棉布手提袋、无纺布袋、保温袋、西服袋、纸袋、化妆包等。格式参考:'棉布手提袋:500 件;无纺布宣传袋:2,000 件'。",
    ),
  },

  leadTime: {
    title: "交货期",
    heading: "交期稳定,可预期。",
    body: placeholder(
      "生产交货期",
      "请确认典型交货期:打样、常规生产及旺季。例如 '打样 7-10 天;生产 25-35 天;旺季 +7 天'。",
    ),
  },

  qc: {
    eyebrow: "品质管控",
    heading: "全流程检验。",
    stages: placeholder(
      "品控流程细节",
      "描述实际的检验环节(来料、在线、成品)。若采用特定 AQL 标准或接受第三方检验(SGS、BV、QIMA 等),请在此列出。",
    ),
  },

  compliance: {
    eyebrow: "合规",
    heading: "符合目标市场的文件要求。",
    body:
      "我们服务的客户覆盖欧洲、北美、亚太及其他地区。测试报告与声明文件可根据需要提供。",
    certifications: placeholder(
      "现有认证",
      "列出目前实际持有的认证(如 BSCI、REACH、Prop 65、OEKO-TEX 100、GOTS、FSC、ISO 9001)。仅列出当前具备有效证书的项目。",
    ),
  },

  cta: {
    heading: "告知您的需求——我们将在一个工作日内报价。",
    body:
      "请分享参考款式、目标数量及市场。专属销售将为您讲解材料、印刷工艺并提供准确的交期方案。",
    primary: { label: "开启项目", href: "/contact" },
    secondary: { label: "浏览产品", href: "/products" },
  },
};

export const capabilitiesContent: Record<Locale, typeof en> = { en, zh };
