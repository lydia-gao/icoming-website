"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { uiContent } from "@/content/ui";
import { useLocale } from "@/lib/locale-context";
import { swapLocale, type Locale } from "@/lib/i18n";

type Variant = "desktop" | "mobile";

export function LanguageSwitcher({
  variant = "desktop",
  onNavigate,
}: {
  variant?: Variant;
  onNavigate?: () => void;
}) {
  const locale = useLocale();
  const pathname = usePathname() || "/";
  const other: Locale = locale === "en" ? "zh" : "en";
  const href = swapLocale(locale, pathname, other);
  const ui = uiContent[locale].header.language;
  const otherLabel = other === "en" ? ui.en : ui.zh;
  const otherFullName = other === "en" ? "English" : "中文";

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100"
      >
        {ui.switchTo} {otherFullName}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${ui.switchTo} ${otherFullName}`}
      className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border border-ink-200 px-3 text-xs font-semibold text-ink-700 transition hover:border-ink-800/40 hover:text-ink-900"
    >
      {otherLabel}
    </Link>
  );
}
