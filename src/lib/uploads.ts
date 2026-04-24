import { getBrowserSupabase } from "./supabase-browser";

export const INQUIRY_UPLOADS_BUCKET = "inquiry-uploads";

export const ACCEPTED_UPLOAD_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".svg", ".ai"] as const;
export const ACCEPTED_UPLOAD_MIME_PREFIXES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/postscript",   // .ai / .eps
  "application/illustrator",  // some browsers
  "application/octet-stream", // browsers sometimes fall back for .ai
] as const;

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

export type UploadKind = "logo" | "design_brief" | "artwork" | "reference";

export type UploadResult = {
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  kind: UploadKind;
};

export function isAcceptedFile(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (ext && (ACCEPTED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  return (ACCEPTED_UPLOAD_MIME_PREFIXES as readonly string[]).some((m) =>
    file.type.startsWith(m),
  );
}

/**
 * Upload a single file to the inquiry-uploads bucket. Returns the storage
 * path + metadata on success, or null on failure (the caller logs and
 * continues — a failed upload must not block the inquiry submission).
 */
export async function uploadInquiryFile(
  file: File,
  kind: UploadKind,
): Promise<UploadResult | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  const fileId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const storagePath = `${fileId}/${safeName}`;

  const { error } = await supabase.storage
    .from(INQUIRY_UPLOADS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    console.error("[inquiry] upload failed", error);
    return null;
  }

  return {
    storagePath,
    originalFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    kind,
  };
}
