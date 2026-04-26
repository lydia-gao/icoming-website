"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProductPriceTier } from "@/lib/products-cms";

type Row = {
  min_qty: string;
  max_qty: string;
  unit_price: string;
};

type Props = {
  productId: string;
  initial: ProductPriceTier[];
  currency: string;
};

export function PriceTiersEditor({
  productId,
  initial,
  currency,
}: Props) {
  const initialRows = useMemo<Row[]>(
    () =>
      (initial ?? []).map((t) => ({
        min_qty: String(t.min_qty),
        max_qty: t.max_qty != null ? String(t.max_qty) : "",
        unit_price: t.unit_price ?? "",
      })),
    [initial],
  );
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [baseline, setBaseline] = useState<Row[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const router = useRouter();

  const dirty = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(baseline),
    [rows, baseline],
  );

  function setField(idx: number, key: keyof Row, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { min_qty: "", max_qty: "", unit_price: "" },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveRow(idx: number, delta: -1 | 1) {
    setRows((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        price_tiers: rows.map((r) => ({
          min_qty: r.min_qty.trim() === "" ? NaN : Number(r.min_qty),
          max_qty:
            r.max_qty.trim() === "" ? null : Number(r.max_qty),
          unit_price: r.unit_price.trim(),
        })),
      };
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setBaseline(rows);
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
    setRows(baseline);
    setError(null);
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink-900">
          Tier pricing
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Quantity-based unit prices. The customer-facing detail page
          highlights the active tier as the buyer adjusts the quantity
          stepper. Tiers are sorted by minimum quantity automatically;
          ranges must not overlap. Only the final (highest-minimum)
          tier can leave the max blank — that's the &ldquo;and up&rdquo; tier.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-100 bg-sand-50 p-5 text-center text-sm text-ink-500">
          No tiers yet. Add at least one to surface pricing on the
          public site.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="grid grid-cols-1 items-end gap-3 rounded-xl bg-sand-50/70 p-3 ring-1 ring-ink-100 sm:grid-cols-[7rem_7rem_1fr_auto]"
            >
              <label className="block text-sm">
                <span className="text-xs font-medium text-ink-500">
                  Min qty
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={row.min_qty}
                  onChange={(e) => setField(idx, "min_qty", e.target.value)}
                  disabled={saving}
                  className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-ink-500">
                  Max qty
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={row.max_qty}
                  onChange={(e) => setField(idx, "max_qty", e.target.value)}
                  disabled={saving}
                  placeholder="and up"
                  className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm placeholder:text-ink-400 focus:border-moss-500 focus:ring-moss-500"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium text-ink-500">
                  Unit price ({currency})
                </span>
                <input
                  type="text"
                  value={row.unit_price}
                  onChange={(e) =>
                    setField(idx, "unit_price", e.target.value)
                  }
                  disabled={saving}
                  placeholder={`${currency}1.20`}
                  className="mt-1 block w-full rounded-lg border-ink-100 bg-white font-mono text-sm focus:border-moss-500 focus:ring-moss-500"
                />
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveRow(idx, -1)}
                  disabled={idx === 0 || saving}
                  className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(idx, 1)}
                  disabled={idx === rows.length - 1 || saving}
                  className="rounded-md border border-ink-100 bg-white px-2 py-1 text-xs text-ink-600 hover:border-ink-300 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={saving}
                  className="rounded-md border border-ink-100 bg-white px-2.5 py-1 text-xs font-medium text-clay-600 hover:border-clay-500/50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addRow}
        disabled={saving}
        className="rounded-md border border-dashed border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:border-moss-500 hover:text-moss-700 disabled:opacity-50"
      >
        + Add tier
      </button>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save tiers"}
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
