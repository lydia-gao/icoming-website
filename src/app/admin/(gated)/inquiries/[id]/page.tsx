import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabase";
import { InquiryEditor } from "./InquiryEditor";

export const metadata = { title: "Inquiry" };

type InquiryRow = {
  id: string;
  request_id: string;
  created_at: string;
  locale: "en" | "zh";
  status: "new" | "in_progress" | "quoted" | "won" | "lost";
  name: string;
  email: string;
  company: string | null;
  contact_method: string | null;
  contact_handle: string | null;
  other_platform_name: string | null;
  message: string | null;
  assigned_to: string | null;
  internal_notes: string | null;
};

type ItemRow = {
  id: string;
  inquiry_id: string;
  product_slug: string;
  product_name_snapshot: string;
  product_image_snapshot: string | null;
  quantity: number | null;
  variants: Record<string, string> | null;
  customization_notes: string | null;
  price_snapshot: string | null;
  created_at: string;
};

type UploadRow = {
  id: string;
  inquiry_id: string;
  item_id: string | null;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  kind: string | null;
  created_at: string;
};

type AdminRow = {
  id: string;
  email: string;
  full_name: string | null;
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-dashed border-clay-500/40 bg-clay-500/5 p-8 text-sm text-clay-700">
        Supabase is not configured.
      </div>
    );
  }

  const [inquiryRes, itemsRes, uploadsRes, adminsRes] = await Promise.all([
    supabase.from("inquiries").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("inquiry_items")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("inquiry_uploads")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("admin_users")
      .select("id, email, full_name")
      .eq("active", true)
      .order("full_name", { ascending: true }),
  ]);

  if (inquiryRes.error || !inquiryRes.data) notFound();

  const inquiry = inquiryRes.data as InquiryRow;
  const items = (itemsRes.data ?? []) as ItemRow[];
  const uploads = (uploadsRes.data ?? []) as UploadRow[];
  const admins = (adminsRes.data ?? []) as AdminRow[];

  const uploadsByItem = groupUploadsByItem(uploads);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
      >
        <span aria-hidden>←</span> All inquiries
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-moss-700">
            {inquiry.request_id}
          </div>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink-900">
            {inquiry.company ?? inquiry.name}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Received {formatDateTime(inquiry.created_at)} · locale{" "}
            <span className="font-mono">{inquiry.locale}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — contact + items + message */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
            <h2 className="font-serif text-lg font-semibold">Contact</h2>
            <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-1.5 text-sm">
              <dt className="text-ink-400">Name</dt>
              <dd className="text-ink-900">{inquiry.name}</dd>
              <dt className="text-ink-400">Email</dt>
              <dd>
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-moss-800 hover:underline"
                >
                  {inquiry.email}
                </a>
              </dd>
              {inquiry.company && (
                <>
                  <dt className="text-ink-400">Company</dt>
                  <dd className="text-ink-900">{inquiry.company}</dd>
                </>
              )}
              {inquiry.contact_method && (
                <>
                  <dt className="text-ink-400">Prefers</dt>
                  <dd className="text-ink-900">
                    <span className="capitalize">{inquiry.contact_method}</span>
                    {inquiry.contact_method === "other" && inquiry.other_platform_name
                      ? ` (${inquiry.other_platform_name})`
                      : ""}
                    {inquiry.contact_handle
                      ? ` — ${inquiry.contact_handle}`
                      : " — (handle not provided)"}
                  </dd>
                </>
              )}
            </dl>
          </section>

          {inquiry.message && (
            <section className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
              <h2 className="font-serif text-lg font-semibold">
                Message from buyer
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
                {inquiry.message}
              </p>
            </section>
          )}

          <section>
            <h2 className="font-serif text-lg font-semibold">
              Items ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-ink-500">
                (No products attached to this inquiry.)
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl bg-white p-4 ring-1 ring-ink-100"
                  >
                    <div className="flex gap-4">
                      {item.product_image_snapshot && (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
                          <Image
                            src={item.product_image_snapshot}
                            alt={item.product_name_snapshot}
                            fill
                            sizes="80px"
                            className="object-contain p-1.5"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900">
                          {item.product_name_snapshot}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-ink-400">
                          {item.product_slug}
                        </div>
                        {renderVariantChips(item)}
                        {item.customization_notes && (
                          <p className="mt-2 rounded-lg bg-sand-50 px-3 py-1.5 text-xs text-ink-700">
                            <span className="font-semibold text-ink-400">Notes:</span>{" "}
                            {item.customization_notes}
                          </p>
                        )}
                        {(uploadsByItem.get(item.id) ?? []).length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                              Attachments
                            </div>
                            <ul className="mt-1.5 space-y-1">
                              {(uploadsByItem.get(item.id) ?? []).map((u) => (
                                <li
                                  key={u.id}
                                  className="flex flex-wrap items-center gap-2 text-xs"
                                >
                                  <a
                                    href={`/api/admin/attachment/${u.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-moss-800 hover:underline"
                                  >
                                    {u.original_filename ?? "(file)"}
                                  </a>
                                  <span className="text-ink-400">
                                    {u.kind ?? "file"} ·{" "}
                                    {formatBytes(u.size_bytes ?? 0)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Inquiry-level attachments (not tied to a specific item) */}
            {uploadsByItem.get(null)?.length ? (
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-ink-100">
                <div className="text-sm font-semibold text-ink-900">
                  Other attachments
                </div>
                <ul className="mt-2 space-y-1">
                  {uploadsByItem.get(null)!.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-wrap items-center gap-2 text-xs"
                    >
                      <a
                        href={`/api/admin/attachment/${u.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-moss-800 hover:underline"
                      >
                        {u.original_filename ?? "(file)"}
                      </a>
                      <span className="text-ink-400">
                        {u.kind ?? "file"} · {formatBytes(u.size_bytes ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        {/* RIGHT — editable panel */}
        <aside className="lg:col-span-1">
          <InquiryEditor
            inquiryId={inquiry.id}
            initialStatus={inquiry.status}
            initialAssignedEmail={
              admins.find((a) => a.id === inquiry.assigned_to)?.email ?? null
            }
            initialNotes={inquiry.internal_notes ?? ""}
            admins={admins.map((a) => ({
              id: a.id,
              email: a.email,
              label: a.full_name ?? a.email,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}

function groupUploadsByItem(
  uploads: UploadRow[],
): Map<string | null, UploadRow[]> {
  const map = new Map<string | null, UploadRow[]>();
  for (const u of uploads) {
    const key = u.item_id ?? null;
    const list = map.get(key) ?? [];
    list.push(u);
    map.set(key, list);
  }
  return map;
}

function renderVariantChips(item: ItemRow) {
  const v = item.variants ?? {};
  const chips: Array<{ label: string; value: string }> = [];
  const sizeVal = v.sizeCustom ?? v.size;
  if (sizeVal)
    chips.push({ label: "Size", value: `${sizeVal}${v.sizeCustom ? " (custom)" : ""}` });
  const colorVal = v.colorCustom ?? v.color;
  if (colorVal)
    chips.push({ label: "Color", value: `${colorVal}${v.colorCustom ? " (custom)" : ""}` });
  const matVal = v.materialCustom ?? v.material;
  if (matVal)
    chips.push({
      label: "Material",
      value: `${matVal}${v.materialCustom ? " (custom)" : ""}`,
    });
  if (item.quantity != null) chips.push({ label: "Qty", value: `${item.quantity}` });
  if (item.price_snapshot) {
    const tierSuffix = v.tierLabel ? ` · ${v.tierLabel}` : "";
    chips.push({ label: "Tier", value: `${item.price_snapshot}${tierSuffix}` });
  }
  if (chips.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs text-moss-800"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.12em] text-moss-700/70">
            {chip.label}
          </span>
          <span className="font-medium">{chip.value}</span>
        </span>
      ))}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
