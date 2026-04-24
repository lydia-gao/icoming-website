"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { company } from "@/data/company";
import { InquiryBadge } from "./InquiryBadge";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/70 bg-sand-50/80 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 text-ink-900">
          <span className="font-serif text-xl font-semibold tracking-tight">
            {company.brand}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-ink-400 md:inline">
            Bag Mfg. Co.
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition ${
                  active ? "text-moss-700" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/inquiry" className="relative hidden md:inline-flex">
            <span className="btn-secondary">
              Inquiry
              <InquiryBadge />
            </span>
          </Link>
          <Link href="/contact" className="btn-primary hidden md:inline-flex">
            Get a Quote
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-100 md:hidden"
          >
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1">
              <span className={`block h-0.5 w-5 bg-ink-800 transition ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-ink-800 transition ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-ink-800 transition ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </div>
            <InquiryBadge className="absolute -right-0.5 -top-0.5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-sand-50 md:hidden">
          <div className="container-content flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/inquiry"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-100"
            >
              Inquiry Basket <InquiryBadge className="ml-1 align-middle" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-moss-700 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
