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

export type InquiryItem = {
  slug: string;
  name: string;
  image: string;
  note?: string;
  addedAt: number;
};

type InquiryContextValue = {
  items: InquiryItem[];
  count: number;
  hasItem: (slug: string) => boolean;
  add: (item: Omit<InquiryItem, "addedAt">) => void;
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
    () => ({ items, count: items.length, hasItem, add, remove, toggle, updateNote, clear, hydrated }),
    [items, hasItem, add, remove, toggle, updateNote, clear, hydrated],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}
