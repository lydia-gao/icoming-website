"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useInquiry } from "@/lib/inquiry-context";
import { localizedCompany } from "@/data/company";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import {
  companyWhatsappNumber,
  inquiryWhatsappMessage,
  whatsappDeeplink,
} from "@/lib/whatsapp";

type FormState = "idle" | "submitting" | "success" | "error";

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
  productNames: string[];
};

export function InquiryView({ locale }: { locale: Locale }) {
  const { items, hydrated, remove, updateNote, clear } = useInquiry();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferredContact, setPreferredContact] = useState<ContactMethod>("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const company = localizedCompany(locale);
  const ui = uiContent[locale].inquiryPage;

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
    const otherPlatform = ((formData.get("otherPlatform") as string) || "").trim() || undefined;

    const submittedName = ((formData.get("name") as string) || "").trim();
    const submittedCompany = ((formData.get("company") as string) || "").trim() || undefined;
    const productNames = itemSummary.map((i) => i.name);

    const payload = {
      locale,
      name: submittedName,
      email: ((formData.get("email") as string) || "").trim(),
      company: submittedCompany,
      contactMethod: method,
      contactHandle: handle,
      otherPlatformName: method === "other" ? otherPlatform : undefined,
      message: ((formData.get("message") as string) || "").trim() || undefined,
      items: itemSummary,
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
      setSuccessData({
        requestId: body.requestId,
        name: submittedName,
        company: submittedCompany,
        productNames,
      });
      clear();
      form.reset();
      setPreferredContact("");
      setFormState("success");
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
        <div className="container-content grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Items */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink-900">
                {ui.savedProducts(items.length)}
              </h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
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
                  <li
                    key={item.slug}
                    className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-ink-100"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={localePath(locale, `/products/${item.slug}`)}
                          className="font-semibold text-ink-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          aria-label={ui.removeAria(item.name)}
                          className="text-xs text-ink-400 hover:text-clay-600"
                        >
                          {ui.remove}
                        </button>
                      </div>
                      <textarea
                        defaultValue={item.note ?? ""}
                        onBlur={(e) => updateNote(item.slug, e.target.value)}
                        placeholder={ui.notesPlaceholder}
                        rows={2}
                        className="mt-2 w-full resize-y rounded-lg border-ink-100 bg-sand-50 px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:border-moss-500 focus:ring-moss-500"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Form */}
          <aside>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-ink-100">
              <h2 className="font-serif text-xl font-semibold text-ink-900">
                {ui.yourDetails}
              </h2>
              <p className="mt-1 text-sm text-ink-600">{ui.yourDetailsNote}</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              </form>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
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
