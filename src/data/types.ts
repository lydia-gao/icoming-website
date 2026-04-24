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

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  summary: string;
  description: string;
  images: string[];
  specs: ProductSpec[];
  moq?: string;
  leadTime?: string;
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
