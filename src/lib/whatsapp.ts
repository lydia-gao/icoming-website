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

export type WhatsAppProduct = {
  name: string;
  size?: string;
  color?: string;
  material?: string;
  quantity?: number;
  priceSnapshot?: string;
};

/**
 * Pre-fill used on the inquiry success page. Includes request ID,
 * contact info, a compact variant summary per product, and the
 * buyer's free-text message — so sales can scan an RFQ from the
 * WhatsApp thread alone.
 */
export function inquiryWhatsappMessage(
  locale: Locale,
  data: {
    requestId: string;
    name: string;
    company?: string;
    products: WhatsAppProduct[];
    message?: string;
  },
): string {
  const isZh = locale === "zh";

  const productsBlock =
    data.products.length === 0
      ? isZh
        ? "(无具体产品)"
        : "(no specific products)"
      : data.products.map((p) => renderProduct(p, isZh)).join("\n");

  const trimmedMessage = data.message?.trim();

  if (isZh) {
    return [
      "您好,我通过 ICOMing 官网提交了询盘。",
      "",
      `请求编号: ${data.requestId}`,
      `姓名: ${data.name}`,
      data.company ? `公司: ${data.company}` : null,
      "产品:",
      productsBlock,
      trimmedMessage ? "" : null,
      trimmedMessage ? `备注: ${trimmedMessage}` : null,
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
    productsBlock,
    trimmedMessage ? "" : null,
    trimmedMessage ? `Notes: ${trimmedMessage}` : null,
    "",
    "Looking forward to discussing further.",
  ]
    .filter((v): v is string => v !== null)
    .join("\n");
}

function renderProduct(p: WhatsAppProduct, isZh: boolean): string {
  const details: string[] = [];
  if (p.size)
    details.push(isZh ? `尺寸: ${p.size}` : `Size: ${p.size}`);
  if (p.color)
    details.push(isZh ? `颜色: ${p.color}` : `Color: ${p.color}`);
  if (p.material)
    details.push(isZh ? `材质: ${p.material}` : `Material: ${p.material}`);
  if (p.quantity != null) {
    const qtyUnit = isZh ? "件" : "pcs";
    details.push(isZh ? `数量: ${p.quantity} ${qtyUnit}` : `Qty: ${p.quantity} ${qtyUnit}`);
  }
  if (p.priceSnapshot) {
    details.push(
      isZh ? `报价段: ${p.priceSnapshot}` : `Price tier: ${p.priceSnapshot}`,
    );
  }
  return details.length > 0
    ? `- ${p.name}\n  ${details.join(", ")}`
    : `- ${p.name}`;
}
