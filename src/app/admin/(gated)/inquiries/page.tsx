import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";
import { FilterBar } from "./FilterBar";
import { StatusBadge } from "./StatusBadge";

export const metadata = { title: "Inquiries" };

type SearchParams = {
  status?: string;
  q?: string;
  sort?: "date_desc" | "date_asc";
  page?: string;
};

const PAGE_SIZE = 50;
const VALID_STATUSES = ["new", "in_progress", "quoted", "won", "lost"] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];

type ListRow = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  status: InquiryStatus;
  assigned_to: string | null;
  item_count: number;
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-dashed border-clay-500/40 bg-clay-500/5 p-8 text-sm text-clay-700">
        Supabase is not configured in this environment, so there are no
        inquiries to show. Check the service-role env vars and reload.
      </div>
    );
  }

  const statusFilter =
    params.status && (VALID_STATUSES as readonly string[]).includes(params.status)
      ? (params.status as InquiryStatus)
      : null;
  const q = (params.q ?? "").trim();
  const sort = params.sort === "date_asc" ? "date_asc" : "date_desc";
  const page = Math.max(1, Number(params.page) || 1);
  const fromIdx = (page - 1) * PAGE_SIZE;
  const toIdx = fromIdx + PAGE_SIZE - 1;

  let query = supabase
    .from("inquiries")
    .select(
      "id, request_id, created_at, name, email, company, status, assigned_to, inquiry_items(count)",
      { count: "exact" },
    )
    .order("created_at", { ascending: sort === "date_asc" })
    .range(fromIdx, toIdx);

  if (statusFilter) query = query.eq("status", statusFilter);
  if (q) {
    const like = `%${q.replace(/[%,]/g, " ")}%`;
    query = query.or(
      `name.ilike.${like},company.ilike.${like},email.ilike.${like},request_id.ilike.${like}`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    return (
      <div className="rounded-2xl border border-clay-500/40 bg-clay-500/5 p-6 text-sm text-clay-700">
        Failed to load inquiries: {error.message}
      </div>
    );
  }

  const rows: ListRow[] = (data ?? []).map((r) => {
    const rawItems = (r as unknown as { inquiry_items?: Array<{ count: number }> })
      .inquiry_items;
    return {
      id: r.id,
      request_id: r.request_id,
      created_at: r.created_at,
      name: r.name,
      email: r.email,
      company: r.company,
      status: r.status as InquiryStatus,
      assigned_to: r.assigned_to,
      item_count: Array.isArray(rawItems) ? rawItems[0]?.count ?? 0 : 0,
    };
  });

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Inquiries</h1>
          <p className="mt-1 text-sm text-ink-600">
            {count ?? 0} total
            {statusFilter ? ` · filtered by ${statusFilter.replace("_", " ")}` : ""}
            {q ? ` · search "${q}"` : ""}
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-sand-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Request
                </th>
                <th scope="col" className="px-4 py-3">
                  Received
                </th>
                <th scope="col" className="px-4 py-3">
                  Contact
                </th>
                <th scope="col" className="px-4 py-3">
                  Items
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-500">
                    No inquiries match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-sand-50/60">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        href={`/admin/inquiries/${r.id}`}
                        className="font-semibold text-moss-800 hover:underline"
                      >
                        {r.request_id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">
                        {r.company ?? r.name}
                      </div>
                      <div className="text-xs text-ink-500">
                        {r.company ? `${r.name} · ${r.email}` : r.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{r.item_count}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))
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
  if (searchParams.q) next.set("q", searchParams.q);
  if (searchParams.sort) next.set("sort", searchParams.sort);
  next.set("page", String(page));
  return (
    <Link
      href={`/admin/inquiries?${next.toString()}`}
      className="rounded-md border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
    >
      {label}
    </Link>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
