import type { Locale } from "@/lib/i18n";

/**
 * UI CHROME STRINGS
 * -----------------
 * Short text that lives in shared components (Header, Footer, buttons,
 * placeholders) or in page scaffolding that isn't backed by a content
 * file (product list, product detail, inquiry form, 404).
 *
 * The TypeScript type (`typeof en`) forces the Chinese copy to mirror
 * the English shape — adding or removing a key in one language will
 * flag the other.
 */

const en = {
  header: {
    tagline: "Bag Mfg. Co.",
    nav: {
      products: "Products",
      capabilities: "Capabilities",
      about: "About",
      contact: "Contact",
    },
    inquiry: "Inquiry",
    inquiryBasket: "Inquiry Basket",
    getQuote: "Get a Quote",
    toggleMenu: "Toggle menu",
    menu: "Menu",
    language: { en: "EN", zh: "中文", switchTo: "Switch to" },
  },

  footer: {
    companyColumn: "Company",
    popularCategoriesColumn: "Popular Categories",
    seeAllProducts: "See all products →",
    allRightsReserved: "All rights reserved.",
    nav: {
      about: "About",
      capabilities: "Capabilities",
      contact: "Contact",
      inquiryBasket: "Inquiry Basket",
    },
  },

  placeholder: {
    toBeProvided: "To be provided",
  },

  saveButton: {
    save: "Save",
    saved: "Saved",
    saveToInquiry: "Save to inquiry",
    saveAria: (name: string) => `Save ${name} to inquiry`,
    removeAria: (name: string) => `Remove ${name} from inquiry`,
  },

  productCard: {
    moq: "MOQ",
    customOrder: "Custom order",
  },

  categoryCard: {
    browse: "Browse",
  },

  home: {
    marqueeCaption: "A glimpse of our catalog — hover to pause.",
    viewAllProducts: "View all products →",
    browseAll: "Browse all →",
  },

  productsPage: {
    eyebrow: "Catalog",
    heading: "All products",
    intro: (productCount: number, categoryCount: number) =>
      `${productCount} representative products across ${categoryCount} categories. Anything you see is fully customizable — reach out for quotes on sizes, materials, and prints outside what's shown.`,
    sidebarHeading: "Categories",
    all: "All",
    metaTitle: "Products",
    metaDescription:
      "Browse our full catalog of reusable eco-friendly bags — cotton, non-woven, cooler, drawstring, paper, jute, and more.",
  },

  productDetail: {
    breadcrumbProducts: "Products",
    specifications: "Specifications",
    specsFallback:
      "Detailed specs (dimensions, material weight, handle length, printing area) are confirmed per order. Reach out with your target quantity and we'll send a full spec sheet tailored to your brief.",
    customizationOptions: "Customization options",
    availableMaterials: "Available materials",
    moq: "MOQ",
    leadTime: "Lead time",
    viewInquiryBasket: "View inquiry basket",
    needCustomQuote: "Need a custom quote?",
    needCustomQuoteBody:
      "Share quantity, target market, and any custom requirements. We'll come back within one business day with pricing and a sample plan.",
    talkToSales: "Talk to sales",
    relatedProducts: "Related products",
  },

  categoryPage: {
    breadcrumbProducts: "Products",
    emptyCategory:
      "We're uploading products for this category. Reach out for samples and the full spec sheet.",
    requestSamples: "Request samples",
  },

  inquiryPage: {
    loading: "Loading your inquiry…",
    successHeading: "Thanks — your inquiry is in.",
    successBody:
      "A sales contact will reply within one business day. In the meantime, feel free to keep browsing our products.",
    keepBrowsing: "Keep browsing",
    backToHome: "Back to home",
    eyebrow: "Inquiry",
    heading: "Your inquiry basket",
    intro:
      "Saved products travel with you across the site. Add any notes, fill in your details, and our sales team will follow up through your preferred channel.",
    savedProducts: (count: number) => `Saved products (${count})`,
    clearAll: "Clear all",
    emptyBasketA: "Nothing saved yet. Browse the catalog and click",
    emptyBasketB: "on any product you want to discuss.",
    browseProducts: "Browse products",
    removeAria: (name: string) => `Remove ${name}`,
    remove: "Remove",
    notesPlaceholder: "Optional notes: qty, color, print, timeline…",
    yourDetails: "Your details",
    yourDetailsNote: "We'll reply within one business day.",
    form: {
      name: "Name *",
      company: "Company",
      email: "Email *",
      country: "Country",
      whatsapp: "WhatsApp",
      whatsappPlaceholder: "Optional",
      channel: "Preferred reply channel",
      channelOptions: { email: "Email", whatsapp: "WhatsApp", phone: "Phone" },
      message: "Message",
      messagePlaceholder:
        "Quantity, target market, customization needs, timeline…",
      submit: "Send inquiry",
      submitting: "Sending…",
      orEmailDirectly: "Or email us directly at",
    },
  },

  notFound: {
    eyebrow: "404",
    heading: "That page has wandered off.",
    body: "The page you're looking for doesn't exist or was moved.",
    home: "Home",
    browseProducts: "Browse products",
  },

  metadata: {
    siteTitleSuffix: "ICOMing",
    defaultTitle: "Eco-friendly Bag Manufacturer",
    aboutTitle: "About",
    aboutDescription: (legalName: string, year: number) =>
      `${legalName} — eco-friendly bag manufacturer, founded ${year}.`,
    capabilitiesTitle: "Capabilities & Customization",
    capabilitiesDescription:
      "Materials, printing techniques, customization, and quality control for eco-friendly bag production.",
    contactTitle: "Contact",
    contactDescription: (brand: string) =>
      `Get in touch with ${brand} for quotes, samples, and custom projects.`,
  },
};

