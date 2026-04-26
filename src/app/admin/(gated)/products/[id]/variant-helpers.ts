import type {
  Bilingual,
  ProductColor,
  ProductSpec,
} from "@/lib/products-cms";

/**
 * Shape adapters between DB rows (loaded server-side) and the
 * editor's local form state. Live in a non-client module so the
 * server page can import them and feed initial state into
 * VariantOptionsEditor (the client component below).
 *
 * Keep these in sync with the form-state types in
 * VariantOptionsEditor.tsx — they're imported there for state
 * typing.
 */

export type BilingualRow = { en: string; zh: string };

export type ColorRow = {
  name_en: string;
  name_zh: string;
  hex: string;
};

export type SpecRow = {
  label_en: string;
  label_zh: string;
  value_en: string;
  value_zh: string;
};

export function bilingualToRows(
  items: Bilingual[] | null | undefined,
): BilingualRow[] {
  if (!items) return [];
  return items.map((b) => ({ en: b.en ?? "", zh: b.zh ?? "" }));
}

export function colorsToRows(
  items: ProductColor[] | null | undefined,
): ColorRow[] {
  if (!items) return [];
  return items.map((c) => ({
    name_en: c.name_en ?? "",
    name_zh: c.name_zh ?? "",
    hex: c.hex ?? "",
  }));
}

export function specsToRows(
  items: ProductSpec[] | null | undefined,
): SpecRow[] {
  if (!items) return [];
  return items.map((s) => ({
    label_en: s.label_en ?? "",
    label_zh: s.label_zh ?? "",
    value_en: s.value_en ?? "",
    value_zh: s.value_zh ?? "",
  }));
}
