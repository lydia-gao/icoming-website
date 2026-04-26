import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/data/categories";
import type {
  Bilingual,
  ProductColor,
  ProductImageRow,
  ProductPriceTier,
  ProductSpec,
} from "@/lib/products-cms";
import { getServiceSupabase } from "@/lib/supabase";
import { ProductStatusBadge } from "../StatusBadge";
import { PriceTiersEditor } from "./PriceTiersEditor";
import { ProductActions } from "./ProductActions";
import { ProductBasicsEditor } from "./ProductBasicsEditor";
import { ProductImagesEditor } from "./ProductImagesEditor";
import {
  bilingualToRows,
  colorsToRows,
  specsToRows,
  VariantOptionsEditor,
} from "./VariantOptionsEditor";

export const metadata = { title: "Edit product" };

type ProductRowFull = {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  category_slug: string;
  featured: boolean;

  name_en: string | null;
  name_zh: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  description_en: string | null;
  description_zh: string | null;
  moq_en: string | null;
  moq_zh: string | null;
  lead_time_en: string | null;
  lead_time_zh: string | null;

  min_order_qty: number | null;
  currency: string;

  price_tiers: ProductPriceTier[] | null;
  sizes: Bilingual[] | null;
  colors: ProductColor[] | null;
  materials: Bilingual[] | null;
  customization: Bilingual[] | null;
  specs: ProductSpec[] | null;
  tags: Bilingual[] | null;

  product_images: ProductImageRow[] | null;

  updated_at: string;
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceSupabase();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-dashed border-clay-500/40 bg-clay-500/5 p-8 text-sm text-clay-700">
        Supabase isn&rsquo;t configured.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, status, category_slug, featured, name_en, name_zh, summary_en, summary_zh, description_en, description_zh, moq_en, moq_zh, lead_time_en, lead_time_zh, min_order_qty, currency, price_tiers, sizes, colors, materials, customization, specs, tags, updated_at, product_images(id, product_id, storage_path, alt_en, alt_zh, position, is_primary, created_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as ProductRowFull;

  const categoryName =
    categories.find((c) => c.slug === product.category_slug)?.name ??
    product.category_slug;
  const previewPath =
    product.status === "published" ? `/products/${product.slug}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
          >
            <span aria-hidden>←</span> Products
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-semibold">
            {product.name_en ?? product.name_zh ?? `(no name) ${product.slug}`}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <ProductStatusBadge status={product.status} />
            <span className="font-mono text-xs">{product.slug}</span>
            <span>·</span>
            <span>{categoryName}</span>
            {product.featured && (
              <>
                <span>·</span>
                <span className="text-moss-700">Featured</span>
              </>
            )}
          </div>
        </div>
        {previewPath && (
          <Link
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300 hover:text-ink-900"
          >
            Preview <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      <ProductActions
        productId={product.id}
        slug={product.slug}
        initialStatus={product.status}
        initialFeatured={product.featured}
      />

      <ProductBasicsEditor
        productId={product.id}
        status={product.status}
        initial={{
          slug: product.slug,
          category_slug: product.category_slug,
          name: {
            en: product.name_en ?? "",
            zh: product.name_zh ?? "",
          },
          summary: {
            en: product.summary_en ?? "",
            zh: product.summary_zh ?? "",
          },
          description: {
            en: product.description_en ?? "",
            zh: product.description_zh ?? "",
          },
          moq: {
            en: product.moq_en ?? "",
            zh: product.moq_zh ?? "",
          },
          lead_time: {
            en: product.lead_time_en ?? "",
            zh: product.lead_time_zh ?? "",
          },
          min_order_qty:
            product.min_order_qty == null ? "" : String(product.min_order_qty),
          currency: product.currency || "$",
        }}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <PriceTiersEditor
        productId={product.id}
        initial={product.price_tiers ?? []}
        currency={product.currency || "$"}
      />

      <VariantOptionsEditor
        productId={product.id}
        initial={{
          sizes: bilingualToRows(product.sizes),
          materials: bilingualToRows(product.materials),
          customization: bilingualToRows(product.customization),
          tags: bilingualToRows(product.tags),
          colors: colorsToRows(product.colors),
          specs: specsToRows(product.specs),
        }}
      />

      <ProductImagesEditor
        productId={product.id}
        productNameEn={product.name_en ?? ""}
        productNameZh={product.name_zh ?? ""}
        initial={
          (product.product_images ?? [])
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((img) => ({
              storage_path: img.storage_path,
              alt_en: img.alt_en ?? "",
              alt_zh: img.alt_zh ?? "",
              is_primary: img.is_primary,
            }))
        }
      />
    </div>
  );
}
