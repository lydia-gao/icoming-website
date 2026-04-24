import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/types";
import { getCategoryBySlug } from "@/data/categories";
import { SaveButton } from "./SaveButton";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategoryBySlug(product.categorySlug);
  const image = product.images[0];

  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block">
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
          <Link href={`/products/${product.slug}`} className="hover:underline decoration-moss-500 underline-offset-4">
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-ink-600">{product.summary}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="text-xs text-ink-400">
            {product.moq ? <span>MOQ {product.moq}</span> : <span>Custom order</span>}
          </div>
          <SaveButton slug={product.slug} name={product.name} image={image} />
        </div>
      </div>
    </article>
  );
}
