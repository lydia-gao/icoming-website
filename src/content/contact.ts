import type { Locale } from "@/lib/i18n";
import { company } from "@/data/company";

/**
 * CONTACT PAGE CONTENT — bilingual
 * --------------------------------
 * Channels pull their actual details (emails, phone numbers) from
 * data/company.ts — update once there, reflected everywhere.
 */

const en = {
  hero: {
    eyebrow: "Contact",
    headline: "Let's start your bag project.",
    body:
      "Reach us through whichever channel you prefer. For detailed quotes with product specs, use the inquiry basket with your saved products.",
    startInquiryLink: "Start an inquiry →",
  },

  channels: [
    {
      label: "Email",
      primary: company.contact.primaryEmail,
      secondary: company.contact.secondaryEmail,
      href: `mailto:${company.contact.primaryEmail}`,
      note: "Usually replied to within one business day.",
    },
    {
      label: "Phone",
      primary: company.contact.phone,
      secondary: "Mon–Sat, GMT+8",
      href: `tel:${company.contact.phone.replace(/[^+\d]/g, "")}`,
      note: "Best for urgent project updates.",
    },
    {
      label: "WhatsApp",
      primary: company.contact.whatsapp,
      secondary: "Same-day reply, GMT+8 hours",
      href: `https://wa.me/${company.contact.whatsapp.replace(/[^\d]/g, "")}`,
      note: "Preferred by many overseas customers.",
    },
  ],

  visit: {
    eyebrow: "Visit",
    heading: "Our factory & office.",
    body:
      "The factory is in Pingyang County; the sales/business office is in Wenzhou. We're happy to schedule a factory visit — let us know your travel dates.",
    emailSales: "Email sales",
    inquiryBasket: "Inquiry basket",
    mapTitle: "Factory location — Wenzhou",
  },
};

const zh: typeof en = {
  hero: {
    eyebrow: "联系我们",
    headline: "一起开启您的制袋项目。",
    body:
      "欢迎通过您习惯的方式与我们联系。如需带产品规格的详细报价,请使用询盘清单提交已收藏的产品。",
    startInquiryLink: "发起询盘 →",
  },

  channels: [
    {
      label: "邮箱",
      primary: company.contact.primaryEmail,
      secondary: company.contact.secondaryEmail,
      href: `mailto:${company.contact.primaryEmail}`,
      note: "通常在一个工作日内回复。",
    },
    {
      label: "电话",
      primary: company.contact.phone,
      secondary: "周一至周六,GMT+8",
      href: `tel:${company.contact.phone.replace(/[^+\d]/g, "")}`,
      note: "紧急项目沟通优先选择。",
    },
    {
      label: "WhatsApp",
      primary: company.contact.whatsapp,
      secondary: "当日回复,GMT+8",
      href: `https://wa.me/${company.contact.whatsapp.replace(/[^\d]/g, "")}`,
      note: "海外客户的常用渠道。",
    },
  ],

  visit: {
    eyebrow: "到访",
    heading: "工厂与办公室。",
    body:
      "工厂位于平阳县;销售/业务办公室设在温州市。欢迎预约工厂参观——请提前告知您的行程。",
    emailSales: "邮件联系销售",
    inquiryBasket: "询盘清单",
    mapTitle: "工厂位置 — 温州",
  },
};

export const contactContent: Record<Locale, typeof en> = { en, zh };
