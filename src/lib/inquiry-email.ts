import { getResend, getInquiryRecipients, getInquiryFromAddress } from "./resend";

export type InquiryEmailItem = {
  slug: string;
  name: string;
  quantity?: number;
  size?: string;
  sizeCustom?: string;
  color?: string;
  colorCustom?: string;
  material?: string;
  materialCustom?: string;
  priceSnapshot?: string;
  tierLabel?: string;
  customizationNotes?: string;
  uploads?: Array<{
    originalFilename: string;
    sizeBytes: number;
    kind?: string;
    storagePath: string;
    /** Pre-signed Supabase Storage URL for sales download. Typically
     *  valid for 7 days from send time. */
    signedUrl?: string;
  }>;
};

/** How long signed attachment URLs in the sales email stay valid. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type InquiryEmailData = {
  requestId: string;
  locale: "en" | "zh";
  name: string;
  email: string;
  company?: string;
  contactMethod?: string;
  contactHandle?: string;
  otherPlatformName?: string;
  message?: string;
  items: InquiryEmailItem[];
  createdAt: Date;
  adminUrl?: string;
};

/**
 * Send a transactional notification to the sales team. Best-effort —
 * callers should catch errors and not fail the user submission on send
 * failure. Returns `{ sent: false }` silently if Resend is not configured.
 */
export async function sendInquiryNotification(
  data: InquiryEmailData,
): Promise<{ sent: boolean; error?: unknown }> {
  const resend = getResend();
  if (!resend) {
    console.info("[inquiry] Resend not configured — skipping email notification");
    return { sent: false };
  }

  try {
    const result = await resend.emails.send({
      from: getInquiryFromAddress(),
      to: getInquiryRecipients(),
      replyTo: data.email,
      subject: buildSubject(data),
      text: buildTextBody(data),
      html: buildHtmlBody(data),
    });
    if (result.error) {
      console.error("[inquiry] Resend returned error", result.error);
      return { sent: false, error: result.error };
    }
    return { sent: true };
  } catch (err) {
    console.error("[inquiry] email send threw", err);
    return { sent: false, error: err };
  }
}

function buildSubject(d: InquiryEmailData): string {
  const n = d.items.length;
  const label = d.company ? d.company : d.name;
  const plural = n === 1 ? "item" : "items";
  return `[ICOMing RFQ] ${d.requestId} — ${label} (${n} ${plural})`;
}

function itemVariantLine(item: InquiryEmailItem): string {
  const bits: string[] = [];
  const sizeVal = item.sizeCustom ?? item.size;
  if (sizeVal) bits.push(`Size: ${sizeVal}${item.sizeCustom ? " (custom)" : ""}`);
  const colorVal = item.colorCustom ?? item.color;
  if (colorVal) bits.push(`Color: ${colorVal}${item.colorCustom ? " (custom)" : ""}`);
  const materialVal = item.materialCustom ?? item.material;
  if (materialVal)
    bits.push(`Material: ${materialVal}${item.materialCustom ? " (custom)" : ""}`);
  if (item.quantity != null) bits.push(`Qty: ${item.quantity} pcs`);
  if (item.priceSnapshot) {
    const tier = item.tierLabel ? ` at ${item.tierLabel}` : "";
    bits.push(`Price tier: ${item.priceSnapshot}${tier}`);
  }
  return bits.join(" · ");
}

function buildTextBody(d: InquiryEmailData): string {
  const lines: string[] = [];
  lines.push(`New inquiry — ${d.requestId}`);
  lines.push("");
  lines.push(`Received: ${d.createdAt.toISOString()}`);
  lines.push(`Locale: ${d.locale}`);
  lines.push("");
  lines.push("CONTACT");
  lines.push(`  Name:    ${d.name}`);
  lines.push(`  Email:   ${d.email}`);
  if (d.company) lines.push(`  Company: ${d.company}`);
  if (d.contactMethod) {
    const platform =
      d.contactMethod === "other" && d.otherPlatformName
        ? `Other (${d.otherPlatformName})`
        : d.contactMethod;
    lines.push(`  Prefers: ${platform} — ${d.contactHandle ?? "(handle not provided)"}`);
  }
  lines.push("");
  lines.push(`ITEMS (${d.items.length})`);
  if (d.items.length === 0) {
    lines.push("  (none)");
  } else {
    d.items.forEach((item, i) => {
      lines.push(`  ${i + 1}. ${item.name} [${item.slug}]`);
      const variantLine = itemVariantLine(item);
      if (variantLine) lines.push(`     ${variantLine}`);
      if (item.customizationNotes) {
        lines.push(`     Notes: ${item.customizationNotes}`);
      }
      if (item.uploads && item.uploads.length > 0) {
        lines.push(`     Attachments:`);
        item.uploads.forEach((u) => {
          const size = formatSize(u.sizeBytes);
          lines.push(
            `       - ${u.originalFilename} (${u.kind ?? "file"}, ${size})`,
          );
          if (u.signedUrl) {
            lines.push(`         Download: ${u.signedUrl}`);
          }
        });
      }
    });
  }
  if (d.message) {
    lines.push("");
    lines.push("MESSAGE");
    lines.push(d.message);
  }
  if (hasAnyAttachments(d.items)) {
    lines.push("");
    lines.push(`Note: attachment download links valid for 7 days from send time.`);
  }
  if (d.adminUrl) {
    lines.push("");
    lines.push(`Admin view: ${d.adminUrl}`);
  }
  return lines.join("\n");
}

