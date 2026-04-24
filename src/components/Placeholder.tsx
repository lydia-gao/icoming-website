import type { Placeholder as PlaceholderType } from "@/content/_types";
import { uiContent } from "@/content/ui";
import type { Locale } from "@/lib/i18n";

type Props = {
  placeholder: PlaceholderType;
  locale: Locale;
  /** Size hint. "card" fills a content card; "inline" is a compact row. */
  size?: "card" | "inline";
  className?: string;
};

/**
 * Visual placeholder that makes it obvious what info still needs to be
 * provided by the business team. Intentionally *not* hidden in prod —
 * reviewers should see exactly what's missing.
 */
export function Placeholder({
  placeholder,
  locale,
  size = "card",
  className = "",
}: Props) {
  const label = uiContent[locale].placeholder.toBeProvided;

  if (size === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-clay-500/60 bg-clay-500/5 px-2.5 py-1 text-xs font-medium text-clay-600 ${className}`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay-500" />
        {label} — {placeholder.label}
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-dashed border-clay-500/50 bg-clay-500/[0.04] p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay-500/15 text-clay-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M12 9v4m0 4h.01M4.93 19h14.14a2 2 0 0 0 1.74-3l-7.07-12a2 2 0 0 0-3.48 0L3.19 16a2 2 0 0 0 1.74 3z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-clay-600">
            {label}
          </div>
          <div className="mt-1 font-medium text-ink-900">{placeholder.label}</div>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{placeholder.needs}</p>
        </div>
      </div>
    </div>
  );
}
