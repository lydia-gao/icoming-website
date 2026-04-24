import Link from "next/link";
import { aboutContent } from "@/content/about";
import { isPlaceholder } from "@/content/_types";
import { Placeholder } from "@/components/Placeholder";
import { localePath, type Locale } from "@/lib/i18n";

export function AboutView({ locale }: { locale: Locale }) {
  const { hero, story, timeline, values, events, cta } = aboutContent[locale];
  const resolveHref = (href: string) => localePath(locale, href);

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {hero.headline}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">{hero.body}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-content grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">{story.eyebrow}</div>
            <h2 className="section-heading mt-2">{story.heading}</h2>
          </div>
          <div className="space-y-6 text-ink-600 md:col-span-7">
            {story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-100/60 py-16 md:py-20">
        <div className="container-content">
          <div className="eyebrow">{timeline.eyebrow}</div>
          <h2 className="section-heading mt-2">{timeline.heading}</h2>

          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {timeline.entries.map((entry, i) => {
              if (isPlaceholder(entry)) {
                return <Placeholder key={i} placeholder={entry} locale={locale} />;
              }
              return (
                <li key={i} className="rounded-2xl bg-white p-6 ring-1 ring-ink-100">
                  <div className="font-serif text-2xl font-semibold text-moss-700">
                    {entry.year}
                  </div>
                  <div className="mt-3 font-semibold text-ink-900">{entry.title}</div>
                  <p className="mt-2 text-sm text-ink-600">{entry.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-content grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">{values.eyebrow}</div>
            <h2 className="section-heading mt-2">{values.heading}</h2>
          </div>
          <div className="grid gap-4 md:col-span-7">
            {values.items.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 ring-1 ring-ink-100">
                <div className="font-serif text-lg font-semibold text-ink-900">{v.title}</div>
                <p className="mt-2 text-ink-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-2xl">
            <div className="eyebrow">{events.eyebrow}</div>
            <h2 className="section-heading mt-2">{events.heading}</h2>
          </div>
          <div className="mt-8 max-w-2xl">
            {isPlaceholder(events.body) ? (
              <Placeholder placeholder={events.body} locale={locale} />
            ) : (
              <p className="text-ink-600">{events.body}</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-content">
          <div className="rounded-3xl bg-ink-900 p-10 text-center text-ink-100 sm:p-16">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              {cta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-100/70">{cta.body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={resolveHref(cta.primary.href)} className="btn-primary">
                {cta.primary.label}
              </Link>
              <Link href={resolveHref(cta.secondary.href)} className="btn-secondary">
                {cta.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
