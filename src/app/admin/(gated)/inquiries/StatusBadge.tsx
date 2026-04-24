type Status = "new" | "in_progress" | "quoted" | "won" | "lost";

const STYLE: Record<Status, { label: string; className: string }> = {
  new: { label: "New", className: "bg-moss-100 text-moss-800 ring-moss-300/50" },
  in_progress: {
    label: "In progress",
    className: "bg-sand-200 text-ink-800 ring-sand-300",
  },
  quoted: {
    label: "Quoted",
    className: "bg-clay-500/15 text-clay-600 ring-clay-500/30",
  },
  won: {
    label: "Won",
    className: "bg-moss-700 text-white ring-moss-800/30",
  },
  lost: {
    label: "Lost",
    className: "bg-ink-100 text-ink-600 ring-ink-100",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STYLE[status] ?? STYLE.new;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
