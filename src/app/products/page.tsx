import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { products } from "@/data/products";

export const metadata = {
  title: "Products",
  description:
    "Browse our full catalog of reusable eco-friendly bags — cotton, non-woven, cooler, drawstring, paper, jute, and more.",
};

export default function ProductsPage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <div className="eyebrow">Catalog</div>
          <h1 className="section-heading mt-2">All products</h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            {products.length} representative products across {categories.length}{" "}
            categories. Anything you see is fully customizable — reach out for
            quotes on sizes, materials, and prints outside what&apos;s shown.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-content grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
              Categories
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link className="block rounded-lg px-3 py-1.5 font-medium text-ink-900 hover:bg-sand-100" href="/products">
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    className="block rounded-lg px-3 py-1.5 text-ink-600 hover:bg-sand-100 hover:text-ink-900"
                    href={`/categories/${c.slug}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
