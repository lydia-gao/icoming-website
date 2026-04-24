"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { SaveButton } from "./SaveButton";

/**
 * Product detail right-column panel — tier pricing, size/color/material
 * pickers, quantity stepper, save-to-inquiry action.
 *
 * Variant selections are display-only in this phase: they drive the
 * pricing highlight and the pickers' selected state, but the Save
 * button persists only the slug/name/image (same as everywhere else
 * on the site). Phase 2 will pipe selections into the RFQ note.
 */
export function ProductVariantsPanel({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const ui = uiContent[locale].productDetail;
  const image = product.images[0];

  const minOrderQty = product.minOrderQty ?? 0;
  const initialQty = minOrderQty > 0 ? minOrderQty : 1;

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] ?? null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name ?? null,
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    product.materials?.[0] ?? null,
  );

  const activeTier = useMemo(() => {
    if (!product.priceRange) return null;
    return (
      product.priceRange.find(
        (t) =>
          quantity >= t.minQty &&
          (t.maxQty == null || quantity <= t.maxQty),
      ) ?? null
    );
  }, [product.priceRange, quantity]);

  const hasPricing = !!product.priceRange && product.priceRange.length > 0;
  const belowMoq = minOrderQty > 0 && quantity < minOrderQty;

  return (
    <div className="space-y-6">
      {/* Pricing */}
      {hasPricing && (
        <section className="rounded-2xl bg-sand-100/70 p-5 ring-1 ring-ink-100">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold text-ink-900">
              {ui.pricing.heading}
            </h3>
            {minOrderQty > 0 && (
              <span className="text-xs text-ink-600">
                {ui.pricing.minOrder}:{" "}
                <span className="font-semibold text-ink-900">
                  {minOrderQty} {ui.pricing.pcs}
                </span>
              </span>
            )}
          </div>

          <dl className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
            {product.priceRange!.map((tier, i) => {
              const isActive = activeTier === tier;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-moss-100/80 text-ink-900"
                      : "text-ink-700"
                  }`}
                >
                  <dt>
                    {tier.maxQty
                      ? ui.pricing.tierUpTo(tier.minQty, tier.maxQty)
                      : ui.pricing.tierAndUp(tier.minQty)}
                  </dt>
                  <dd
                    className={`font-mono ${isActive ? "font-semibold text-moss-800" : ""}`}
                  >
                    {tier.unitPrice}
                    <span className="ml-1 text-xs text-ink-400">
                      {ui.pricing.perPiece}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="mt-2 text-[0.7rem] italic text-ink-400">
            {ui.pricing.sampleDataNote}
          </p>
        </section>
      )}

      {/* Size */}
      {product.sizes && product.sizes.length > 0 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink-900">
              {ui.variants.size}
            </h3>
            {selectedSize && (
              <span className="text-xs text-ink-500">{selectedSize}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const isActive = selectedSize === size;
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-moss-700 bg-moss-700 text-white"
                      : "border-ink-100 bg-white text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Color */}
      {product.colors && product.colors.length > 0 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink-900">
              {ui.variants.color}
            </h3>
            {selectedColor && (
              <span className="text-xs text-ink-500">{selectedColor}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => {
              const isActive = selectedColor === color.name;
              return (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  aria-pressed={isActive}
                  aria-label={color.name}
                  title={color.name}
                  className={`relative h-8 w-8 rounded-full ring-2 transition ${
                    isActive
                      ? "ring-moss-700 ring-offset-2 ring-offset-sand-50"
                      : "ring-ink-100 hover:ring-ink-800/40"
                  }`}
                  style={{ backgroundColor: color.hex ?? "#D8D4CA" }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Material */}
      {product.materials && product.materials.length > 0 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink-900">
              {ui.variants.material}
            </h3>
            {selectedMaterial && (
              <span className="text-xs text-ink-500">{selectedMaterial}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.materials.map((material) => {
              const isActive = selectedMaterial === material;
              return (
                <button
                  type="button"
                  key={material}
                  onClick={() => setSelectedMaterial(material)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-moss-700 bg-moss-700 text-white"
                      : "border-ink-100 bg-white text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
                  }`}
                >
                  {material}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Quantity */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-ink-900">
          {ui.quantity.label}
        </h3>
        <div className="inline-flex items-stretch overflow-hidden rounded-full ring-1 ring-ink-100">
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.max(1, q - stepSize(q)))
            }
            aria-label={ui.quantity.decrease}
            className="flex h-10 w-10 items-center justify-center bg-white text-lg text-ink-700 transition hover:bg-sand-100"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              setQuantity(Math.max(1, Math.floor(n)));
            }}
            className="w-24 border-0 bg-white text-center font-mono text-sm text-ink-900 focus:ring-0"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + stepSize(q))}
            aria-label={ui.quantity.increase}
            className="flex h-10 w-10 items-center justify-center bg-white text-lg text-ink-700 transition hover:bg-sand-100"
          >
            +
          </button>
        </div>
        {belowMoq && (
          <p className="mt-2 text-xs text-clay-600">
            {ui.quantity.belowMoq(minOrderQty)}
          </p>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <SaveButton
          slug={product.slug}
          name={product.name}
          image={image}
          variant="full"
        />
        <Link
          href={localePath(locale, "/inquiry")}
          className="btn-secondary"
        >
          {ui.viewInquiryBasket}
        </Link>
      </div>
    </div>
  );
}

/** Step size scales with magnitude so the stepper stays useful at 10k+. */
function stepSize(q: number): number {
  if (q < 100) return 10;
  if (q < 1000) return 50;
  if (q < 10000) return 100;
  return 500;
}
