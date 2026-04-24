"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "icoming.inquiry.v1";

/**
 * Persisted inquiry cart item. Everything after `addedAt` is optional —
 * items saved from a product card have only the basics; items saved
 * from the product detail panel carry the full variant configuration.
 *
 * New optional fields are backward compatible with v1 localStorage
 * data — old carts load without migration.
 */
export type InquiryItem = {
  slug: string;
  name: string;
  image: string;
  addedAt: number;

  /** Optional user note (edited from the inquiry review page). */
  note?: string;

  /** Variants — populated when saved via ProductVariantsPanel. */
  size?: string;
  sizeCustom?: string;
  color?: string;
  colorCustom?: string;
  material?: string;
  materialCustom?: string;
  quantity?: number;
  /** Unit price snapshot at the selected tier, e.g. "$0.95". */
  priceSnapshot?: string;
  /** Human-readable tier label, e.g. "500 – 999 pcs" or "1000+ pcs". */
  tierLabel?: string;
};

type InquiryContextValue = {
  items: InquiryItem[];
  count: number;
  hasItem: (slug: string) => boolean;
  /** Add if missing, do nothing if already present. Used by card quick-save. */
  add: (item: Omit<InquiryItem, "addedAt">) => void;
  /**
   * Add or overwrite — replaces the entire item's variant/quantity/price
   * section with the new payload, preserving `addedAt`. Used by the
   * product-detail panel where users explicitly configure variants.
   */
  upsert: (item: Omit<InquiryItem, "addedAt">) => void;
  remove: (slug: string) => void;
  toggle: (item: Omit<InquiryItem, "addedAt">) => void;
  updateNote: (slug: string, note: string) => void;
  clear: () => void;
  hydrated: boolean;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InquiryItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked — silently degrade
    }
  }, [items, hydrated]);

  const hasItem = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items],
  );

  const add = useCallback((item: Omit<InquiryItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const upsert = useCallback((item: Omit<InquiryItem, "addedAt">) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.slug === item.slug);
      if (idx === -1) {
        return [...prev, { ...item, addedAt: Date.now() }];
      }
      const existing = prev[idx];
      return [
        ...prev.slice(0, idx),
        { ...item, addedAt: existing.addedAt, note: item.note ?? existing.note },
        ...prev.slice(idx + 1),
      ];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const toggle = useCallback((item: Omit<InquiryItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) {
        return prev.filter((i) => i.slug !== item.slug);
      }
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const updateNote = useCallback((slug: string, note: string) => {
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, note } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<InquiryContextValue>(
    () => ({
      items,
      count: items.length,
      hasItem,
      add,
      upsert,
      remove,
      toggle,
      updateNote,
      clear,
      hydrated,
    }),
    [items, hasItem, add, upsert, remove, toggle, updateNote, clear, hydrated],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}
