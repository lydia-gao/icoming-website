"use client";

import { useLocale } from "@/lib/locale-context";
import { uiContent } from "@/content/ui";
import {
  companyWhatsappNumber,
  genericWhatsappMessage,
  whatsappDeeplink,
} from "@/lib/whatsapp";

type Variant = "header" | "floating";

/**
 * Persistent WhatsApp CTA. Two placements:
 * - "header": compact pill in the desktop header (hidden on <md).
 * - "floating": fixed bottom-right bubble on mobile (hidden on md+).
 *
 * Both use the generic pre-filled message ("Hi, I found you on the
 * ICOMing website.") — the inquiry success page renders its own richer
 * WhatsApp button with the request ID + saved products pre-filled.
 */
export function WhatsAppButton({ variant }: { variant: Variant }) {
  const locale = useLocale();
  const ui = uiContent[locale].whatsapp;
  const href = whatsappDeeplink(
    companyWhatsappNumber,
    genericWhatsappMessage(locale),
  );

  if (variant === "header") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ui.ariaLabel}
        className="hidden items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1DA851] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-sand-50 md:inline-flex"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
        <span>{ui.shortLabel}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ui.ariaLabel}
      className="fixed bottom-4 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition hover:bg-[#1DA851] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 md:hidden"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="sr-only">{ui.shortLabel}</span>
    </a>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.11 17.34c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.27-.72.9-.88 1.08-.16.18-.33.2-.6.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.38-1.65-1.54-1.93-.16-.28-.02-.43.12-.57.12-.13.28-.33.41-.5.14-.17.18-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.53-.01-.18 0-.48.07-.73.34-.25.28-.96.93-.96 2.27 0 1.34.98 2.64 1.12 2.82.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.2 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.11-.25-.18-.53-.32zM16 4C9.4 4 4 9.4 4 16c0 2.11.55 4.18 1.6 6L4 28l6.2-1.62A11.95 11.95 0 0016 28c6.6 0 12-5.4 12-12S22.6 4 16 4zm0 21.89c-1.84 0-3.64-.5-5.22-1.43l-.37-.22-3.68.96.98-3.58-.24-.38A9.89 9.89 0 016.1 16c0-5.46 4.44-9.9 9.9-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.46-4.44 9.89-9.9 9.89z" />
    </svg>
  );
}
