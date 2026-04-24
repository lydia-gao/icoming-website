export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Prepend the locale prefix to an internal path.
 * English (default) returns the path unchanged; Chinese prepends `/zh`.
 *
 *   localePath("en", "/products")  // "/products"
 *   localePath("zh", "/products")  // "/zh/products"
 *   localePath("zh", "/")          // "/zh"
 */
export function localePath(locale: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  if (p === "/") return `/${locale}`;
  return `/${locale}${p}`;
}

/**
 * Swap a path between locales while preserving the rest of the URL.
 * Used by the language switcher to stay on the same logical page.
 *
 *   swapLocale("en", "/products", "zh")     // "/zh/products"
 *   swapLocale("zh", "/zh/products", "en")  // "/products"
 */
export function swapLocale(
  currentLocale: Locale,
  currentPath: string,
  targetLocale: Locale,
): string {
  if (currentLocale === targetLocale) return currentPath;
  const stripped =
    currentLocale === defaultLocale
      ? currentPath
      : currentPath.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "") || "/";
  return localePath(targetLocale, stripped);
}

export const htmlLang: Record<Locale, string> = {
  en: "en",
  zh: "zh-CN",
};
