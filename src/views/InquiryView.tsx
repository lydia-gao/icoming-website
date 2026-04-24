"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useInquiry, type InquiryItem } from "@/lib/inquiry-context";
import { localizedCompany } from "@/data/company";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import {
  companyWhatsappNumber,
  inquiryWhatsappMessage,
  whatsappDeeplink,
  type WhatsAppProduct,
} from "@/lib/whatsapp";
import {
  isAcceptedFile,
  MAX_UPLOAD_BYTES,
  uploadInquiryFile,
  type UploadKind,
  type UploadResult,
} from "@/lib/uploads";

type FormState = "idle" | "submitting" | "success" | "error";

type ContactMethod =
  | ""
  | "whatsapp"
  | "wechat"
  | "phone"
  | "telegram"
  | "line"
  | "other";

type LocalAttachment = {
  localId: string;
  file: File;
  kind: UploadKind;
  error?: string;
};

type SuccessData = {
  requestId: string;
  name: string;
  company?: string;
  products: WhatsAppProduct[];
};

const MAX_ATTACHMENTS_PER_ITEM = 10;

export function InquiryView({ locale }: { locale: Locale }) {
  const { items, hydrated, remove, updateNote, clear } = useInquiry();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [attachmentsBySlug, setAttachmentsBySlug] = useState<
    Record<string, LocalAttachment[]>
  >({});
  const company = localizedCompany(locale);
  const ui = uiContent[locale].inquiryPage;

  const attachmentStateSetter = (slug: string) => (
    updater: (prev: LocalAttachment[]) => LocalAttachment[],
  ) => {
    setAttachmentsBySlug((prev) => {
      const next = { ...prev };
      next[slug] = updater(next[slug] ?? []);
      return next;
    });
  };

  const handleFiles = (slug: string, files: FileList | File[]) => {
    const current = attachmentsBySlug[slug] ?? [];
    const remaining = MAX_ATTACHMENTS_PER_ITEM - current.length;
    const accepted: LocalAttachment[] = [];
    for (const file of Array.from(files).slice(0, Math.max(0, remaining))) {
      const localId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      let error: string | undefined;
      if (!isAcceptedFile(file)) {
        error = ui.uploads.wrongType(file.name);
      } else if (file.size > MAX_UPLOAD_BYTES) {
        error = ui.uploads.tooLarge(file.name);
      }
      accepted.push({ localId, file, kind: "reference", error });
    }
    if (accepted.length > 0) {
      attachmentStateSetter(slug)((prev) => [...prev, ...accepted]);
    }
  };

  const removeAttachment = (slug: string, localId: string) => {
    attachmentStateSetter(slug)((prev) => prev.filter((a) => a.localId !== localId));
  };

  const updateAttachmentKind = (slug: string, localId: string, kind: UploadKind) => {
    attachmentStateSetter(slug)((prev) =>
      prev.map((a) => (a.localId === localId ? { ...a, kind } : a)),
    );
  };

  const itemSummary = useMemo(
    () =>
      items.map((i) => ({
        slug: i.slug,
        name: i.name,
        image: i.image,
        note: i.note ?? "",
      })),
    [items],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const methodRaw = (formData.get("contactMethod") as string) || "";
    const method = methodRaw === "" ? undefined : (methodRaw as Exclude<ContactMethod, "">);
    const handle = ((formData.get("contactHandle") as string) || "").trim() || undefined;
    const otherPlatform =
      ((formData.get("otherPlatform") as string) || "").trim() || undefined;

    const submittedName = ((formData.get("name") as string) || "").trim();
    const submittedCompany =
      ((formData.get("company") as string) || "").trim() || undefined;

    // Reject any attachments with pre-existing validation errors.
    const hasBadFiles = Object.values(attachmentsBySlug)
      .flat()
      .some((a) => a.error);
    if (hasBadFiles) {
      setFormState("error");
      setErrorMessage(ui.uploads.uploadFailed);
      return;
    }

    // Upload attachments (browser → Supabase Storage) BEFORE calling our
    // API. Each item's uploads are collected and passed through as metadata.
    const uploadsBySlug: Record<string, UploadResult[]> = {};
    const anyFiles = Object.values(attachmentsBySlug).some((a) => a.length > 0);
    let uploadsFailed = false;

    if (anyFiles) {
      for (const [slug, attachments] of Object.entries(attachmentsBySlug)) {
        uploadsBySlug[slug] = [];
        for (const att of attachments) {
          const result = await uploadInquiryFile(att.file, att.kind);
          if (result) {
            uploadsBySlug[slug].push(result);
          } else {
            uploadsFailed = true;
          }
        }
      }
    }

    const payload = {
      locale,
      name: submittedName,
      email: ((formData.get("email") as string) || "").trim(),
      company: submittedCompany,
      contactMethod: method,
      contactHandle: handle,
      otherPlatformName: method === "other" ? otherPlatform : undefined,
      message: ((formData.get("message") as string) || "").trim() || undefined,
      items: items.map((item) => ({
        slug: item.slug,
        name: item.name,
        image: item.image,
        note: item.note?.trim() || undefined,
        size: item.size,
        sizeCustom: item.sizeCustom,
        color: item.color,
        colorCustom: item.colorCustom,
        material: item.material,
        materialCustom: item.materialCustom,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        tierLabel: item.tierLabel,
        uploads: uploadsBySlug[item.slug]?.map((u) => ({
          storagePath: u.storagePath,
          originalFilename: u.originalFilename,
          mimeType: u.mimeType,
          sizeBytes: u.sizeBytes,
          kind: u.kind,
        })),
      })),
    };

    const successProducts: WhatsAppProduct[] = items.map((item) => ({
      name: item.name,
      size: item.sizeCustom ?? item.size,
      color: item.colorCustom ?? item.color,
      material: item.materialCustom ?? item.material,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
    }));

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        requestId?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.requestId) {
        throw new Error(body.error ?? "Submission failed");
      }
      setSuccessData({
        requestId: body.requestId,
        name: submittedName,
        company: submittedCompany,
        products: successProducts,
      });
      clear();
      setAttachmentsBySlug({});
      form.reset();
      setPreferredContact("");
      setFormState("success");
      if (uploadsFailed) {
        // Still show success; warn in console for debugging. Success page
        // itself doesn't surface this — the inquiry is saved.
        console.warn("[inquiry] some attachments failed to upload");
      }
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  if (!hydrated) {
    return (
      <section className="py-16">
        <div className="container-content">
          <div className="text-ink-400">{ui.loading}</div>
        </div>
      </section>
    );
  }

  if (formState === "success" && successData) {
    const waHref = whatsappDeeplink(
      companyWhatsappNumber,
      inquiryWhatsappMessage(locale, successData),
    );
    return (
      <section className="py-20">
        <div className="container-content max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tight text-ink-900 sm:text-4xl">
            {ui.success.heading}
          </h1>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-moss-100 px-4 py-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-moss-700">
              {ui.success.requestIdLabel}
            </span>
            <span className="font-mono text-sm font-semibold text-moss-800">
              {successData.requestId}
            </span>
          </div>

          <p className="mt-6 text-ink-600">{ui.success.emailNotice}</p>
          <p className="mt-3 text-sm text-ink-400">{ui.success.extraContactNotice}</p>

          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-ink-100">
            <h2 className="font-serif text-lg font-semibold text-ink-900">
              {ui.success.fasterFollowupHeading}
            </h2>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1DA851]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {ui.success.whatsappButton}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={localePath(locale, "/products")} className="btn-primary">
              {ui.success.keepBrowsing}
            </Link>
            <Link href={localePath(locale, "/")} className="btn-secondary">
              {ui.success.backToHome}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleLabel = ui.form.contactHandleLabels;
  const handleConfig = contactMethodInputConfig(preferredContact);

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <div className="eyebrow">{ui.eyebrow}</div>
          <h1 className="section-heading mt-2">{ui.heading}</h1>
          <p className="mt-3 max-w-2xl text-ink-600">{ui.intro}</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <form onSubmit={handleSubmit} className="container-content grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Items */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink-900">
                {ui.savedProducts(items.length)}
              </h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setAttachmentsBySlug({});
                  }}
                  className="text-sm text-ink-400 hover:text-clay-600"
                >
                  {ui.clearAll}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-ink-100 bg-white p-10 text-center">
                <p className="text-ink-600">
                  {ui.emptyBasketA}{" "}
                  <span className="font-medium">
                    {uiContent[locale].saveButton.save}
                  </span>{" "}
                  {ui.emptyBasketB}
                </p>
                <Link href={localePath(locale, "/products")} className="btn-primary mt-6">
                  {ui.browseProducts}
                </Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <InquiryLineItem
                    key={item.slug}
                    item={item}
                    locale={locale}
                    onRemove={() => {
                      remove(item.slug);
                      attachmentStateSetter(item.slug)(() => []);
                    }}
                    onNoteChange={(note) => updateNote(item.slug, note)}
                    attachments={attachmentsBySlug[item.slug] ?? []}
                    onFilesAdded={(files) => handleFiles(item.slug, files)}
                    onRemoveAttachment={(localId) =>
                      removeAttachment(item.slug, localId)
                    }
                    onChangeKind={(localId, kind) =>
                      updateAttachmentKind(item.slug, localId, kind)
                    }
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Contact form */}
          <aside>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-ink-100">
              <h2 className="font-serif text-xl font-semibold text-ink-900">
                {ui.yourDetails}
              </h2>
              <p className="mt-1 text-sm text-ink-600">{ui.yourDetailsNote}</p>

              <div className="mt-6 space-y-4">
                <label className="block text-sm">
                  <span className="font-medium text-ink-800">{ui.form.name}</span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">{ui.form.email}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">{ui.form.company}</span>
                  <input
                    name="company"
                    autoComplete="organization"
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  />
                </label>

                <div className="space-y-3 rounded-xl bg-sand-50/80 p-3 ring-1 ring-ink-100/70">
                  <label className="block text-sm">
                    <span className="font-medium text-ink-800">
                      {ui.form.preferredContact}
                    </span>
                    <select
                      name="contactMethod"
                      value={preferredContact}
                      onChange={(e) =>
                        setPreferredContact(e.target.value as ContactMethod)
                      }
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                    >
                      <option value="">{ui.form.contactMethodOptions.none}</option>
                      <option value="whatsapp">
                        {ui.form.contactMethodOptions.whatsapp}
                      </option>
                      <option value="wechat">
                        {ui.form.contactMethodOptions.wechat}
                      </option>
                      <option value="phone">
                        {ui.form.contactMethodOptions.phone}
                      </option>
                      <option value="telegram">
                        {ui.form.contactMethodOptions.telegram}
                      </option>
                      <option value="line">
                        {ui.form.contactMethodOptions.line}
                      </option>
                      <option value="other">
                        {ui.form.contactMethodOptions.other}
                      </option>
                    </select>
                    <span className="mt-1 block text-xs text-ink-400">
                      {ui.form.preferredContactHelp}
                    </span>
                  </label>

                  {preferredContact === "other" && (
                    <label className="block text-sm">
                      <span className="font-medium text-ink-800">
                        {ui.form.otherPlatformLabel}
                      </span>
                      <input
                        name="otherPlatform"
                        required
                        className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                      />
                    </label>
                  )}

                  {preferredContact !== "" && (
                    <label className="block text-sm">
                      <span className="font-medium text-ink-800">
                        {preferredContact === "other"
                          ? handleLabel.other
                          : handleLabel[preferredContact]}
                      </span>
                      <input
                        name="contactHandle"
                        required
                        type={handleConfig.type}
                        inputMode={handleConfig.inputMode}
                        autoComplete={handleConfig.autoComplete}
                        className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                      />
                    </label>
                  )}
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">{ui.form.message}</span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={ui.form.messagePlaceholder}
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  />
                </label>

                {formState === "error" && errorMessage && (
                  <div className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="btn-primary w-full"
                >
                  {formState === "submitting" ? ui.form.submitting : ui.form.submit}
                </button>

                <p className="text-center text-xs text-ink-400">
                  {ui.form.orEmailDirectly}{" "}
                  <a
                    href={`mailto:${company.contact.primaryEmail}`}
                    className="underline hover:text-ink-800"
                  >
                    {company.contact.primaryEmail}
                  </a>
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </>
  );
}

