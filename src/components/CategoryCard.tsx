import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/data/types";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";

export function CategoryCard({ category, locale }: { category: Category; locale: Locale }) {
  const ui = uiContent[locale].categoryCard;

  return (
    <Link
      href={localePath(locale, `/categories/${category.slug}`)}
      className="group relative block overflow-hidden rounded-2xl bg-sand-100 ring-1 ring-ink-100 transition hover:ring-ink-800/20"
    >
      <div className="relative aspect-[4/5] w-full">
        {category.heroImage && (
          <Image
            src={category.heroImage}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="font-serif text-lg font-semibold text-white">{category.name}</div>
          <p className="mt-1 line-clamp-2 text-sm text-white/75">
            {category.shortDescription}
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss-300">
            {ui.browse}
            <span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
