import type { Locale } from "@/lib/i18n";
import { placeholder } from "./_types";

/**
 * CAPABILITIES PAGE CONTENT — bilingual
 */

const en = {
  hero: {
    eyebrow: "Capabilities",
    headline: "Materials, printing, and customization — handled in-house.",
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

  customization: {
    eyebrow: "Customization",
    heading: "How we customize your bags.",
    body:
      "Printing, color matching, hardware, pockets — almost every detail can be tailored to brand. Send a brief and we'll suggest options with samples.",
    groups: [
      {
        title: "Printing methods",
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
      {
        title: "Pantone color matching",
        items: [
          {
            name: "Pantone-matched dyeing",
            note: "Match the brand swatch on cotton, non-woven, polyester, and felt.",
          },
          {
            name: "Custom thread color",
            note: "For embroidery, stitching, and drawcords.",
          },
          {
            name: "Custom print ink",
            note: "Pantone-matched inks for screen, flexo, and offset print.",
          },
        ],
      },
      {
        title: "Handles",
        items: [
          { name: "Cotton webbing", note: "Standard, soft, durable." },
          { name: "Jute / hemp", note: "Natural, eco-friendly accent." },
          { name: "PU / leatherette", note: "Premium-feel handles." },
          { name: "Wood / bamboo", note: "Curved or beaded options." },
          { name: "Rope", note: "Cotton, polyester, or natural-fiber rope." },
          { name: "Self-fabric", note: "Cut from the bag fabric for a clean look." },
        ],
      },
      {
        title: "Pockets",
        items: [
          { name: "Inner zip pocket", note: "Secured zip pocket on the inner wall." },
          { name: "Slip pocket", note: "Open slip pocket for quick access." },
          { name: "Front patch pocket", note: "Branded patch pocket on the outer face." },
          { name: "Phone pocket", note: "Sized for phone + cards." },
          {
            name: "Insulated compartment",
            note: "For cooler / lunch / takeout bags.",
          },
        ],
      },
      {
        title: "Additional features",
        items: [
          {
            name: "Reinforced bottom",
            note: "Cardboard insert or doubled fabric for heavier loads.",
          },
          { name: "Gusset", note: "Square or expanding gusset for capacity." },
          { name: "Magnetic snap", note: "Clean closure without zippers." },
          {
            name: "Drawcord stopper",
            note: "For drawstring and tote closures.",
          },
          {
            name: "Hangtag / label",
            note: "Cotton, leather, or paper hangtags; woven labels.",
          },
          {
            name: "Custom carton",
            note: "Branded master carton, polybag, or insert card.",
          },
        ],
      },
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
      "We supply customers in Europe, North America, Asia-Pacific, and beyond. Test reports and declarations are available on request.",
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
    headline: "材料、印刷与定制——全部由自有团队完成。",
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

  customization: {
    eyebrow: "定制服务",
    heading: "可定制的细节。",
    body:
      "印刷、调色、五金、口袋——几乎每个细节都可以按品牌定制。发送您的需求,我们会给出方案与样品建议。",
    groups: [
      {
        title: "印刷工艺",
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
      {
        title: "Pantone 色彩定制",
        items: [
          {
            name: "Pantone 配色染色",
            note: "根据品牌色卡定制棉、无纺、涤纶、毛毡材料。",
          },
          {
            name: "定制线材颜色",
            note: "用于刺绣、缝合、抽绳等。",
          },
          {
            name: "定制印刷油墨",
            note: "丝印、柔印、胶印均可使用 Pantone 配色油墨。",
          },
        ],
      },
      {
        title: "提手",
        items: [
          { name: "棉织带", note: "标准款,柔软耐用。" },
          { name: "黄麻 / 麻", note: "天然环保的点缀。" },
          { name: "PU / 仿皮", note: "质感更高级的提手。" },
          { name: "木 / 竹", note: "弯曲或串珠款式。" },
          { name: "绳索", note: "棉绳、涤纶绳、天然纤维绳均可选。" },
          { name: "本料同色", note: "使用主体面料切割,造型简洁。" },
        ],
      },
      {
        title: "口袋",
        items: [
          { name: "内拉链袋", note: "内壁带拉链的安全口袋。" },
          { name: "插袋", note: "开放式插袋,方便快速取放。" },
          { name: "前贴袋", note: "外侧贴袋,可作为品牌位置。" },
          { name: "手机袋", note: "适配手机和卡片。" },
          {
            name: "保温隔层",
            note: "用于保温袋、午餐袋、外卖袋。",
          },
        ],
      },
      {
        title: "其他细节",
        items: [
          {
            name: "加固底部",
            note: "纸板内衬或双层面料,适合承重需求。",
          },
          { name: "侧片 / 底片", note: "方底或可扩展底,提升容量。" },
          { name: "磁性按扣", note: "无拉链的简洁闭合方式。" },
          {
            name: "绳扣",
            note: "用于抽绳袋和手提袋。",
          },
          {
            name: "吊牌 / 标签",
            note: "棉、皮、纸吊牌或织标。",
          },
          {
            name: "定制外箱",
            note: "品牌外箱、塑料袋、内卡。",
          },
        ],
      },
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
      "我们的客户覆盖欧洲、北美、亚太及其他地区。测试报告与声明文件可根据需要提供。",
    certifications: placeholder(
      "现有认证",
      "列出目前实际持有的认证(如 BSCI、REACH、Prop 65、OEKO-TEX 100、GOTS、FSC、ISO 9001)。仅列出当前具备有效证书的项目。",
    ),
  },

  cta: {
    heading: "告知您的需求——我们将在一个工作日内报价。",
    body:
      "请分享参考款式、目标数量及市场。专属销售对接人将为您介绍材料、印刷工艺,并给出准确的交期方案。",
    primary: { label: "开启项目", href: "/contact" },
    secondary: { label: "浏览产品", href: "/products" },
  },
};

export const capabilitiesContent: Record<Locale, typeof en> = { en, zh };