const zh: typeof en = {
  header: {
    tagline: "制袋工厂",
    nav: {
      products: "产品",
      capabilities: "生产能力",
      about: "关于我们",
      contact: "联系我们",
    },
    inquiry: "询盘",
    inquiryBasket: "询盘清单",
    getQuote: "免费报价",
    toggleMenu: "切换菜单",
    menu: "菜单",
    language: { en: "EN", zh: "中文", switchTo: "切换至" },
  },

  footer: {
    companyColumn: "公司",
    popularCategoriesColumn: "热门分类",
    seeAllProducts: "查看全部产品 →",
    allRightsReserved: "版权所有。",
    nav: {
      about: "关于我们",
      capabilities: "生产能力",
      contact: "联系我们",
      inquiryBasket: "询盘清单",
    },
  },

  placeholder: {
    toBeProvided: "待补充",
  },

  saveButton: {
    save: "收藏",
    saved: "已收藏",
    saveToInquiry: "加入询盘",
    saveAria: (name: string) => `将 ${name} 加入询盘`,
    removeAria: (name: string) => `将 ${name} 从询盘移除`,
  },

  productCard: {
    moq: "起订量",
    customOrder: "按需定制",
  },

  categoryCard: {
    browse: "查看",
  },

  home: {
    marqueeCaption: "产品一瞥 — 悬停可暂停。",
    viewAllProducts: "查看全部产品 →",
    browseAll: "浏览全部 →",
  },

  productsPage: {
    eyebrow: "产品目录",
    heading: "全部产品",
    intro: (productCount: number, categoryCount: number) =>
      `${productCount} 款代表产品,涵盖 ${categoryCount} 个品类。所有产品均可定制——如需其他尺寸、材质或印刷,欢迎联系报价。`,
    sidebarHeading: "产品分类",
    all: "全部",
    metaTitle: "产品",
    metaDescription:
      "浏览我们的全部环保袋产品目录 — 棉布袋、无纺布袋、保温袋、束口袋、纸袋、黄麻袋等。",
  },

  productDetail: {
    breadcrumbProducts: "产品",
    specifications: "规格参数",
    specsFallback:
      "详细规格(尺寸、克重、提手长度、印刷区域)根据订单确认。请告知您的目标数量,我们将根据需求提供完整规格表。",
    customizationOptions: "定制选项",
    availableMaterials: "可选材料",
    moq: "起订量",
    leadTime: "交货期",
    viewInquiryBasket: "查看询盘清单",
    needCustomQuote: "需要定制报价?",
    needCustomQuoteBody:
      "告知我们数量、目标市场以及任何定制需求。我们将在一个工作日内回复报价及打样方案。",
    talkToSales: "联系销售",
    relatedProducts: "相关产品",
  },

  categoryPage: {
    breadcrumbProducts: "产品",
    emptyCategory:
      "此分类下的产品正在上传中。如需样品和完整规格表,欢迎联系我们。",
    requestSamples: "索取样品",
  },

  inquiryPage: {
    loading: "正在加载您的询盘…",
    successHeading: "已收到您的询盘,感谢!",
    successBody:
      "销售同事将在一个工作日内回复。与此同时,欢迎继续浏览我们的产品。",
    keepBrowsing: "继续浏览",
    backToHome: "返回首页",
    eyebrow: "询盘",
    heading: "您的询盘清单",
    intro:
      "您收藏的产品会在全站保留。添加备注并填写联系方式后,销售团队会通过您指定的渠道跟进。",
    savedProducts: (count: number) => `已收藏产品(${count})`,
    clearAll: "全部清除",
    emptyBasketA: "尚未收藏任何产品。浏览目录时,点击产品上的",
    emptyBasketB: "按钮即可加入清单。",
    browseProducts: "浏览产品",
    removeAria: (name: string) => `移除 ${name}`,
    remove: "移除",
    notesPlaceholder: "可选备注:数量、颜色、印刷、交期…",
    yourDetails: "联系方式",
    yourDetailsNote: "我们将在一个工作日内回复。",
    form: {
      name: "姓名 *",
      company: "公司名称",
      email: "邮箱 *",
      country: "国家/地区",
      whatsapp: "WhatsApp",
      whatsappPlaceholder: "选填",
      channel: "首选回复渠道",
      channelOptions: { email: "邮箱", whatsapp: "WhatsApp", phone: "电话" },
      message: "留言",
      messagePlaceholder: "数量、目标市场、定制需求、交期…",
      submit: "提交询盘",
      submitting: "发送中…",
      orEmailDirectly: "或直接发送邮件至",
    },
  },

  notFound: {
    eyebrow: "404",
    heading: "页面走失了。",
    body: "您访问的页面不存在或已被移动。",
    home: "首页",
    browseProducts: "浏览产品",
  },

  metadata: {
    siteTitleSuffix: "爱康",
    defaultTitle: "环保袋专业制造商",
    aboutTitle: "关于我们",
    aboutDescription: (legalName: string, year: number) =>
      `${legalName}——环保袋专业制造商,成立于 ${year} 年。`,
    capabilitiesTitle: "生产能力与定制服务",
    capabilitiesDescription:
      "环保袋生产所涉及的材料、印刷工艺、定制服务与品控流程。",
    contactTitle: "联系我们",
    contactDescription: (brand: string) =>
      `欢迎联系 ${brand} 获取报价、样品及定制方案。`,
  },
};

export const uiContent: Record<Locale, typeof en> = { en, zh };
