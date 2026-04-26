"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductStatus } from "@/lib/products-cms";

type Props = {
  productId: string;
  slug: string;
  initialStatus: ProductStatus;
  initialFeatured: boolean;
};

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function ProductActions({
  productId,
  initialStatus,
  initialFeatured,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ProductStatus>(initialStatus);
  const [featured, setFeatured] = useState(initialFeatured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty = status !== initialStatus || featured !== initialFeatured;

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, featured }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (
      !window.confirm(
        "Archive this product? It will be hidden from the public catalog. You can restore it later by changing the status back to draft or published.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Archive failed");
      }
      router.replace("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
      <h2 className="font-serif text-lg font-semibold text-ink-900">Manage</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink-800">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            disabled={busy}
            className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-ink-500">
            Public site shows published products only.
          </span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-ink-800">Featured</span>
          <div className="mt-1 flex items-center gap-3 rounded-lg border border-ink-100 bg-white p-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              disabled={busy}
              className="h-4 w-4 rounded border-ink-300 text-moss-700 focus:ring-moss-500"
            />
            <span className="text-xs text-ink-600">
              Show on the home page featured grid (max 4 shown).
            </span>
          </div>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || busy}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>

        {status !== "archived" && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={busy}
            className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-medium text-clay-600 hover:border-clay-500/50 disabled:opacity-50"
          >
            Archive
          </button>
        )}

        {savedAt && !dirty && !error && (
          <span className="text-xs text-moss-700">Saved ✓</span>
        )}
        {error && <span className="text-xs text-clay-600">{error}</span>}
      </div>
    </div>
  );
}
