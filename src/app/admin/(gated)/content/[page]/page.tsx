import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SECTION_PAGES,
  cardSectionSchemas,
  sectionSchemas,
  type SectionPage,
} from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";

export const metadata = { title: "Page content" };

export default async function ContentPageOverview({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageInfo = SECTION_PAGES.find((p) => p.key === page);
  if (!pageInfo) notFound();

  const pageKey = page as SectionPage;
  const sections = sectionSchemas.filter((s) => s.page === pageKey);
  const cardSections = cardSectionSchemas.filter((s) => s.page === pageKey);

  // Look up which singleton sections + card sections currently have
  // customizations so the list can show "Customized / Default" pills.
  const customizedKeys = new Set<string>();
  const customizedCardSections = new Set<string>();
  const supabase = getServiceSupabase();
  if (supabase && sections.length > 0) {
    const { data } = await supabase
      .from("cms_sections")
      .select("section_key")
      .in(
        "section_key",
        sections.map((s) => s.key),
      );
    for (const row of data ?? []) {
      customizedKeys.add(row.section_key);
    }
  }
  if (supabase && cardSections.length > 0) {
    const { data } = await supabase
      .from("cms_groups")
      .select("section_key")
      .in(
        "section_key",
        cardSections.map((s) => s.key),
      )
      .eq("active", true);
    for (const row of data ?? []) {
      customizedCardSections.add(row.section_key);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
        >
          <span aria-hidden>←</span> Content
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          {pageInfo.label}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Pick a section to edit its text or images. Each section keeps a
          &ldquo;Reset to default&rdquo; option.
        </p>
      </div>

      {sections.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold">Text & images</h2>
          <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
            {sections.map((s) => {
              const customized = customizedKeys.has(s.key);
              return (
                <li key={s.key}>
                  <Link
                    href={`/admin/content/section/${encodeURIComponent(s.key)}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-sand-50"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900">
                        {s.label}
                      </div>
                      <div className="text-sm text-ink-500">
                        {s.description}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {customized ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-moss-700" />
                          Customized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600">
                          Default
                        </span>
                      )}
                      <span aria-hidden className="text-ink-300">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {cardSections.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-semibold">Card collections</h2>
          <ul className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
            {cardSections.map((s) => {
              const customized = customizedCardSections.has(s.key);
              return (
                <li key={s.key}>
                  <Link
                    href={`/admin/content/cards/${encodeURIComponent(s.key)}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-sand-50"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900">
                        {s.label}
                      </div>
                      <div className="text-sm text-ink-500">
                        {s.description}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {customized ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-moss-700" />
                          Customized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600">
                          Default
                        </span>
                      )}
                      <span aria-hidden className="text-ink-300">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {sections.length === 0 && cardSections.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink-100 bg-white/60 p-6 text-sm text-ink-500">
          Editable sections for this page will appear here as they roll out.
        </div>
      )}
    </div>
  );
}
