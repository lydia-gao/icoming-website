import Link from "next/link";
import { notFound } from "next/navigation";
import { buildInitialFormValues } from "@/lib/cms-defaults";
import { findSectionSchema, type SectionPage } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { SectionEditor } from "./SectionEditor";

export const metadata = { title: "Edit content" };

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const schema = findSectionSchema(key);
  if (!schema) notFound();

  const supabase = getServiceSupabase();
  let dbRow:
    | { fields: Record<string, unknown>; updated_at: string }
    | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("cms_sections")
      .select("fields, updated_at")
      .eq("section_key", key)
      .maybeSingle();
    if (data) {
      dbRow = {
        fields:
          data.fields &&
          typeof data.fields === "object" &&
          !Array.isArray(data.fields)
            ? (data.fields as Record<string, unknown>)
            : {},
        updated_at: data.updated_at,
      };
    }
  }

  const initialValues = buildInitialFormValues(schema, dbRow?.fields ?? null);
  const previewPath = previewPathForPage(schema.page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/content/${schema.page}`}
            className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"
          >
            <span aria-hidden>←</span> {pageLabel(schema.page)}
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-semibold">
            {schema.label}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">
            {schema.description}
          </p>
        </div>
        {previewPath && (
          <Link
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-300 hover:text-ink-900"
          >
            Preview <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      <SectionEditor
        schema={schema}
        initialValues={initialValues}
        initialIsCustomized={dbRow !== null}
        initialUpdatedAt={dbRow?.updated_at ?? null}
      />
    </div>
  );
}

function pageLabel(page: SectionPage): string {
  switch (page) {
    case "home":
      return "Home";
    case "about":
      return "About";
    case "capabilities":
      return "Capabilities";
    case "trust":
      return "Trust & credentials";
  }
}

function previewPathForPage(page: SectionPage): string | null {
  switch (page) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "capabilities":
      return "/capabilities";
    case "trust":
      return "/about";
  }
}
