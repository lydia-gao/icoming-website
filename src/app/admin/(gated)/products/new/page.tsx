import Link from "next/link";
import { categories } from "@/data/categories";
import { NewProductForm } from "./NewProductForm";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
        >
          <span aria-hidden>←</span> Products
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold">New product</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          Pick a slug, category, and at least one language for the name.
          The product is created as a draft — fill in the rest in the
          editor afterwards, then publish when ready.
        </p>
      </div>

      <NewProductForm
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
