import { getBrowserSupabase } from "./supabase-browser";

/**
 * Browser-side helpers for uploading CMS images directly to the
 * `cms-images` Supabase Storage bucket.
 *
 * RLS gates inserts to admins (`is_admin()` policy on storage.objects),
 * so the publishable key + an authenticated admin session is what
 * authorizes the upload — no server roundtrip required.
 *
 * Mirrors the inquiry-uploads helper but accepts only image types and
 * caps file size more aggressively, since these go directly into the
 * public marketing site.
 */

export const CMS_IMAGES_BUCKET = "cms-images";

export const ACCEPTED_CMS_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

export const ACCEPTED_CMS_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_CMS_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export type CmsUploadResult = {
  path: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export function isAcceptedCmsImage(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (ext && (ACCEPTED_CMS_IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  return (ACCEPTED_CMS_IMAGE_MIMES as readonly string[]).includes(
    file.type as (typeof ACCEPTED_CMS_IMAGE_MIMES)[number],
  );
}

/**
 * Uploads one image file to the cms-images bucket. Returns metadata on
 * success or null on failure (caller surfaces the error in the UI).
 *
 * The storage path is `<random-uuid><ext>` — flat layout, no nesting.
 * Filenames are not preserved server-side because they're not surfaced
 * to viewers; the public URL uses the storage path.
 */
export async function uploadCmsImage(
  file: File,
): Promise<CmsUploadResult | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  const fileId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const path = `${fileId}${ext}`;

  const { error } = await supabase.storage
    .from(CMS_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    console.error("[cms] upload failed", error);
    return null;
  }

  return {
    path,
    originalFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}
