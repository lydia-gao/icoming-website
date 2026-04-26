"use client";

import { useRef } from "react";
import { uiContent } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import {
  isAcceptedFile,
  MAX_UPLOAD_BYTES,
  type UploadKind,
} from "@/lib/uploads";
import type { StoredUpload } from "@/lib/inquiry-context";

export type PendingFile = {
  localId: string;
  file: File;
  kind: UploadKind;
  error?: string;
};

const ACCEPT_ATTR =
  ".pdf,.png,.jpg,.jpeg,.svg,.ai,application/pdf,image/png,image/jpeg,image/svg+xml,application/postscript";

/**
 * Generate a unique local ID for a pending file. Used until the file
 * actually uploads — at which point we use the storagePath as the
 * persisted identifier.
 */
export function newPendingFileId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validate a File against accepted types + size limit. Returns an
 * error message string or undefined.
 */
export function validatePendingFile(
  file: File,
  ui: { tooLarge: (name: string) => string; wrongType: (name: string) => string },
): string | undefined {
  if (!isAcceptedFile(file)) return ui.wrongType(file.name);
  if (file.size > MAX_UPLOAD_BYTES) return ui.tooLarge(file.name);
  return undefined;
}

type Props = {
  locale: Locale;
  pendingFiles: PendingFile[];
  existingUploads: StoredUpload[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemovePending: (localId: string) => void;
  onChangeKind: (localId: string, kind: UploadKind) => void;
  onRemoveExisting: (storagePath: string) => void;
};

/**
 * Compact upload UI used on the product detail page. Files are held
 * pending in the parent's state; uploads happen at "Add to Inquiry"
 * time so we don't orphan files for casual browsers.
 */
export function ProductUploads({
  locale,
  pendingFiles,
  existingUploads,
  onAddFiles,
  onRemovePending,
  onChangeKind,
  onRemoveExisting,
}: Props) {
  const ui = uiContent[locale].productDetail.uploads;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalAttached = existingUploads.length + pendingFiles.length;

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-base font-semibold text-ink-900">
          {ui.heading}
        </h3>
        {totalAttached > 0 && (
          <span className="text-xs text-ink-400">
            {pendingFiles.length + existingUploads.length}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-500">{ui.help}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={(e) => {
          if (e.target.files) onAddFiles(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn-secondary mt-3 inline-flex items-center gap-2 text-sm"
      >
        <PlusIcon className="h-4 w-4" aria-hidden />
        {ui.addButton}
      </button>

      {(existingUploads.length > 0 || pendingFiles.length > 0) && (
        <ul className="mt-3 space-y-1.5">
          {existingUploads.map((upload) => (
            <li
              key={upload.storagePath}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-moss-100/60 px-3 py-2 text-xs text-ink-700 ring-1 ring-moss-100"
            >
              <span className="flex-1 min-w-0 truncate font-medium text-ink-900">
                {upload.originalFilename}
              </span>
              <span className="text-[0.7rem] text-ink-400">
                {formatBytes(upload.sizeBytes)}
              </span>
              <span className="rounded-md bg-white px-2 py-0.5 text-[0.7rem] uppercase tracking-wide text-moss-700">
                {ui.kinds[upload.kind]}
              </span>
              <button
                type="button"
                onClick={() => onRemoveExisting(upload.storagePath)}
                aria-label={ui.removeAria(upload.originalFilename)}
                className="text-ink-400 hover:text-clay-600"
              >
                ✕
              </button>
            </li>
          ))}
          {pendingFiles.map((att) => (
            <li
              key={att.localId}
              className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs ring-1 ${
                att.error
                  ? "bg-clay-500/10 text-clay-600 ring-clay-500/30"
                  : "bg-sand-50 text-ink-700 ring-ink-100"
              }`}
            >
              <span className="flex-1 min-w-0 truncate font-medium text-ink-900">
                {att.file.name}
              </span>
              <span className="text-[0.7rem] text-ink-400">
                {formatBytes(att.file.size)}
              </span>
              <select
                aria-label={ui.kindLabel}
                value={att.kind}
                onChange={(e) =>
                  onChangeKind(att.localId, e.target.value as UploadKind)
                }
                className="rounded-md border-ink-100 bg-white text-xs focus:border-moss-500 focus:ring-moss-500"
              >
                <option value="logo">{ui.kinds.logo}</option>
                <option value="design_brief">{ui.kinds.design_brief}</option>
                <option value="artwork">{ui.kinds.artwork}</option>
                <option value="reference">{ui.kinds.reference}</option>
              </select>
              <button
                type="button"
                onClick={() => onRemovePending(att.localId)}
                aria-label={ui.removeAria(att.file.name)}
                className="text-ink-400 hover:text-clay-600"
              >
                ✕
              </button>
              {att.error && (
                <span className="basis-full text-[0.7rem]">{att.error}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function PlusIcon({
  className = "",
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
