import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin sign in",
};

type SearchParams = {
  error?: string;
  sent?: string;
  next?: string;
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-content py-12 md:py-20">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"
          >
            <span aria-hidden>←</span> Back to site
          </Link>

          <div className="mt-6 rounded-2xl bg-white p-8 ring-1 ring-ink-100">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-700">
              ICOMing · Admin
            </div>
            <h1 className="mt-3 font-serif text-2xl font-semibold text-ink-900">
              Sign in to manage inquiries
            </h1>
            <p className="mt-3 text-sm text-ink-600">
              Enter the email you were added with. We&apos;ll send a one-time
              sign-in link — no password needed.
            </p>

            <LoginForm nextPath={params.next ?? "/admin/inquiries"} />

            {params.error && (
              <p className="mt-4 rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
                {params.error}
              </p>
            )}
            {params.sent && (
              <p className="mt-4 rounded-lg bg-moss-100 px-3 py-2 text-sm text-moss-800">
                Check your inbox for a sign-in link.
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ink-400">
            Access is limited to pre-registered sales / admin emails.
            Contact the site owner if you need to be added.
          </p>
        </div>
      </div>
    </div>
  );
}