function hasAnyAttachments(items: InquiryEmailItem[]): boolean {
  return items.some((i) => (i.uploads?.length ?? 0) > 0);
}

function buildHtmlBody(d: InquiryEmailData): string {
  const rows: string[] = [];
  rows.push(
    `<h2 style="margin:0 0 8px;font-family:Georgia,serif">New inquiry — ${escape(d.requestId)}</h2>`,
  );
  rows.push(
    `<p style="margin:0 0 16px;color:#666;font-size:13px">Received ${escape(d.createdAt.toISOString())} · locale <b>${escape(d.locale)}</b></p>`,
  );
  rows.push(`<h3 style="margin:16px 0 4px">Contact</h3>`);
  rows.push(`<table cellpadding="3" style="font-size:14px;border-collapse:collapse">`);
  rows.push(row("Name", escape(d.name)));
  rows.push(row("Email", `<a href="mailto:${escapeAttr(d.email)}">${escape(d.email)}</a>`));
  if (d.company) rows.push(row("Company", escape(d.company)));
  if (d.contactMethod) {
    const platformLabel =
      d.contactMethod === "other" && d.otherPlatformName
        ? `Other (${d.otherPlatformName})`
        : d.contactMethod;
    rows.push(
      row(
        "Prefers",
        `${escape(platformLabel)} — ${escape(d.contactHandle ?? "(handle not provided)")}`,
      ),
    );
  }
  rows.push(`</table>`);

  rows.push(`<h3 style="margin:20px 0 4px">Items (${d.items.length})</h3>`);
  if (d.items.length === 0) {
    rows.push(`<p style="color:#666">No products selected.</p>`);
  } else {
    rows.push(`<ol style="padding-left:18px;font-size:14px;line-height:1.5">`);
    for (const item of d.items) {
      rows.push(
        `<li><b>${escape(item.name)}</b> <span style="color:#888">[${escape(item.slug)}]</span>`,
      );
      const variantLine = itemVariantLine(item);
      if (variantLine) {
        rows.push(
          `<div style="color:#3d5534;font-size:13px">${escape(variantLine)}</div>`,
        );
      }
      if (item.customizationNotes) {
        rows.push(
          `<div style="color:#444;font-size:13px">Notes: ${escape(item.customizationNotes)}</div>`,
        );
      }
      if (item.uploads && item.uploads.length > 0) {
        rows.push(
          `<div style="color:#444;font-size:13px;margin-top:4px">Attachments:</div>`,
        );
        rows.push(`<ul style="padding-left:16px;font-size:13px;margin:2px 0">`);
        for (const u of item.uploads) {
          const size = formatSize(u.sizeBytes);
          const filenameCell = u.signedUrl
            ? `<a href="${escapeAttr(u.signedUrl)}" style="color:#3d5534;text-decoration:underline">${escape(u.originalFilename)}</a>`
            : escape(u.originalFilename);
          rows.push(
            `<li>${filenameCell} <span style="color:#888">(${escape(u.kind ?? "file")}, ${escape(size)})</span></li>`,
          );
        }
        rows.push(`</ul>`);
      }
      rows.push(`</li>`);
    }
    rows.push(`</ol>`);
  }

  if (d.message) {
    rows.push(`<h3 style="margin:20px 0 4px">Message</h3>`);
    rows.push(
      `<p style="white-space:pre-wrap;font-size:14px;line-height:1.5">${escape(d.message)}</p>`,
    );
  }

  if (hasAnyAttachments(d.items)) {
    rows.push(
      `<p style="margin:16px 0 0;color:#888;font-size:12px;font-style:italic">Attachment download links valid for 7 days from send time.</p>`,
    );
  }

  if (d.adminUrl) {
    rows.push(
      `<p style="margin:24px 0 0"><a href="${escapeAttr(d.adminUrl)}" style="background:#3d5534;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-size:13px">Open in admin →</a></p>`,
    );
  }

  return `<div style="font-family:system-ui,-apple-system,sans-serif;color:#25221d;max-width:640px">${rows.join("")}</div>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="color:#888;padding-right:12px">${escape(label)}</td><td>${value}</td></tr>`;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

function escapeAttr(s: string): string {
  return escape(s);
}
