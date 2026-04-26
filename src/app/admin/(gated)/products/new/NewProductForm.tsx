"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { slug: string; name: string }[];
};

export function NewProductForm({ categories }: Props) {
  const router = useRouter();
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categorySlug, setCategorySlug] = useState(
    categories[0]?.slug ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameEnChange(value: string) {
    setNameEn(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    // Keep typing relaxed but show a hint about format below.
    setSlug(value.toLowerCase());
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          category_slug: categorySlug,
          name_en: nameEn.trim() || null,
          name_zh: nameZh.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not create product");
      }
      const result = (await res.json()) as { product?: { id: string } };
      if (!result.product?.id) {
        throw new Error("Server returned no product id");
      }
      router.replace(`/admin/products/${result.product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setSaving(false);
    }
  }

  const slugLooksValid =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length > 0;
  const slugWarning =
    slug.length > 0 && !slugLooksValid
      ? "Use lowercase letters, numbers, and dashes (e.g. cotton-tote-promo)."
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink-700">
            Product name
          </legend>
          <p className="text-xs text-ink-500">
            At least one language is required. The English name auto-fills
            the slug below until you edit it manually.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium text-ink-500">English</span>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => onNameEnChange(e.target.value)}
                placeholder="e.g. Cotton Promotional Tote"
                className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-ink-500">中文</span>
              <input
                type="text"
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                placeholder="例如:宣传用棉布手提袋"
                className="mt-1 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
              />
            </label>
          </div>
        </fieldset>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
        <label className="block text-sm">
          <span className="text-sm font-medium text-ink-700">Slug</span>
          <p className="text-xs text-ink-500">
            Public URL piece — appears as{" "}
            <code className="rounded bg-sand-100 px-1 py-0.5 text-[0.7rem]">
              /products/{slug || "your-slug"}
            </code>
            . Becomes locked once published.
          </p>
          <input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="cotton-promotional-tote"
            className="mt-2 block w-full rounded-lg border-ink-100 bg-white font-mono text-sm focus:border-moss-500 focus:ring-moss-500"
          />
          {slugWarning && (
            <span className="mt-1 block text-xs text-clay-600">
              {slugWarning}
            </span>
          )}
        </label>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
        <label className="block text-sm">
          <span className="text-sm font-medium text-ink-700">Category</span>
          <p className="text-xs text-ink-500">
            Categories are managed in code. Pick the closest match — you can
            change this later.
          </p>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="mt-2 block w-full rounded-lg border-ink-100 bg-white text-sm focus:border-moss-500 focus:ring-moss-500"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-clay-500/10 px-3 py-2 text-sm text-clay-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !slugLooksValid || !categorySlug}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create as draft"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={saving}
          className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 hover:border-ink-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
