import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import {
  sendInquiryNotification,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/inquiry-email";
import { INQUIRY_UPLOADS_BUCKET } from "@/lib/uploads";

type ContactMethod = "whatsapp" | "wechat" | "phone" | "telegram" | "line" | "other";
const CONTACT_METHODS: ContactMethod[] = [
  "whatsapp",
  "wechat",
  "phone",
  "telegram",
  "line",
  "other",
];

type UploadKind = "logo" | "design_brief" | "artwork" | "reference";
const UPLOAD_KINDS: UploadKind[] = ["logo", "design_brief", "artwork", "reference"];

type InquiryUploadPayload = {
  storagePath: string;
  originalFilename: string;
  mimeType?: string;
  sizeBytes?: number;
  kind?: UploadKind;
};

type InquiryItemPayload = {
  slug: string;
  name: string;
  image?: string;
  note?: string;
  size?: string;
  sizeCustom?: string;
  color?: string;
  colorCustom?: string;
  material?: string;
  materialCustom?: string;
  quantity?: number;
  priceSnapshot?: string;
  tierLabel?: string;
  uploads?: InquiryUploadPayload[];
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

function isValidUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && (UPLOAD_KINDS as string[]).includes(value);
}

function sanitizeItem(raw: InquiryItemPayload): {
  slug: string;
  name: string;
  image: string | null;
  note: string | null;
  size: string | null;
  sizeCustom: string | null;
  color: string | null;
  colorCustom: string | null;
  material: string | null;
  materialCustom: string | null;
  quantity: number | null;
  priceSnapshot: string | null;
  tierLabel: string | null;
  uploads: Array<{
    storage_path: string;
    original_filename: string;
    mime_type: string | null;
    size_bytes: number | null;
    kind: UploadKind | null;
  }>;
} {
  return {
    slug: String(raw.slug),
    name: String(raw.name),
    image: raw.image?.toString() ?? null,
    note: raw.note?.trim() || null,
    size: raw.size?.toString() || null,
    sizeCustom: raw.sizeCustom?.trim() || null,
    color: raw.color?.toString() || null,
    colorCustom: raw.colorCustom?.trim() || null,
    material: raw.material?.toString() || null,
    materialCustom: raw.materialCustom?.trim() || null,
    quantity:
      typeof raw.quantity === "number" && Number.isFinite(raw.quantity)
        ? Math.max(1, Math.floor(raw.quantity))
        : null,
    priceSnapshot: raw.priceSnapshot?.toString() || null,
    tierLabel: raw.tierLabel?.toString() || null,
    uploads: Array.isArray(raw.uploads)
      ? raw.uploads
          .filter(
            (u): u is InquiryUploadPayload =>
              !!u && typeof u.storagePath === "string" && typeof u.originalFilename === "string",
          )
          .map((u) => ({
            storage_path: u.storagePath,
            original_filename: u.originalFilename,
            mime_type: u.mimeType ?? null,
            size_bytes:
              typeof u.sizeBytes === "number" && Number.isFinite(u.sizeBytes)
                ? Math.floor(u.sizeBytes)
                : null,
            kind: isValidUploadKind(u.kind) ? u.kind : null,
          }))
      : [],
  };
}

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const locale: "en" | "zh" = body.locale === "zh" ? "zh" : "en";

  const contactMethod =
    body.contactMethod && isValidContactMethod(body.contactMethod)
      ? body.contactMethod
      : undefined;

  const items: ReturnType<typeof sanitizeItem>[] = Array.isArray(body.items)
    ? body.items
        .filter(
          (i): i is InquiryItemPayload =>
            !!i && typeof i.slug === "string" && typeof i.name === "string",
        )
        .map(sanitizeItem)
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
        product_image_snapshot: i.image,
        quantity: i.quantity,
        variants: buildVariantsJson(i),
        customization_notes: i.note,
        price_snapshot: i.priceSnapshot,
      }));
      const { data: insertedItems, error: itemsErr } = await supabase
        .from("inquiry_items")
        .insert(itemRows)
        .select("id");
      if (itemsErr || !insertedItems) {
        console.error("[inquiry] items insert failed", itemsErr, { inquiryId });
      } else {
        // Aggregate uploads across all items, tagging each with the
        // corresponding inserted item_id.
        const uploadRows = items.flatMap((item, idx) =>
          item.uploads.map((u) => ({
            inquiry_id: inquiry.id,
            item_id: insertedItems[idx]?.id ?? null,
            storage_path: u.storage_path,
            original_filename: u.original_filename,
            mime_type: u.mime_type,
            size_bytes: u.size_bytes,
            kind: u.kind,
          })),
        );
        if (uploadRows.length > 0) {
          const { error: uploadsErr } = await supabase
            .from("inquiry_uploads")
            .insert(uploadRows);
          if (uploadsErr) {
            console.error("[inquiry] uploads insert failed", uploadsErr, {
              inquiryId,
            });
          }
        }
      }
    }
  } else {
    requestId = `LOCAL-DEV-${Date.now()}`;
    console.info("[inquiry] Supabase not configured — running in log-only mode", {
      requestId,
      inquiry: inquiryRecord,
      items,
    });
  }

  // Generate signed download URLs for all attachments so sales can open
  // files straight from the email without admin login. 7-day TTL.
  // Skipped silently when Supabase isn't configured.
  const signedUrlMap = new Map<string, string>();
  if (supabase) {
    const allPaths = items.flatMap((i) => i.uploads.map((u) => u.storage_path));
    if (allPaths.length > 0) {
      const { data: signed, error: signErr } = await supabase.storage
        .from(INQUIRY_UPLOADS_BUCKET)
        .createSignedUrls(allPaths, SIGNED_URL_TTL_SECONDS);
      if (signErr) {
        console.error("[inquiry] signed URL generation failed", signErr);
      } else if (signed) {
        for (const entry of signed) {
          if (entry.path && entry.signedUrl && !entry.error) {
            signedUrlMap.set(entry.path, entry.signedUrl);
          }
        }
      }
    }
  }

  // Email notification (best-effort).
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
      quantity: i.quantity ?? undefined,
      size: i.size ?? undefined,
      sizeCustom: i.sizeCustom ?? undefined,
      color: i.color ?? undefined,
      colorCustom: i.colorCustom ?? undefined,
      material: i.material ?? undefined,
      materialCustom: i.materialCustom ?? undefined,
      priceSnapshot: i.priceSnapshot ?? undefined,
      tierLabel: i.tierLabel ?? undefined,
      customizationNotes: i.note ?? undefined,
      uploads: i.uploads.map((u) => ({
        originalFilename: u.original_filename,
        sizeBytes: u.size_bytes ?? 0,
        kind: u.kind ?? undefined,
        storagePath: u.storage_path,
        signedUrl: signedUrlMap.get(u.storage_path),
      })),
    })),
    createdAt,
  });

  return NextResponse.json({ ok: true, requestId, inquiryId });
}

function buildVariantsJson(
  i: ReturnType<typeof sanitizeItem>,
): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  if (i.size) out.size = i.size;
  if (i.sizeCustom) out.sizeCustom = i.sizeCustom;
  if (i.color) out.color = i.color;
  if (i.colorCustom) out.colorCustom = i.colorCustom;
  if (i.material) out.material = i.material;
  if (i.materialCustom) out.materialCustom = i.materialCustom;
  if (i.tierLabel) out.tierLabel = i.tierLabel;
  return Object.keys(out).length > 0 ? out : null;
}
