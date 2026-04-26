import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import { products as staticProducts } from "@/data/products";
import { cmsImageUrl } from "@/lib/cms";
import {
  pickPrimaryImage,
  type ProductImageRow,
  type ProductRow,
  type ProductStatus,
} from "@/lib/products-cms";
import { getServiceSupabase } from "@/lib/supabase";
import { ProductsFilterBar } from "./FilterBar";
import { MigrateButton } from "./MigrateButton";
import { ProductStatusBadge } from "./StatusBadge";

export const metadata = { title: "Products" };

const PAGE_SIZE = 50;

type SearchParams = {
  status?: string;
  category?: string;
  q?: string;
  page?: string;
};

const SPECIFIC_STATUSES: ProductStatus[] = [
  "draft",
  "published",
  "archived",
];

type StatusFilter = "active" | ProductStatus;

type ProductWithImagesRow = ProductRow & {
  product_images: Array<
    Pick<
      ProductImageRow,
      "id" | "storage_path" | "position" | "is_primary"
    >
  >;
};

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-dashed border-clay-500/40 bg-clay-500/5 p-8 text-sm text-clay-700">
        Supabase isn&rsquo;t configured in this environment, so there&rsquo;s
        nothing to show. Check the service-role env vars and reload.
      </div>
    );
  }

  const status: StatusFilter =
    SPECIFIC_STATUSES.includes(params.status as ProductStatus)
      ? (params.status as ProductStatus)
      : "active";
  const categoryFilter = params.category ?? null;
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const fromIdx = (page - 1) * PAGE_SIZE;
  const toIdx = fromIdx + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select(
      "id, slug, category_slug, status, name_en, name_zh, summary_en, featured, position, updated_at, product_images(id, storage_path, position, is_primary)",
      { count: "exact" },
    )
    .order("position", { ascending: true })
    .range(fromIdx, toIdx);

  if (status === "active") {
    query = query.in("status", ["draft", "published"]);
  } else {
    query = query.eq("status", status);
  }
  if (categoryFilter) query = query.eq("category_slug", categoryFilter);
  if (q) {
    const like = `%${q.replace(/[%,]/g, " ")}%`;
    query = query.or(
      `slug.ilike.${like},name_en.ilike.${like},name_zh.ilike.${like}`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    return (
      <div className="rounded-2xl border border-clay-500/40 bg-clay-500/5 p-6 text-sm text-clay-700">
        Failed to load products: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as unknown as ProductWithImagesRow[];

  // Total count regardless of filters — used to decide whether to show
  // the "Migrate static catalog" banner. Cheap header-only call.
  const { count: totalRows } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  const dbIsEmpty = (totalRows ?? 0) === 0;

  // Featured count among published — informs sales how many will compete
  // for the home page's 4 featured slots.
  const { count: featuredPublishedCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("featured", true)
    .eq("status", "published");

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  const categoryNameBySlug = new Map(
    categories.map((c) => [c.slug, c.name]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-ink-600">
            {count ?? 0}{" "}
            {status === "active"
              ? "active (draft + published)"
              : `${status}`}
            {categoryFilter
              ? ` · ${categoryNameBySlug.get(categoryFilter) ?? categoryFilter}`
              : ""}
            {q ? ` · search "${q}"` : ""}
            {!q && !categoryFilter && featuredPublishedCount != null && (
              <>
                {" · "}
                {featuredPublishedCount} featured
                {featuredPublishedCount > 4 ? " (home shows 4)" : ""}
              </>
            )}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary text-sm">
          + New product
        </Link>
      </div>

      {dbIsEmpty && <MigrateButton staticCount={staticProducts.length} />}

      <ProductsFilterBar
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-sand-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3" />
                <th scope="col" className="px-4 py-3">
                  Name
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Updated
                </th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-500">
                    {dbIsEmpty
                      ? "No products in the database yet. Migrate the static catalog or add a new product to get started."
                      : "No products match the current filters."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const primary = pickPrimaryImage(
                    (row.product_images ?? []) as ProductImageRow[],
                  );
                  const thumbUrl = cmsImageUrl(primary?.storage_path ?? null);
                  const displayName =
                    row.name_en ?? row.name_zh ?? `(no name) ${row.slug}`;
                  return (
                    <tr key={row.id} className="hover:bg-sand-50/60">
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-sand-100">
                          {thumbUrl ? (
                            <Image
                              src={thumbUrl}
                              alt={displayName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-ink-900">
                          {displayName}
                        </div>
                        <div className="font-mono text-[0.7rem] text-ink-400">
                          {row.slug}
                        </div>
                        {row.name_zh && row.name_en && (
                          <div className="mt-0.5 text-xs text-ink-500">
                            {row.name_zh}
                          </div>
                        )}
                        {(!row.name_en || !row.name_zh) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {!row.name_en && (
                              <span className="inline-flex items-center rounded-full bg-clay-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-clay-700 ring-1 ring-inset ring-clay-500/20">
                                Missing EN
                              </span>
                            )}
                            {!row.name_zh && (
                              <span className="inline-flex items-center rounded-full bg-clay-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-clay-700 ring-1 ring-inset ring-clay-500/20">
                                Missing ZH
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-700">
                        {categoryNameBySlug.get(row.category_slug) ??
                          row.category_slug}
                      </td>
                      <td className="px-4 py-3">
                        <ProductStatusBadge status={row.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-500">
                        {formatDate(row.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/products/${row.id}`}
                          className="text-sm font-semibold text-moss-800 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-600">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <PageLink
              page={page - 1}
              disabled={page <= 1}
              searchParams={params}
              label="← Previous"
            />
            <PageLink
              page={page + 1}
              disabled={page >= totalPages}
              searchParams={params}
              label="Next →"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  page,
  disabled,
  searchParams,
  label,
}: {
  page: number;
  disabled: boolean;
  searchParams: SearchParams;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-ink-100 px-3 py-1.5 text-xs text-ink-300">
        {label}
      </span>
    );
  }
  const next = new URLSearchParams();
  if (searchParams.status) next.set("status", searchParams.status);
  if (searchParams.category) next.set("category", searchParams.category);
  if (searchParams.q) next.set("q", searchParams.q);
  next.set("page", String(page));
  return (
    <Link
      href={`/admin/products?${next.toString()}`}
      className="rounded-md border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
    >
      {label}
    </Link>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
