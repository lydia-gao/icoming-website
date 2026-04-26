"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  staticCount: number;
};

export function MigrateButton({ staticCount }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (
      !window.confirm(
        `Copy all ${staticCount} static products into the database as drafts? Sales will then review and publish each one. This action runs once.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/migrate", {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Migration failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-moss-500/40 bg-moss-50/40 p-5">
      <div className="font-medium text-ink-800">
        Migrate the static catalog to the database
      </div>
      <p className="mt-1 text-sm text-ink-600">
        The site currently shows {staticCount} products from{" "}
        <code className="rounded bg-white px-1 py-0.5 text-xs">
          src/data/products.ts
        </code>
        . Copy them all into the database as drafts so you can review,
        clean up pricing and copy, replace stock images, and publish on
        your own schedule. This action only runs once.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {busy ? "Migrating…" : "Migrate static catalog"}
        </button>
        {error && <span className="text-xs text-clay-600">{error}</span>}
      </div>
    </div>
  );
}
