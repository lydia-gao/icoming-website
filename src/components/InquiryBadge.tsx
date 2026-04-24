"use client";

import { useInquiry } from "@/lib/inquiry-context";

export function InquiryBadge({ className = "" }: { className?: string }) {
  const { count, hydrated } = useInquiry();
  if (!hydrated || count === 0) return null;
  return (
    <span
      className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-clay-500 px-1.5 text-[0.6875rem] font-semibold text-white ${className}`}
    >
      {count}
    </span>
  );
}
