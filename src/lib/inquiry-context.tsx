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
import type { UploadKind } from "@/lib/uploads";

const STORAGE_KEY = "icoming.inquiry.v1";
const GENERAL_UPLOADS_STORAGE_KEY = "icoming.inquiry.generalUploads.v1";

/**
 * Metadata for a file already uploaded to Supabase Storage. Fully
 * serializable, safe in localStorage. Mirrors the payload shape the
 * /api/inquiry route accepts.
 */
export type StoredUpload = {
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  kind: UploadKind;
};

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
  /** Human-readable tier label, e.g. "500 - 999 pcs" or "1000+ pcs". */
  tierLabel?: string;

  /**
   * Files this buyer attached for *this* product. Already in Supabase
   * Storage — only metadata is persisted here. Uploaded either from
   * the product detail page (deferred until "Add to Inquiry") or from
   * the inquiry review page's per-item menu.
   */
  uploads?: StoredUpload[];
};

type InquiryContextValue = {
  items: InquiryItem[];
  count: number;
  hasItem: (slug: string) => boolean;
  /** Add if missing, do nothing if already present. Used by card quick-save. */
  add: (item: Omit<InquiryItem, "addedAt">) => void;
  /**
   * Add or overwrite — replaces the entire item's variant/quantity/price
   * section with the new payload. Preserves `addedAt`, existing `note`
   * (when not in payload), and existing `uploads` (always — uploads are
   * managed via attachUpload / removeUpload).
   */
  upsert: (item: Omit<InquiryItem, "addedAt" | "uploads">) => void;
  remove: (slug: string) => void;
  toggle: (item: Omit<InquiryItem, "addedAt">) => void;
  updateNote: (slug: string, note: string) => void;

  /** Per-item attachments. `slug` must already be in the cart. */
  attachUpload: (slug: string, upload: StoredUpload) => void;
  removeUpload: (slug: string, storagePath: string) => void;

  /** Inquiry-level attachments (apply to the whole RFQ, not a product). */
  generalUploads: StoredUpload[];
  attachGeneralUpload: (upload: StoredUpload) => void;
  removeGeneralUpload: (storagePath: string) => void;

  clear: () => void;
  hydrated: boolean;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [generalUploads, setGeneralUploads] = useState<StoredUpload[]>([]);
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
    try {
      const rawGeneral = window.localStorage.getItem(GENERAL_UPLOADS_STORAGE_KEY);
      if (rawGeneral) {
        const parsed = JSON.parse(rawGeneral) as StoredUpload[];
        if (Array.isArray(parsed)) setGeneralUploads(parsed);
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

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        GENERAL_UPLOADS_STORAGE_KEY,
        JSON.stringify(generalUploads),
      );
    } catch {
      // storage full or blocked — silently degrade
    }
  }, [generalUploads, hydrated]);

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

  const upsert = useCallback(
    (item: Omit<InquiryItem, "addedAt" | "uploads">) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.slug === item.slug);
        if (idx === -1) {
          return [...prev, { ...item, addedAt: Date.now() }];
        }
        const existing = prev[idx];
        return [
          ...prev.slice(0, idx),
          {
            ...item,
            addedAt: existing.addedAt,
            note: item.note ?? existing.note,
            uploads: existing.uploads,
          },
          ...prev.slice(idx + 1),
        ];
      });
    },
    [],
  );

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

  const attachUpload = useCallback((slug: string, upload: StoredUpload) => {
    setItems((prev) =>
      prev.map((i) =>
        i.slug === slug
          ? { ...i, uploads: [...(i.uploads ?? []), upload] }
          : i,
      ),
    );
  }, []);

  const removeUpload = useCallback((slug: string, storagePath: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.slug === slug
          ? {
              ...i,
              uploads: (i.uploads ?? []).filter(
                (u) => u.storagePath !== storagePath,
              ),
            }
          : i,
      ),
    );
  }, []);

  const attachGeneralUpload = useCallback((upload: StoredUpload) => {
    setGeneralUploads((prev) => [...prev, upload]);
  }, []);

  const removeGeneralUpload = useCallback((storagePath: string) => {
    setGeneralUploads((prev) => prev.filter((u) => u.storagePath !== storagePath));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setGeneralUploads([]);
  }, []);

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
      attachUpload,
      removeUpload,
      generalUploads,
      attachGeneralUpload,
      removeGeneralUpload,
      clear,
      hydrated,
    }),
    [
      items,
      hasItem,
      add,
      upsert,
      remove,
      toggle,
      updateNote,
      attachUpload,
      removeUpload,
      generalUploads,
      attachGeneralUpload,
      removeGeneralUpload,
      clear,
      hydrated,
    ],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}
