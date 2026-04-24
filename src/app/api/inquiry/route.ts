import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { sendInquiryNotification } from "@/lib/inquiry-email";

type ContactMethod = "whatsapp" | "wechat" | "phone" | "telegram" | "line" | "other";
const CONTACT_METHODS: ContactMethod[] = [
  "whatsapp",
  "wechat",
  "phone",
  "telegram",
  "line",
  "other",
];

type InquiryItemPayload = {
  slug: string;
  name: string;
  image?: string;
  note?: string;
};

type InquiryPayload = {
  locale?: "en" | "zh";
  name?: string;
  email?: string;
  company?: string;
  contactMethod?: ContactMethod;
  contactHandle?: string;
  otherPlatformName?: string;
  message?: string;
  items?: InquiryItemPayload[];
};

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /.+@.+\..+/.test(value);
}

function isValidContactMethod(value: unknown): value is ContactMethod {
  return typeof value === "string" && (CONTACT_METHODS as string[]).includes(value);
}

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Required fields
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const locale: "en" | "zh" = body.locale === "zh" ? "zh" : "en";

  // Normalize optional fields
  const contactMethod =
    body.contactMethod && isValidContactMethod(body.contactMethod)
      ? body.contactMethod
      : undefined;
  const items: InquiryItemPayload[] = Array.isArray(body.items)
    ? body.items.filter(
        (i): i is InquiryItemPayload =>
          !!i && typeof i.slug === "string" && typeof i.name === "string",
      )
    : [];

  const inquiryRecord = {
    locale,
    name: body.name.trim(),
    email: body.email.trim(),
    company: body.company?.trim() || null,
    contact_method: contactMethod ?? null,
    contact_handle: body.contactHandle?.trim() || null,
    other_platform_name:
      contactMethod === "other" ? body.otherPlatformName?.trim() || null : null,
    message: body.message?.trim() || null,
  };

  const supabase = getServiceSupabase();

  let requestId: string;
  let inquiryId: string | null = null;
  let createdAt = new Date();

  if (supabase) {
    // Insert inquiry, let the DB default populate request_id
    const { data: inquiry, error: insertErr } = await supabase
      .from("inquiries")
      .insert(inquiryRecord)
      .select("id, request_id, created_at")
      .single();

    if (insertErr || !inquiry) {
      console.error("[inquiry] DB insert failed", insertErr);
      return NextResponse.json(
        { error: "Could not save inquiry. Please try again or email us directly." },
        { status: 500 },
      );
    }
    requestId = inquiry.request_id;
    inquiryId = inquiry.id;
    createdAt = new Date(inquiry.created_at);

    if (items.length > 0) {
      const itemRows = items.map((i) => ({
        inquiry_id: inquiry.id,
        product_slug: i.slug,
        product_name_snapshot: i.name,
        product_image_snapshot: i.image ?? null,
        customization_notes: i.note?.trim() || null,
      }));
      const { error: itemsErr } = await supabase
        .from("inquiry_items")
        .insert(itemRows);
      if (itemsErr) {
        // Don't fail the submission — inquiry is saved, items can be
        // reconstructed from the email. Log for admin attention.
        console.error("[inquiry] items insert failed", itemsErr, { inquiryId });
      }
    }
  } else {
    // Local/dev fallback — no persistence. Still return a synthetic ID so
    // the client flow can be exercised end-to-end.
    requestId = `LOCAL-DEV-${Date.now()}`;
    console.info("[inquiry] Supabase not configured — running in log-only mode", {
      requestId,
      inquiry: inquiryRecord,
      items,
    });
  }

  // Fire the email notification (best-effort — never block or fail the
  // submission on email errors).
  void sendInquiryNotification({
    requestId,
    locale,
    name: inquiryRecord.name,
    email: inquiryRecord.email,
    company: inquiryRecord.company ?? undefined,
    contactMethod: inquiryRecord.contact_method ?? undefined,
    contactHandle: inquiryRecord.contact_handle ?? undefined,
    otherPlatformName: inquiryRecord.other_platform_name ?? undefined,
    message: inquiryRecord.message ?? undefined,
    items: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      customizationNotes: i.note?.trim() || undefined,
    })),
    createdAt,
  });

  return NextResponse.json({ ok: true, requestId, inquiryId });
}
