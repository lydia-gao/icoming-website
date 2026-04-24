import { getResend, getInquiryRecipients, getInquiryFromAddress } from "./resend";

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
  items: Array<{
    slug: string;
    name: string;
    customizationNotes?: string;
  }>;
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
  const label = d.company ? `${d.company}` : d.name;
  const plural = n === 1 ? "item" : "items";
  return `[ICOMing RFQ] ${d.requestId} — ${label} (${n} ${plural})`;
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
      if (item.customizationNotes) {
        lines.push(`     Notes: ${item.customizationNotes}`);
      }
    });
  }
  if (d.message) {
    lines.push("");
    lines.push("MESSAGE");
    lines.push(d.message);
  }
  if (d.adminUrl) {
    lines.push("");
    lines.push(`Admin view: ${d.adminUrl}`);
  }
  return lines.join("\n");
}

function buildHtmlBody(d: InquiryEmailData): string {
  const rows: string[] = [];
  rows.push(`<h2 style="margin:0 0 8px;font-family:Georgia,serif">New inquiry — ${escape(d.requestId)}</h2>`);
  rows.push(`<p style="margin:0 0 16px;color:#666;font-size:13px">Received ${escape(d.createdAt.toISOString())} · locale <b>${escape(d.locale)}</b></p>`);
  rows.push(`<h3 style="margin:16px 0 4px">Contact</h3>`);
  rows.push(`<table cellpadding="3" style="font-size:14px;border-collapse:collapse">`);
  rows.push(row("Name", d.name));
  rows.push(row("Email", `<a href="mailto:${escapeAttr(d.email)}">${escape(d.email)}</a>`));
  if (d.company) rows.push(row("Company", d.company));
  if (d.contactMethod) {
    const platformLabel =
      d.contactMethod === "other" && d.otherPlatformName
        ? `Other (${d.otherPlatformName})`
        : d.contactMethod;
    rows.push(row("Prefers", `${escape(platformLabel)} — ${escape(d.contactHandle ?? "(handle not provided)")}`));
  }
  rows.push(`</table>`);

  rows.push(`<h3 style="margin:20px 0 4px">Items (${d.items.length})</h3>`);
  if (d.items.length === 0) {
    rows.push(`<p style="color:#666">No products selected.</p>`);
  } else {
    rows.push(`<ol style="padding-left:18px;font-size:14px;line-height:1.5">`);
    for (const item of d.items) {
      rows.push(`<li><b>${escape(item.name)}</b> <span style="color:#888">[${escape(item.slug)}]</span>`);
      if (item.customizationNotes) {
        rows.push(`<div style="color:#444;font-size:13px">Notes: ${escape(item.customizationNotes)}</div>`);
      }
      rows.push(`</li>`);
    }
    rows.push(`</ol>`);
  }

  if (d.message) {
    rows.push(`<h3 style="margin:20px 0 4px">Message</h3>`);
    rows.push(`<p style="white-space:pre-wrap;font-size:14px;line-height:1.5">${escape(d.message)}</p>`);
  }

  if (d.adminUrl) {
    rows.push(`<p style="margin:24px 0 0"><a href="${escapeAttr(d.adminUrl)}" style="background:#3d5534;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-size:13px">Open in admin →</a></p>`);
  }

  return `<div style="font-family:system-ui,-apple-system,sans-serif;color:#25221d;max-width:640px">${rows.join("")}</div>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="color:#888;padding-right:12px">${escape(label)}</td><td>${value}</td></tr>`;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default:  return c;
    }
  });
}

function escapeAttr(s: string): string {
  return escape(s);
}
