"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useInquiry } from "@/lib/inquiry-context";
import { company } from "@/data/company";

type FormState = "idle" | "submitting" | "success" | "error";

export default function InquiryPage() {
  const { items, hydrated, remove, updateNote, clear } = useInquiry();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemSummary = useMemo(
    () =>
      items.map((i) => ({
        slug: i.slug,
        name: i.name,
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
    const payload = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      country: formData.get("country"),
      whatsapp: formData.get("whatsapp"),
      channel: formData.get("channel"),
      message: formData.get("message"),
      items: itemSummary,
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed");
      }
      setFormState("success");
      clear();
      form.reset();
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
          <div className="text-ink-400">Loading your inquiry…</div>
        </div>
      </section>
    );
  }

  if (formState === "success") {
    return (
      <section className="py-20">
        <div className="container-content max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-100 text-moss-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tight text-ink-900 sm:text-4xl">
            Thanks — your inquiry is in.
          </h1>
          <p className="mt-4 text-ink-600">
            A sales contact will reply within one business day. In the
            meantime, feel free to keep browsing our products.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn-primary">Keep browsing</Link>
            <Link href="/" className="btn-secondary">Back to home</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <div className="eyebrow">Inquiry</div>
          <h1 className="section-heading mt-2">Your inquiry basket</h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            Saved products travel with you across the site. Add any notes, fill
            in your details, and our sales team will follow up through your
            preferred channel.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-content grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Items */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-ink-900">
                Saved products ({items.length})
              </h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-ink-400 hover:text-clay-600"
                >
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-ink-100 bg-white p-10 text-center">
                <p className="text-ink-600">
                  Nothing saved yet. Browse the catalog and click{" "}
                  <span className="font-medium">Save</span> on any product you
                  want to discuss.
                </p>
                <Link href="/products" className="btn-primary mt-6">
                  Browse products
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
                          href={`/products/${item.slug}`}
                          className="font-semibold text-ink-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          aria-label={`Remove ${item.name}`}
                          className="text-xs text-ink-400 hover:text-clay-600"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        defaultValue={item.note ?? ""}
                        onBlur={(e) => updateNote(item.slug, e.target.value)}
                        placeholder="Optional notes: qty, color, print, timeline…"
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
                Your details
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                We&apos;ll reply within one business day.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-ink-800">Name *</span>
                    <input
                      name="name"
                      required
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-ink-800">Company</span>
                    <input
                      name="company"
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">Email *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium text-ink-800">Country</span>
                    <input
                      name="country"
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-ink-800">WhatsApp</span>
                    <input
                      name="whatsapp"
                      placeholder="Optional"
                      className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">
                    Preferred reply channel
                  </span>
                  <select
                    name="channel"
                    defaultValue="email"
                    className="mt-1 block w-full rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-ink-800">Message</span>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Quantity, target market, customization needs, timeline…"
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
                  {formState === "submitting" ? "Sending…" : "Send inquiry"}
                </button>

                <p className="text-center text-xs text-ink-400">
                  Or email us directly at{" "}
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
