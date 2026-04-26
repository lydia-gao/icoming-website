import type { ProductStatus } from "@/lib/products-cms";

const STYLES: Record<ProductStatus, string> = {
  draft:
    "bg-ink-50 text-ink-600 ring-ink-100",
  published:
    "bg-moss-100 text-moss-800 ring-moss-200",
  archived:
    "bg-clay-500/10 text-clay-700 ring-clay-500/20",
};

const LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const DOT_STYLES: Record<ProductStatus, string> = {
  draft: "bg-ink-300",
  published: "bg-moss-700",
  archived: "bg-clay-500",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {LABELS[status]}
    </span>
  );
}