// =============================================================================
// InquiryLineItem — one row per saved product. Renders variant chips,
// note textarea, and attachment upload UI.
// =============================================================================

function InquiryLineItem({
  item,
  locale,
  onRemove,
  onNoteChange,
  attachments,
  onFilesAdded,
  onRemoveAttachment,
  onChangeKind,
}: {
  item: InquiryItem;
  locale: Locale;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
  attachments: LocalAttachment[];
  onFilesAdded: (files: FileList | File[]) => void;
  onRemoveAttachment: (localId: string) => void;
  onChangeKind: (localId: string, kind: UploadKind) => void;
}) {
  const ui = uiContent[locale].inquiryPage;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const variantChips = buildVariantChips(item, ui.variantLabels);

  return (
    <li className="rounded-2xl bg-white p-4 ring-1 ring-ink-100">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={localePath(locale, `/products/${item.slug}`)}
              className="font-semibold text-ink-900 hover:underline"
            >
              {item.name}
            </Link>
            <button
              type="button"
              onClick={onRemove}
              aria-label={ui.removeAria(item.name)}
              className="text-xs text-ink-400 hover:text-clay-600"
            >
              {ui.remove}
            </button>
          </div>

          {variantChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variantChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs text-moss-800"
                >
                  <span className="text-[0.65rem] uppercase tracking-[0.12em] text-moss-700/70">
                    {chip.label}
                  </span>
                  <span className="font-medium">{chip.value}</span>
                </span>
              ))}
            </div>
          )}

          <textarea
            defaultValue={item.note ?? ""}
            onBlur={(e) => onNoteChange(e.target.value)}
            placeholder={ui.notesPlaceholder}
            rows={2}
            className="mt-3 w-full resize-y rounded-lg border-ink-100 bg-sand-50 px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:border-moss-500 focus:ring-moss-500"
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="mt-3 border-t border-ink-100 pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink-900">
            {ui.uploads.heading}
          </h3>
          <span className="text-xs text-ink-400">{ui.uploads.help}</span>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length > 0) onFilesAdded(e.dataTransfer.files);
          }}
          className={`mt-2 block cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm transition ${
            isDragging
              ? "border-moss-500 bg-moss-50/40 text-moss-700"
              : "border-ink-100 bg-sand-50/60 text-ink-500 hover:border-ink-800/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,application/pdf,image/png,image/jpeg,image/svg+xml,application/postscript"
            multiple
            onChange={(e) => {
              if (e.target.files) onFilesAdded(e.target.files);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="sr-only"
          />
          {ui.uploads.dropzone}
        </label>

        {attachments.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {attachments.map((att) => (
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
                  aria-label={ui.uploads.kindLabel}
                  value={att.kind}
                  onChange={(e) =>
                    onChangeKind(att.localId, e.target.value as UploadKind)
                  }
                  className="rounded-md border-ink-100 bg-white text-xs focus:border-moss-500 focus:ring-moss-500"
                >
                  <option value="logo">{ui.uploads.kinds.logo}</option>
                  <option value="design_brief">{ui.uploads.kinds.design_brief}</option>
                  <option value="artwork">{ui.uploads.kinds.artwork}</option>
                  <option value="reference">{ui.uploads.kinds.reference}</option>
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.localId)}
                  aria-label={ui.uploads.removeAria(att.file.name)}
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
      </div>
    </li>
  );
}

function buildVariantChips(
  item: InquiryItem,
  labels: {
    size: string;
    color: string;
    material: string;
    quantity: string;
    tier: string;
    custom: string;
  },
): Array<{ label: string; value: string }> {
  const chips: Array<{ label: string; value: string }> = [];
  const sizeVal = item.sizeCustom ?? item.size;
  if (sizeVal) {
    chips.push({
      label: labels.size,
      value: item.sizeCustom ? `${sizeVal} (${labels.custom})` : sizeVal,
    });
  }
  const colorVal = item.colorCustom ?? item.color;
  if (colorVal) {
    chips.push({
      label: labels.color,
      value: item.colorCustom ? `${colorVal} (${labels.custom})` : colorVal,
    });
  }
  const materialVal = item.materialCustom ?? item.material;
  if (materialVal) {
    chips.push({
      label: labels.material,
      value: item.materialCustom ? `${materialVal} (${labels.custom})` : materialVal,
    });
  }
  if (item.quantity != null) {
    chips.push({ label: labels.quantity, value: `${item.quantity}` });
  }
  if (item.priceSnapshot) {
    const suffix = item.tierLabel ? ` · ${item.tierLabel}` : "";
    chips.push({ label: labels.tier, value: `${item.priceSnapshot}${suffix}` });
  }
  return chips;
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function contactMethodInputConfig(method: ContactMethod): {
  type: "tel" | "text";
  inputMode: "tel" | "text";
  autoComplete: string | undefined;
} {
  switch (method) {
    case "whatsapp":
    case "phone":
      return { type: "tel", inputMode: "tel", autoComplete: "tel" };
    default:
      return { type: "text", inputMode: "text", autoComplete: undefined };
  }
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.11 17.34c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.27-.72.9-.88 1.08-.16.18-.33.2-.6.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.38-1.65-1.54-1.93-.16-.28-.02-.43.12-.57.12-.13.28-.33.41-.5.14-.17.18-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.18 0-.48.07-.73.34-.25.28-.96.93-.96 2.27 0 1.34.98 2.64 1.12 2.82.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.2 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.11-.25-.18-.53-.32zM16 4C9.4 4 4 9.4 4 16c0 2.11.55 4.18 1.6 6L4 28l6.2-1.62A11.95 11.95 0 0016 28c6.6 0 12-5.4 12-12S22.6 4 16 4zm0 21.89c-1.84 0-3.64-.5-5.22-1.43l-.37-.22-3.68.96.98-3.58-.24-.38A9.89 9.89 0 016.1 16c0-5.46 4.44-9.9 9.9-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.46-4.44 9.89-9.9 9.89z" />
    </svg>
  );
}
