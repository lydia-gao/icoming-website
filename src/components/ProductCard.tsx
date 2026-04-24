import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import { getCategoryBySlug } from "@/data/categories";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { SaveButton } from "./SaveButton";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const category = getCategoryBySlug(product.categorySlug, locale);
  const image = product.images[0];
  const ui = uiContent[locale].productCard;

  // Lowest tier is typically the highest-volume tier (last in the array
  // since tiers are sorted ascending by minQty, and price decreases
  // with quantity). Use it for "starting from" display.
  const cheapestTier = product.priceRange?.[product.priceRange.length - 1];

  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={localePath(locale, `/products/${product.slug}`)} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {category && (
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-moss-700">
            {category.name}
          </div>
        )}

        <h3 className="font-serif text-lg leading-snug text-ink-900">
          <Link
            href={localePath(locale, `/products/${product.slug}`)}
            className="hover:underline decoration-moss-500 underline-offset-4"
          >
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-ink-600">{product.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="text-xs text-ink-500">
            {cheapestTier ? (
              <>
                <div className="font-medium text-ink-900">
                  <span className="text-[0.7rem] uppercase tracking-[0.14em] text-moss-700">
                    {ui.startingFrom}
                  </span>{" "}
                  <span className="font-mono text-sm">
                    {cheapestTier.unitPrice}
                  </span>
                  <span className="ml-0.5 text-[0.7rem] text-ink-400">
                    {ui.perPiece}
                  </span>
                </div>
                {product.moq && (
                  <div className="mt-0.5 text-ink-400">
                    {ui.moq} {product.moq}
                  </div>
                )}
              </>
            ) : product.moq ? (
              <span>
                {ui.moq} {product.moq}
              </span>
            ) : (
              <span>{ui.customOrder}</span>
            )}
          </div>
          <SaveButton slug={product.slug} name={product.name} image={image} />
        </div>
      </div>
    </article>
  );
}
