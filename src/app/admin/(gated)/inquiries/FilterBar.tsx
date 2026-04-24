"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(searchParams?.get("q") ?? "");

  const status = searchParams?.get("status") ?? "";
  const sort = searchParams?.get("sort") ?? "date_desc";

  const apply = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    // Reset pagination whenever filters change.
    next.delete("page");
    startTransition(() => {
      router.replace(`/admin/inquiries?${next.toString()}`);
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply({ q: localSearch.trim() || null });
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-ink-100">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[16rem] gap-2">
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, company, email, or request ID"
            className="flex-1 rounded-lg border-ink-100 bg-sand-50 text-sm focus:border-moss-500 focus:ring-moss-500"
          />
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>

        <label className="text-sm">
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(e) => apply({ status: e.target.value || null })}
            className="rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => apply({ sort: e.target.value })}
            className="rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
          </select>
        </label>

        {isPending && (
          <span className="text-xs text-ink-400">Updating…</span>
        )}
      </div>
    </div>
  );
}
