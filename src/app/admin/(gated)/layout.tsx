import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminRow } from "@/lib/supabase-server";

export const metadata = {
  title: {
    default: "ICOM BAG Admin",
    template: "%s · ICOM BAG Admin",
  },
};

export default async function AdminGatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminRow();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-content flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/inquiries"
              className="font-serif text-lg font-semibold"
            >
              ICOM BAG <span className="text-moss-700">Admin</span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm sm:flex">
              <Link
                href="/admin/inquiries"
                className="rounded-md px-3 py-1.5 text-ink-600 hover:bg-sand-100 hover:text-ink-900"
              >
                Inquiries
              </Link>
              <Link
                href="/admin/content"
                className="rounded-md px-3 py-1.5 text-ink-600 hover:bg-sand-100 hover:text-ink-900"
              >
                Content
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden flex-col text-right leading-tight sm:flex">
              <span className="font-medium text-ink-900">
                {admin.full_name ?? admin.email}
              </span>
              <span className="text-xs text-ink-400">
                {admin.role === "admin" ? "Admin" : "Sales"}
              </span>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md border border-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-800/40 hover:text-ink-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-content py-8">{children}</main>
    </div>
  );
}
