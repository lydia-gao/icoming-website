"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProductStatus } from "@/lib/products-cms";

type BilingualPair = { en: string; zh: string };

type FormState = {
  slug: string;
  category_slug: string;
  name: BilingualPair;
  summary: BilingualPair;
  description: BilingualPair;
  moq: BilingualPair;
  lead_time: BilingualPair;
  min_order_qty: string;
  currency: string;
};

type Props = {
  productId: string;
  status: ProductStatus;
  initial: FormState;
  categories: { slug: string; name: string }[];
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function ProductBasicsEditor({
  productId,
  status,
  initial,
  categories,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initial);
  const [baseline, setBaseline] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const slugLocked = status === "published";

  const dirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(baseline),
    [state, baseline],
  );

  const slugValid = SLUG_RE.test(state.slug) && state.slug.length > 0;
  const slugChanged = state.slug !== baseline.slug;
  const slugWarning =
    slugChanged && !slugValid
      ? "Use lowercase letters, numbers, and dashes (e.g. cotton-tote-promo)."
      : null;

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function patchBilingual(
    key: keyof Pick<
      FormState,
      "name" | "summary" | "description" | "moq" | "lead_time"
    >,
    locale: "en" | "zh",
    value: string,
  ) {
    setState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [locale]: value },
    }));
  }

  async function handleSave() {
    if (!dirty || saving) return;

    if (slugChanged && !slugValid) {
      setError(
        "Fix the slug before saving — lowercase letters, numbers, and dashes only.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        category_slug: state.category_slug,
        name_en: nullIfEmpty(state.name.en),
        name_zh: nullIfEmpty(state.name.zh),
        summary_en: nullIfEmpty(state.summary.en),
        summary_zh: nullIfEmpty(state.summary.zh),
        description_en: nullIfEmpty(state.description.en),
        description_zh: nullIfEmpty(state.description.zh),
        moq_en: nullIfEmpty(state.moq.en),
        moq_zh: nullIfEmpty(state.moq.zh),
        lead_time_en: nullIfEmpty(state.lead_time.en),
        lead_time_zh: nullIfEmpty(state.lead_time.zh),
        currency: state.currency.trim() || "$",
      };

      // Only send slug if it actually changed — server will reject the
      // change while published, and sending it unchanged would still
      // pass through the slug-lock check unnecessarily.
      if (slugChanged) {
        payload.slug = state.slug.trim();
      }

      const minQtyTrimmed = state.min_order_qty.trim();
      if (minQtyTrimmed === "") {
        payload.min_order_qty = null;
      } else {
        const n = Number(minQtyTrimmed);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Min order qty must be a non-negative number.");
        }
        payload.min_order_qty = Math.floor(n);
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setBaseline(state);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setState(baseline);
    setError(null);
  }

  return (
    <div className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink-900">
          Product details
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Bilingual content shown on the product detail page and product
          cards. Either language can be left blank — the public site
          falls back to the other locale where needed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink-700">Slug</span>
          <p className="text-xs text-ink-500">
            URL piece —{" "}
            <code className="rounded bg-sand-100 px-1 py-0.5 text-[0.7rem]">
              /products/{state.slug || "your-slug"}
            </code>
          </p>
          <input
            type="text"
            value={state.slug}
            onChange={(e) => patch("slug", e.target.value.toLowerCase())}
            disabled={slugLocked || saving}
            className="mt-1 block w-full rounded-lg border-ink-100 bg-white font-mono text-sm focus:border-moss-500 focus:ring-moss-500 disabled:bg-sand-50 disabled:text-ink-500"
          />
          {slugLocked ? (
            <span className="mt-1 block text-xs text-ink-500">
              Locked while published. Move to draft first to rename.
            </span>
          ) : slugWarning ? (
            <span className="mt-1 block text-xs text-clay-600">
              {slugWarning}
            </span>
          ) : null}
        </label>

        <label className="block text-sm">
          <span className="font-medium text-ink-700">Category</span>
          <p className="text-xs text-ink-500">
            Categories are managed in code; pick the closest match.
          </p>
          <select
            value={state.category_slug}
            onChange={(e) => patch("category_slug", e.target.value)}
            disabled={saving}
            className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <BilingualField
        label="Name"
        help="Shown on the product card and detail page."
        value={state.name}
        onChange={(loc, v) => patchBilingual("name", loc, v)}
      />

      <BilingualField
        label="Summary"
        help="One sentence shown on product cards and at the top of the detail page."
        value={state.summary}
        onChange={(loc, v) => patchBilingual("summary", loc, v)}
        multiline
        rows={2}
      />

      <BilingualField
        label="Description"
        help="Full product description shown on the detail page."
        value={state.description}
        onChange={(loc, v) => patchBilingual("description", loc, v)}
        multiline
        rows={5}
      />

      <BilingualField
        label="MOQ display"
        help={`Shown on the card and detail (e.g. "100 pcs" / "100 件"). Numeric MOQ for the stepper is below.`}
        value={state.moq}
        onChange={(loc, v) => patchBilingual("moq", loc, v)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink-700">
            Min order qty (numeric)
          </span>
          <p className="text-xs text-ink-500">
            Drives the quantity stepper and tier highlight. Leave blank
            if there&rsquo;s no hard minimum.
          </p>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={state.min_order_qty}
            onChange={(e) => patch("min_order_qty", e.target.value)}
            disabled={saving}
            className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink-700">Currency symbol</span>
          <p className="text-xs text-ink-500">
            Shown next to tier prices (e.g. &ldquo;$&rdquo;, &ldquo;¥&rdquo;).
            Defaults to &ldquo;$&rdquo;.
          </p>
          <input
            type="text"
            value={state.currency}
            onChange={(e) => patch("currency", e.target.value)}
            maxLength={4}
            disabled={saving}
            className="mt-1 block w-24 rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          />
        </label>
      </div>

      <BilingualField
        label="Lead time"
        help={`Free-form (e.g. "25-35 days" / "25-35 天").`}
        value={state.lead_time}
        onChange={(loc, v) => patchBilingual("lead_time", loc, v)}
      />

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 border-t border-ink-100 bg-sand-50/95 px-5 py-3 backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || (slugChanged && !slugValid)}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!dirty || saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300 disabled:opacity-50"
        >
          Cancel
        </button>
        {dirty && !error && !savedFlash && (
          <span className="text-xs font-medium text-clay-600">
            Unsaved changes
          </span>
        )}
        {savedFlash && !dirty && (
          <span className="text-xs text-moss-700">Saved ✓</span>
        )}
        {error && <span className="text-xs text-clay-600">{error}</span>}
      </div>
    </div>
  );
}

function BilingualField({
  label,
  help,
  value,
  onChange,
  multiline,
  rows,
}: {
  label: string;
  help?: string;
  value: BilingualPair;
  onChange: (locale: "en" | "zh", v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const enHas = value.en.trim().length > 0;
  const zhHas = value.zh.trim().length > 0;
  const onlyOne = (enHas && !zhHas) || (zhHas && !enHas);
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-ink-700">{label}</legend>
      {help && <p className="text-xs text-ink-500">{help}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <LocaleField
          locale="English"
          value={value.en}
          onChange={(v) => onChange("en", v)}
          multiline={multiline}
          rows={rows}
          warn={onlyOne && !enHas}
        />
        <LocaleField
          locale="中文"
          value={value.zh}
          onChange={(v) => onChange("zh", v)}
          multiline={multiline}
          rows={rows}
          warn={onlyOne && !zhHas}
        />
      </div>
    </fieldset>
  );
}

function LocaleField({
  locale,
  value,
  onChange,
  multiline,
  rows = 2,
  warn,
}: {
  locale: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  warn?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-medium text-ink-500">{locale}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      )}
      {warn && (
        <span className="mt-1 block text-xs text-clay-600">
          Missing — falls back to default.
        </span>
      )}
    </label>
  );
}

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
