"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Simple product gallery — main image + horizontal thumbnail rail.
 * Clicking a thumbnail swaps the main; mobile scrolls the rail
 * horizontally. No lightbox/zoom yet (deferred).
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const safeImages = images.length > 0 ? images : [""];
  const active = safeImages[Math.min(activeIdx, safeImages.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand-100 ring-1 ring-ink-100">
        {active && (
          <Image
            src={active}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
        )}
      </div>

      {safeImages.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Product images"
        >
          {safeImages.map((src, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${i + 1} of ${safeImages.length}`}
                onClick={() => setActiveIdx(i)}
                className={`relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand-100 ring-2 transition sm:h-20 sm:w-20 ${
                  isActive
                    ? "ring-moss-700"
                    : "ring-ink-100 hover:ring-ink-800/40"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
