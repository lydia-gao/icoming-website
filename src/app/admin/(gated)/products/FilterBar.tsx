"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category } from "@/data/types";

const STATUSES = ["active", "draft", "published", "archived"] as const;
type StatusValue = (typeof STATUSES)[number];

const STATUS_LABELS: Record<StatusValue, string> = {
  active: "Active",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

type Props = {
  /** Plain category list (English source — admin UI is English-only). */
  categories: Pick<Category, "slug" | "name">[];
};

/**
 * URL-param-driven filters for the products admin list. Mirrors the
 * pattern used by /admin/inquiries — every change pushes a new
 * search-params combination, server re-fetches, page re-renders.
 */
export function ProductsFilterBar({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentStatus =
    (searchParams?.get("status") as StatusValue | null) ?? "active";
  const currentCategory = searchParams?.get("category") ?? "";
  const initialQuery = searchParams?.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  // Keep the local query input in sync when the URL changes externally
  // (e.g. clicking a status chip while typing).
  useEffect(() => {
    setQuery(searchParams?.get("q") ?? "");
  }, [searchParams]);

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    // Always reset to page 1 when filters change.
    next.delete("page");
    startTransition(() => {
      router.replace(`/admin/products?${next.toString()}`, { scroll: false });
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    pushParams({ q: query.trim() || null });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const active = currentStatus === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => pushParams({ status: s === "active" ? null : s })}
              disabled={pending}
              className={
                active
                  ? "rounded-full bg-moss-700 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-ink-100 hover:text-ink-900"
              }
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={currentCategory}
          onChange={(e) =>
            pushParams({ category: e.target.value || null })
          }
          disabled={pending}
          className="rounded-md border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <form onSubmit={onSubmit} className="flex flex-1 items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug, or Chinese name…"
            className="block w-full max-w-sm rounded-md border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-300 hover:text-ink-900 disabled:opacity-50"
          >
            Search
          </button>
          {(initialQuery || currentCategory || currentStatus !== "active") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                pushParams({ q: null, status: null, category: null });
              }}
              disabled={pending}
              className="text-xs text-ink-500 hover:text-clay-600"
            >
              Clear
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
