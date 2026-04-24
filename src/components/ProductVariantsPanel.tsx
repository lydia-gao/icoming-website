"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/types";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { useInquiry } from "@/lib/inquiry-context";

/**
 * Product detail right-column panel — tier pricing, size/color/material
 * pickers (with a "Custom" escape hatch for each), quantity stepper,
 * save-to-inquiry actions.
 *
 * All variant state is captured into the inquiry cart on save, flows
 * through to the inquiry review page, the Supabase row, the sales email,
 * and the WhatsApp pre-fill.
 */
export function ProductVariantsPanel({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const ui = uiContent[locale].productDetail;
  const router = useRouter();
  const { upsert, hasItem } = useInquiry();
  const image = product.images[0];

  const minOrderQty = product.minOrderQty ?? 0;
  const initialQty = minOrderQty > 0 ? minOrderQty : 1;

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] ?? null,
  );
  const [customSize, setCustomSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name ?? null,
  );
  const [customColor, setCustomColor] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    product.materials?.[0] ?? null,
  );
  const [customMaterial, setCustomMaterial] = useState<string>("");
  const [justAdded, setJustAdded] = useState(false);

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
  const alreadyInCart = hasItem(product.slug);

  // Reset "Added ✓" confirmation after 2s.
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const captureSelection = () => {
    const isCustomSize = selectedSize === CUSTOM;
    const isCustomColor = selectedColor === CUSTOM;
    const isCustomMaterial = selectedMaterial === CUSTOM;

    const tierLabel = activeTier
      ? activeTier.maxQty
        ? ui.pricing.tierUpTo(activeTier.minQty, activeTier.maxQty)
        : ui.pricing.tierAndUp(activeTier.minQty)
      : undefined;

    upsert({
      slug: product.slug,
      name: product.name,
      image,
      size: isCustomSize ? undefined : selectedSize ?? undefined,
      sizeCustom: isCustomSize ? customSize.trim() || undefined : undefined,
      color: isCustomColor ? undefined : selectedColor ?? undefined,
      colorCustom: isCustomColor ? customColor.trim() || undefined : undefined,
      material: isCustomMaterial ? undefined : selectedMaterial ?? undefined,
      materialCustom: isCustomMaterial
        ? customMaterial.trim() || undefined
        : undefined,
      quantity,
      priceSnapshot: activeTier?.unitPrice,
      tierLabel,
    });
  };

  const handleAdd = () => {
    captureSelection();
    setJustAdded(true);
  };

  const handleRequestQuoteNow = () => {
    captureSelection();
    router.push(localePath(locale, "/inquiry"));
  };

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
                    isActive ? "bg-moss-100/80 text-ink-900" : "text-ink-700"
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
        <VariantPills
          label={ui.variants.size}
          options={product.sizes}
          customLabel={ui.variants.customOption}
          customPlaceholder={ui.variants.customSizePlaceholder}
          selected={selectedSize}
          onSelect={setSelectedSize}
          customValue={customSize}
          onCustomChange={setCustomSize}
        />
      )}

      {/* Color */}
      {product.colors && product.colors.length > 0 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink-900">
              {ui.variants.color}
            </h3>
            {selectedColor && (
              <span className="text-xs text-ink-500">
                {selectedColor === CUSTOM
                  ? ui.variants.customOption
                  : selectedColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <button
              type="button"
              onClick={() => setSelectedColor(CUSTOM)}
              aria-pressed={selectedColor === CUSTOM}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedColor === CUSTOM
                  ? "border-moss-700 bg-moss-700 text-white"
                  : "border-ink-100 bg-white text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
              }`}
            >
              {ui.variants.customOption}
            </button>
          </div>
          {selectedColor === CUSTOM && (
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder={ui.variants.customColorPlaceholder}
              className="mt-3 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
            />
          )}
        </section>
      )}

      {/* Material */}
      {product.materials && product.materials.length > 0 && (
        <VariantPills
          label={ui.variants.material}
          options={product.materials}
          customLabel={ui.variants.customOption}
          customPlaceholder={ui.variants.customMaterialPlaceholder}
          selected={selectedMaterial}
          onSelect={setSelectedMaterial}
          customValue={customMaterial}
          onCustomChange={setCustomMaterial}
        />
      )}

      {/* Quantity */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-ink-900">
          {ui.quantity.label}
        </h3>
        <div className="inline-flex items-stretch overflow-hidden rounded-full ring-1 ring-ink-100">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - stepSize(q)))}
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
        <button
          type="button"
          onClick={handleAdd}
          aria-live="polite"
          className={`btn-primary min-w-[10rem] transition ${
            justAdded ? "bg-moss-800" : ""
          }`}
        >
          {justAdded
            ? ui.cta.addedFeedback
            : alreadyInCart
            ? ui.cta.updateInquiry
            : ui.cta.addToInquiry}
        </button>
        <button
          type="button"
          onClick={handleRequestQuoteNow}
          className="btn-secondary"
        >
          {ui.cta.requestQuoteNow}
        </button>
      </div>
    </div>
  );
}

const CUSTOM = "__custom__";

function VariantPills({
  label,
  options,
  customLabel,
  customPlaceholder,
  selected,
  onSelect,
  customValue,
  onCustomChange,
}: {
  label: string;
  options: string[];
  customLabel: string;
  customPlaceholder: string;
  selected: string | null;
  onSelect: (value: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
}) {
  const showCustomInput = selected === CUSTOM;
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-900">{label}</h3>
        {selected && (
          <span className="text-xs text-ink-500">
            {selected === CUSTOM ? customLabel : selected}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onSelect(opt)}
              aria-pressed={isActive}
              className={pillClass(isActive)}
            >
              {opt}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onSelect(CUSTOM)}
          aria-pressed={selected === CUSTOM}
          className={pillClass(selected === CUSTOM)}
        >
          {customLabel}
        </button>
      </div>
      {showCustomInput && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={customPlaceholder}
          className="mt-3 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
        />
      )}
    </section>
  );
}

function pillClass(isActive: boolean): string {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition ${
    isActive
      ? "border-moss-700 bg-moss-700 text-white"
      : "border-ink-100 bg-white text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
  }`;
}

/** Step size scales with magnitude so the stepper stays useful at 10k+. */
function stepSize(q: number): number {
  if (q < 100) return 10;
  if (q < 1000) return 50;
  if (q < 10000) return 100;
  return 500;
}
