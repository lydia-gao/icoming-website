import Link from "next/link";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";

export function NotFoundView({ locale }: { locale: Locale }) {
  const ui = uiContent[locale].notFound;

  return (
    <section className="py-24">
      <div className="container-content max-w-xl text-center">
        <div className="eyebrow">{ui.eyebrow}</div>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink-900">
          {ui.heading}
        </h1>
        <p className="mt-4 text-ink-600">{ui.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={localePath(locale, "/")} className="btn-primary">
            {ui.home}
          </Link>
          <Link href={localePath(locale, "/products")} className="btn-secondary">
            {ui.browseProducts}
          </Link>
        </div>
      </div>
    </section>
  );
}
