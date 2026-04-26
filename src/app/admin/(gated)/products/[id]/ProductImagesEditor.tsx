"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { cmsImageUrl } from "@/lib/cms";
import {
  isAcceptedCmsImage,
  MAX_CMS_IMAGE_BYTES,
  uploadCmsImage,
} from "@/lib/cms-uploads";

type ImageState = {
  storage_path: string;
  alt_en: string;
  alt_zh: string;
  is_primary: boolean;
};

type Props = {
  productId: string;
  productNameEn: string;
  productNameZh: string;
  initial: ImageState[];
};

export function ProductImagesEditor({
  productId,
  productNameEn,
  productNameZh,
  initial,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageState[]>(initial);
  const [baseline, setBaseline] = useState<ImageState[]>(initial);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(images) !== JSON.stringify(baseline),
    [images, baseline],
  );
  const uploading = uploadingCount > 0;

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    setUploadError(null);
    for (const file of files) {
      if (!isAcceptedCmsImage(file)) {
        setUploadError(
          `${file.name}: file type not supported (JPG, PNG, WebP, or GIF).`,
        );
        continue;
      }
      if (file.size > MAX_CMS_IMAGE_BYTES) {
        setUploadError(`${file.name}: too large (10 MB max).`);
        continue;
      }

      setUploadingCount((n) => n + 1);
      const result = await uploadCmsImage(file);
      setUploadingCount((n) => n - 1);

      if (!result) {
        setUploadError(`${file.name}: upload failed. Try again?`);
        continue;
      }

      setImages((prev) => {
        const hasPrimary = prev.some((i) => i.is_primary);
        return [
          ...prev,
          {
            storage_path: result.path,
            alt_en: productNameEn,
            alt_zh: productNameZh,
            is_primary: !hasPrimary,
          },
        ];
      });
    }
  }

  function handlePickFiles() {
    fileInputRef.current?.click();
  }

  function setAlt(idx: number, locale: "en" | "zh", value: string) {
    setImages((prev) => {
      const next = [...prev];
      const key = locale === "en" ? "alt_en" : "alt_zh";
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  function setPrimary(idx: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === idx })),
    );
  }

  function moveImage(idx: number, delta: -1 | 1) {
    setImages((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const wasPrimary = prev[idx]?.is_primary;
      const next = prev.filter((_, i) => i !== idx);
      if (wasPrimary && next.length > 0) {
        next[0] = { ...next[0], is_primary: true };
      }
      return next;
    });
  }

  async function handleSave() {
    if (saving || uploading) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        images: images.map((img) => ({
          storage_path: img.storage_path,
          alt_en: img.alt_en.trim() || null,
          alt_zh: img.alt_zh.trim() || null,
          is_primary: img.is_primary,
        })),
      };
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setBaseline(images);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setImages(baseline);
    setSaveError(null);
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink-900">
          Images
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          The first image is shown on product cards and search results
          unless you mark a different one as primary. Drag-and-drop or
          click to upload — JPG / PNG / WebP / GIF up to 10 MB each.
        </p>
      </div>

      {/* Hidden file input — triggered by the visible button + drop zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="sr-only"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center text-sm transition ${
          dragOver
            ? "border-moss-500 bg-moss-50/40"
            : "border-ink-100 bg-sand-50/60"
        }`}
      >
        <p className="text-ink-600">
          Drop image files here, or{" "}
          <button
            type="button"
            onClick={handlePickFiles}
            disabled={saving}
            className="font-semibold text-moss-700 underline hover:text-moss-800 disabled:opacity-50"
          >
            choose files
          </button>
          .
        </p>
        {uploading && (
          <p className="mt-2 text-xs text-moss-700">
            Uploading {uploadingCount} file{uploadingCount === 1 ? "" : "s"}…
          </p>
        )}
        {uploadError && (
          <p className="mt-2 text-xs text-clay-600">{uploadError}</p>
        )}
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-sand-50 p-5 text-center text-sm text-ink-500">
          No images yet. Drop in product photos above to start.
        </div>
      ) : (
        <ul className="space-y-3">
          {images.map((img, idx) => {
            const url = cmsImageUrl(img.storage_path);
            return (
              <li
                key={`${img.storage_path}-${idx}`}
                className={`grid grid-cols-1 items-start gap-4 rounded-xl bg-sand-50/70 p-3 ring-1 ${
                  img.is_primary
                    ? "ring-moss-500/40"
                    : "ring-ink-100"
                } sm:grid-cols-[8rem_1fr_auto]`}
              >
                <div className="relative h-24 w-32 overflow-hidden rounded-lg bg-sand-100 ring-1 ring-ink-100">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={img.alt_en || img.alt_zh || "Product image"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-400">
                      No preview
                    </div>
                  )}
                  {img.is_primary && (
                    <div className="absolute left-1.5 top-1.5 rounded-full bg-moss-700/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                      ★ Primary
                    </div>
                  )}
                  <div className="absolute right-1.5 bottom-1.5 rounded-full bg-ink-900/80 px-2 py-0.5 text-[0.65rem] font-mono text-white">
                    #{idx + 1}
                  </div>
                </div>

                <div className="min-w-0 space-y-2">
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-ink-500">
                      Alt text (EN)
                    </span>
                    <input
                      type="text"
                      value={img.alt_en}
                      onChange={(e) => setAlt(idx, "en", e.target.value)}
                      disabled={saving}
                      placeholder={productNameEn || "Describe the image"}
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-medium text-ink-500">
                      Alt text (中文)
                    </span>
                    <input
                      type="text"
                      value={img.alt_zh}
                      onChange={(e) => setAlt(idx, "zh", e.target.value)}
                      disabled={saving}
                      placeholder={productNameZh || "图片描述"}
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                </div>

                <div className="flex flex-row flex-wrap items-start gap-1 sm:flex-col sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0 || saving}
                    aria-label="Move up"
                    className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1 || saving}
                    aria-label="Move down"
                    className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    disabled={img.is_primary || saving}
                    className="rounded-md border border-ink-100 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
                  >
                    {img.is_primary ? "Primary" : "Make primary"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={saving}
                    className="rounded-md border border-ink-100 bg-white px-2.5 py-1 text-xs font-medium text-clay-600 hover:border-clay-500/50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || uploading}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save images"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!dirty || saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300 disabled:opacity-50"
        >
          Cancel
        </button>
        {dirty && !saveError && !savedFlash && (
          <span className="text-xs font-medium text-clay-600">
            Unsaved changes
          </span>
        )}
        {savedFlash && !dirty && (
          <span className="text-xs text-moss-700">Saved ✓</span>
        )}
        {saveError && <span className="text-xs text-clay-600">{saveError}</span>}
      </div>
    </div>
  );
}
