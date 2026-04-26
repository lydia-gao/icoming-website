import { revalidatePath, revalidateTag } from "next/cache";
import { CMS_CACHE_TAG } from "./cms";
import type { SectionPage } from "./cms-schemas";

/**
 * Flush every cache that surfaces a given page's CMS content.
 *
 * Two layers:
 *   1. revalidateTag(CMS_CACHE_TAG) → wipes the unstable_cache entries
 *      that loadCmsSection / loadCmsCards return.
 *   2. revalidatePath(...) for each public path that renders this page —
 *      busts the route-level cache so static pages re-render with the
 *      fresh CMS data on the next request.
 */
export function flushCmsCaches(page: SectionPage): void {
  revalidateTag(CMS_CACHE_TAG);
  for (const path of pathsForPage(page)) {
    revalidatePath(path);
  }
}

function pathsForPage(page: SectionPage): string[] {
  switch (page) {
    case "home":
      return ["/", "/zh"];
    case "about":
      return ["/about", "/zh/about"];
    case "capabilities":
      return ["/capabilities", "/zh/capabilities"];
    case "trust":
      // trust content (credentials) surfaces inside the About page.
      return ["/about", "/zh/about"];
  }
}
