import type { Locale } from "@/lib/i18n";

export type Category = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  heroImage?: string;
  /** Optional overlay for non-English locales. Missing keys fall back to English. */
  translations?: Partial<Record<Exclude<Locale, "en">, Partial<Omit<Category, "slug" | "heroImage" | "translations">>>>;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type PriceTier = {
  /** Inclusive lower bound. */
  minQty: number;
  /** Inclusive upper bound. Omit for "and up" (highest-volume tier). */
  maxQty?: number;
  /** Unit price including currency symbol, e.g. "$0.80". Kept as string so
   *  translations can swap currency per locale if we ever need to. */
  unitPrice: string;
};

export type ColorOption = {
  name: string;
  /** Optional hex for the swatch. Omit for a neutral placeholder swatch. */
  hex?: string;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  summary: string;
  description: string;
  images: string[];
  specs: ProductSpec[];
  /** Human-readable MOQ (e.g. "500 pcs"). Kept for card display. */
  moq?: string;
  /** Numeric MOQ used by the quantity stepper + tier highlight. */
  minOrderQty?: number;
  leadTime?: string;
  /** Tier pricing — sorted ascending by minQty. */
  priceRange?: PriceTier[];
  /** Currency symbol used in tier display ("$", "¥"). Defaults to "$". */
  currency?: string;
  /** Available sizes (strings, e.g. "Standard 38×42 cm" or "M"). */
  sizes?: string[];
  /** Available colors with optional hex swatches. */
  colors?: ColorOption[];
  customization?: string[];
  materials?: string[];
  featured?: boolean;
  /** Optional overlay for non-English locales. Missing keys fall back to English. */
  translations?: Partial<
    Record<
      Exclude<Locale, "en">,
      Partial<Omit<Product, "slug" | "categorySlug" | "images" | "featured" | "translations">>
    >
  >;
};
