import Link from "next/link";
import {
  SECTION_PAGES,
  cardSectionSchemas,
  sectionSchemas,
} from "@/lib/cms-schemas";

export const metadata = { title: "Content" };

export default function ContentLandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Content</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-600">
          Edit text and images that appear on the public website. Pick a
          page below to see what can be customized. Changes save instantly
          to the live site, and each section keeps a &ldquo;Reset to default&rdquo;
          option if you want to go back.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {SECTION_PAGES.map((page) => {
          const sectionCount = sectionSchemas.filter(
            (s) => s.page === page.key,
          ).length;
          const cardCount = cardSectionSchemas.filter(
            (s) => s.page === page.key,
          ).length;
          const total = sectionCount + cardCount;
          const isInteractive = total > 0;

          const tile = (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100 transition hover:ring-moss-500/40">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-serif text-lg font-semibold text-ink-900">
                  {page.label}
                </div>
                <span className="text-xs text-ink-400">
                  {total === 0
                    ? "Coming soon"
                    : `${total} section${total === 1 ? "" : "s"}`}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-500">
                {total === 0
                  ? "Editable sections for this page will appear here as they roll out."
                  : "Open to edit text, images, and cards on this page."}
              </p>
            </div>
          );

          return (
            <li key={page.key}>
              {isInteractive ? (
                <Link href={`/admin/content/${page.key}`} className="block">
                  {tile}
                </Link>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-dashed border-ink-100 bg-white/60 p-5 text-sm text-ink-600">
        <div className="font-medium text-ink-800">
          Content management is launching in stages.
        </div>
        <p className="mt-1">
          Editable today: Home Hero, About page text, Capabilities
          Customization intro, plus the Factory / Team / Trade-show
          galleries on the About page. The Customization cards
          themselves and Credentials are coming next.
        </p>
      </div>
    </div>
  );
}
