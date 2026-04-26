import { revalidatePath, revalidateTag } from "next/cache";
import { PRODUCTS_CACHE_TAG } from "./products-cms";

/**
 * Flush every cache that surfaces product data after an admin write.
 *
 * Two layers:
 *   1. revalidateTag(PRODUCTS_CACHE_TAG) — wipes loadPublishedProducts /
 *      loadPublishedProductBySlug cache entries.
 *   2. revalidatePath(...) for each public path that renders product
 *      data, so static / ISR pages re-render with fresh content on the
 *      next request.
 *
 * Optional `categorySlug` argument: pass when the write affected a
 * specific category page so its route gets invalidated too. Keeping
 * it optional avoids revalidating every category route on every save.
 */
export function flushProductCaches(categorySlug?: string): void {
  revalidateTag(PRODUCTS_CACHE_TAG);

  // Catalog + featured grid surfaces.
  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/products");
  revalidatePath("/zh/products");

  if (categorySlug) {
    revalidatePath(`/categories/${categorySlug}`);
    revalidatePath(`/zh/categories/${categorySlug}`);
  }
}

/**
 * Flush a specific product detail page after edit / publish / archive.
 * Distinct from flushProductCaches because [slug] paths need targeted
 * revalidation — wildcard revalidation isn't supported.
 */
export function flushProductDetailCache(slug: string): void {
  revalidateTag(PRODUCTS_CACHE_TAG);
  revalidatePath(`/products/${slug}`);
  revalidatePath(`/zh/products/${slug}`);
}
