"use client";

import { useInquiry } from "@/lib/inquiry-context";
import { useLocale } from "@/lib/locale-context";
import { uiContent } from "@/content/ui";

type Props = {
  slug: string;
  name: string;
  image: string;
  variant?: "card" | "full";
  className?: string;
};

export function SaveButton({ slug, name, image, variant = "card", className = "" }: Props) {
  const { hasItem, toggle, hydrated } = useInquiry();
  const locale = useLocale();
  const ui = uiContent[locale].saveButton;
  const saved = hydrated && hasItem(slug);

  const base =
    variant === "full"
      ? "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition"
      : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition";

  const style = saved
    ? "bg-moss-700 text-white hover:bg-moss-800"
    : "bg-white text-ink-800 ring-1 ring-ink-100 hover:ring-ink-800/30";

  const label = saved
    ? ui.saved
    : variant === "full"
    ? ui.saveToInquiry
    : ui.save;

  return (
    <button
      type="button"
      onClick={() => toggle({ slug, name, image })}
      aria-pressed={saved}
      aria-label={saved ? ui.removeAria(name) : ui.saveAria(name)}
      className={`${base} ${style} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={variant === "full" ? "h-4 w-4" : "h-3.5 w-3.5"}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {label}
    </button>
  );
}
