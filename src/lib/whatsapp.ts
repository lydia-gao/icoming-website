import type { Locale } from "@/lib/i18n";
import { company } from "@/data/company";

/** Build a `https://wa.me/<digits>?text=<urlencoded>` deeplink. */
export function whatsappDeeplink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** The company WhatsApp number (source of truth: data/company.ts). */
export const companyWhatsappNumber: string = company.contact.whatsapp;

/** Generic pre-fill used by the persistent header/floating CTA. */
export function genericWhatsappMessage(locale: Locale): string {
  return locale === "zh"
    ? "您好,我通过 ICOMing 官网找到你们。"
    : "Hi, I found you on the ICOMing website.";
}

/**
 * Pre-fill used on the inquiry success page. Includes request ID and
 * basic context so sales can look up the submission immediately.
 */
export function inquiryWhatsappMessage(
  locale: Locale,
  data: {
    requestId: string;
    name: string;
    company?: string;
    productNames: string[];
  },
): string {
  const products =
    data.productNames.length === 0
      ? locale === "zh"
        ? "(无具体产品)"
        : "(no specific products)"
      : data.productNames.map((n) => `- ${n}`).join("\n");

  if (locale === "zh") {
    return [
      "您好,我通过 ICOMing 官网提交了询盘。",
      "",
      `请求编号: ${data.requestId}`,
      `姓名: ${data.name}`,
      data.company ? `公司: ${data.company}` : null,
      "产品:",
      products,
      "",
      "期待进一步沟通。",
    ]
      .filter((v): v is string => v !== null)
      .join("\n");
  }

  return [
    "Hi, I submitted an inquiry on the ICOMing website.",
    "",
    `Request ID: ${data.requestId}`,
    `Name: ${data.name}`,
    data.company ? `Company: ${data.company}` : null,
    "Products:",
    products,
    "",
    "Looking forward to discussing further.",
  ]
    .filter((v): v is string => v !== null)
    .join("\n");
}
