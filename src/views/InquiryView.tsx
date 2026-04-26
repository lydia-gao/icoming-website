"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInquiry,
  type InquiryItem,
  type StoredUpload,
} from "@/lib/inquiry-context";
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
} from "@/lib/uploads";

type FormState = "idle" | "submitting" | "error";

const SUCCESS_STORAGE_PREFIX = "icoming.inquiry.success.";

const ACCEPT_ATTR =
  ".pdf,.png,.jpg,.jpeg,.svg,.ai,application/pdf,image/png,image/jpeg,image/svg+xml,application/postscript";

type ContactMethod =
  | ""
  | "whatsapp"
  | "wechat"
  | "phone"
  | "telegram"
  | "line"
  | "other";

type SuccessData = {
  requestId: string;
  name: string;
  company?: string;
  message?: string;
  products: WhatsAppProduct[];
};

export function InquiryView({ locale }: { locale: Locale }) {
  const {
    items,
    hydrated,
    remove,
    updateNote,
    clear,
    attachUpload,
    removeUpload,
    generalUploads,
    attachGeneralUpload,
    removeGeneralUpload,
  } = useInquiry();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submittedParam = searchParams?.get("submitted") ?? null;
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [uploadingGeneral, setUploadingGeneral] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const company = localizedCompany(locale);
  const ui = uiContent[locale].inquiryPage;

  // Success state is driven by the URL (`?submitted=<requestId>`) backed
  // by sessionStorage. Nav events that drop the query param (including
  // clicking the header's "Inquiry" link) clear the success view because
  // useSearchParams is reactive. Refresh on the success URL still works
  // because sessionStorage persists for the tab's lifetime.
  useEffect(() => {
    if (!submittedParam) {
      setSuccessData(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem(SUCCESS_STORAGE_PREFIX + submittedParam);
      setSuccessData(raw ? (JSON.parse(raw) as SuccessData) : null);
    } catch {
      setSuccessData(null);
    }
  }, [submittedParam]);

  const validateAndPickError = (file: File): string | null => {
    if (!isAcceptedFile(file)) return ui.uploads.wrongType(file.name);
    if (file.size > MAX_UPLOAD_BYTES) return ui.uploads.tooLarge(file.name);
    return null;
  };

  const uploadAndAttachToItem = async (
    slug: string,
    files: FileList | File[],
  ) => {
    setUploadingItem(slug);
    setUploadError(null);
    let anyFailed = false;
    try {
      for (const file of Array.from(files)) {
        const err = validateAndPickError(file);
        if (err) {
          anyFailed = true;
          setUploadError(err);
          continue;
        }
        const result = await uploadInquiryFile(file, "reference");
        if (result) {
          attachUpload(slug, {
            storagePath: result.storagePath,
            originalFilename: result.originalFilename,
            mimeType: result.mimeType,
            sizeBytes: result.sizeBytes,
            kind: result.kind,
          });
        } else {
          anyFailed = true;
        }
      }
    } finally {
      setUploadingItem(null);
    }
    if (anyFailed) setUploadError(ui.uploads.uploadFailed);
  };

  const uploadAndAttachToGeneral = async (files: FileList | File[]) => {
    setUploadingGeneral(true);
    setUploadError(null);
    let anyFailed = false;
    try {
      for (const file of Array.from(files)) {
        const err = validateAndPickError(file);
        if (err) {
          anyFailed = true;
          setUploadError(err);
          continue;
        }
        const result = await uploadInquiryFile(file, "reference");
        if (result) {
          attachGeneralUpload({
            storagePath: result.storagePath,
            originalFilename: result.originalFilename,
            mimeType: result.mimeType,
            sizeBytes: result.sizeBytes,
            kind: result.kind,
          });
        } else {
          anyFailed = true;
        }
      }
    } finally {
      setUploadingGeneral(false);
    }
    if (anyFailed) setUploadError(ui.uploads.uploadFailed);
  };

  const successProducts = useMemo<WhatsAppProduct[]>(
    () =>
      items.map((item) => ({
        name: item.name,
        size: item.sizeCustom ?? item.size,
        color: item.colorCustom ?? item.color,
        material: item.materialCustom ?? item.material,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
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
    const submittedMessage =
      ((formData.get("message") as string) || "").trim() || undefined;

    const payload = {
      locale,
      name: submittedName,
      email: ((formData.get("email") as string) || "").trim(),
      company: submittedCompany,
      contactMethod: method,
      contactHandle: handle,
      otherPlatformName: method === "other" ? otherPlatform : undefined,
      message: submittedMessage,
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
        uploads: (item.uploads ?? []).map((u) => ({
          storagePath: u.storagePath,
          originalFilename: u.originalFilename,
          mimeType: u.mimeType,
          sizeBytes: u.sizeBytes,
          kind: u.kind,
        })),
      })),
      generalUploads: generalUploads.map((u) => ({
        storagePath: u.storagePath,
        originalFilename: u.originalFilename,
        mimeType: u.mimeType,
        sizeBytes: u.sizeBytes,
        kind: u.kind,
      })),
    };

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
      const success: SuccessData = {
        requestId: body.requestId,
        name: submittedName,
        company: submittedCompany,
        message: submittedMessage,
        products: successProducts,
      };
      try {
        sessionStorage.setItem(
          SUCCESS_STORAGE_PREFIX + body.requestId,
          JSON.stringify(success),
        );
      } catch {
        // Session storage full / blocked — fall back to in-memory state so
        // the user still sees the success page for this render.
        setSuccessData(success);
      }
      clear();
      form.reset();
      setPreferredContact("");
      setFormState("idle");
      router.replace(
        `${localePath(locale, "/inquiry")}?submitted=${encodeURIComponent(body.requestId)}`,
        { scroll: false },
      );
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

  if (successData) {
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
                  onClick={() => clear()}
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
                    isUploading={uploadingItem === item.slug}
                    onRemove={() => remove(item.slug)}
                    onNoteChange={(note) => updateNote(item.slug, note)}
                    onUploadFiles={(files) =>
                      uploadAndAttachToItem(item.slug, files)
                    }
                    onRemoveUpload={(storagePath) =>
                      removeUpload(item.slug, storagePath)
                    }
                  />
                ))}
              </ul>
            )}

            {/* General order references */}
            <GeneralUploads
              locale={locale}
              uploads={generalUploads}
              isUploading={uploadingGeneral}
              onUploadFiles={uploadAndAttachToGeneral}
              onRemoveUpload={removeGeneralUpload}
            />

            {uploadError && (
              <p className="mt-3 rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
                {uploadError}
              </p>
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
// InquiryLineItem — one row per saved product. Compact card with a 3-dot
// menu in the top-right (Add attachment / Add edit note / Remove product).
// =============================================================================

function InquiryLineItem({
  item,
  locale,
  isUploading,
  onRemove,
  onNoteChange,
  onUploadFiles,
  onRemoveUpload,
}: {
  item: InquiryItem;
  locale: Locale;
  isUploading: boolean;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  onRemoveUpload: (storagePath: string) => void;
}) {
  const ui = uiContent[locale].inquiryPage;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [noteOpen, setNoteOpen] = useState((item.note ?? "").length > 0);

  const variantChips = buildVariantChips(item, ui.variantLabels);
  const uploads = item.uploads ?? [];

  return (
    <li className="rounded-2xl bg-white p-4 ring-1 ring-ink-100">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={(e) => {
          if (e.target.files) onUploadFiles(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="sr-only"
      />

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
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={onRemove}
                aria-label={ui.removeAria(item.name)}
                title={ui.remove}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition hover:bg-clay-500/10 hover:text-clay-600"
              >
                <CloseIcon className="h-4 w-4" aria-hidden />
              </button>
              <ItemMenu
                locale={locale}
                onAddAttachment={() => fileInputRef.current?.click()}
                onAddNote={() => {
                  setNoteOpen(true);
                  queueMicrotask(() => noteRef.current?.focus());
                }}
              />
            </div>
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

          {uploads.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                {ui.uploads.attachedHeading}
              </div>
              <ul className="mt-1.5 space-y-1">
                {uploads.map((u) => (
                  <UploadRow
                    key={u.storagePath}
                    upload={u}
                    locale={locale}
                    onRemove={() => onRemoveUpload(u.storagePath)}
                  />
                ))}
              </ul>
            </div>
          )}

          {isUploading && (
            <p className="mt-2 text-xs text-ink-500">{ui.uploads.uploading}</p>
          )}

          {noteOpen && (
            <textarea
              ref={noteRef}
              defaultValue={item.note ?? ""}
              onBlur={(e) => onNoteChange(e.target.value)}
              placeholder={ui.notesPlaceholder}
              rows={2}
              className="mt-3 w-full resize-y rounded-lg border-ink-100 bg-sand-50 px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:border-moss-500 focus:ring-moss-500"
            />
          )}
        </div>
      </div>
    </li>
  );
}

// =============================================================================
// ItemMenu — three-dot kebab menu with three actions.
// =============================================================================

function ItemMenu({
  locale,
  onAddAttachment,
  onAddNote,
}: {
  locale: Locale;
  onAddAttachment: () => void;
  onAddNote: () => void;
}) {
  const ui = uiContent[locale].inquiryPage.itemMenu;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const fire = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ui.open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-sand-100 hover:text-ink-900"
      >
        <DotsIcon className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-9 z-10 min-w-[12rem] overflow-hidden rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-ink-100"
        >
          <MenuItem onClick={fire(onAddAttachment)}>{ui.addAttachment}</MenuItem>
          <MenuItem onClick={fire(onAddNote)}>{ui.addNote}</MenuItem>
        </ul>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={`block w-full px-3 py-2 text-left transition hover:bg-sand-100 ${
          danger ? "text-clay-600 hover:text-clay-700" : "text-ink-800"
        }`}
      >
        {children}
      </button>
    </li>
  );
}

// =============================================================================
// GeneralUploads — small "Add general attachment" section for files that
// apply to the whole inquiry, not a specific product.
// =============================================================================

function GeneralUploads({
  locale,
  uploads,
  isUploading,
  onUploadFiles,
  onRemoveUpload,
}: {
  locale: Locale;
  uploads: StoredUpload[];
  isUploading: boolean;
  onUploadFiles: (files: FileList | File[]) => void;
  onRemoveUpload: (storagePath: string) => void;
}) {
  const ui = uiContent[locale].inquiryPage;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mt-8 rounded-2xl border border-dashed border-ink-100 bg-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={(e) => {
          if (e.target.files) onUploadFiles(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="sr-only"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">
            {ui.generalUploads.heading}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">
            {ui.generalUploads.help}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-800/40 hover:text-ink-900 disabled:opacity-60"
        >
          <PlusIcon className="h-3.5 w-3.5" aria-hidden />
          {isUploading ? ui.uploads.uploading : ui.generalUploads.addButton}
        </button>
      </div>

      {uploads.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {uploads.map((u) => (
            <UploadRow
              key={u.storagePath}
              upload={u}
              locale={locale}
              onRemove={() => onRemoveUpload(u.storagePath)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-ink-400">{ui.generalUploads.empty}</p>
      )}
    </section>
  );
}

function UploadRow({
  upload,
  locale,
  onRemove,
}: {
  upload: StoredUpload;
  locale: Locale;
  onRemove: () => void;
}) {
  const ui = uiContent[locale].inquiryPage.uploads;
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-sand-50 px-3 py-1.5 text-xs text-ink-700 ring-1 ring-ink-100">
      <span className="flex-1 min-w-0 truncate font-medium text-ink-900">
        {upload.originalFilename}
      </span>
      <span className="text-[0.7rem] text-ink-400">
        {formatBytes(upload.sizeBytes)}
      </span>
      <span className="rounded-md bg-white px-2 py-0.5 text-[0.7rem] uppercase tracking-wide text-moss-700">
        {ui.kinds[upload.kind as UploadKind]}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={ui.removeAria(upload.originalFilename)}
        className="text-ink-400 hover:text-clay-600"
      >
        ✕
      </button>
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

function DotsIcon({
  className = "",
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...rest}
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function CloseIcon({
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
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
