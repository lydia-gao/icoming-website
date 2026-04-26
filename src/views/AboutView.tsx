import Image from "next/image";
import Link from "next/link";
import { aboutContent } from "@/content/about";
import { trustContent } from "@/content/trust";
import { isPlaceholder } from "@/content/_types";
import { Placeholder } from "@/components/Placeholder";
import { CertStrip } from "@/components/CertStrip";
import { localePath, type Locale } from "@/lib/i18n";

export function AboutView({ locale }: { locale: Locale }) {
  const { hero, story, timeline, values, factoryStrength, events, cta } =
    aboutContent[locale];
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

      {/* FACTORY STRENGTH — certifications + supplier credentials */}
      <CertStrip
        eyebrow={factoryStrength.eyebrow}
        heading={factoryStrength.heading}
        body={factoryStrength.body}
        credentials={trustContent[locale].credentials}
        locale={locale}
      />

      <section className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-2xl">
            <div className="eyebrow">{events.eyebrow}</div>
            <h2 className="section-heading mt-2">{events.heading}</h2>
            <p className="mt-3 text-ink-600">{events.intro}</p>
          </div>

          {/* Trade shows */}
          <div className="mt-12">
            <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
              {events.gallery.tradeshows.title}
            </h3>
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {events.gallery.tradeshows.photos.map((photo) => (
                <li
                  key={photo.src}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100"
                >
                  <div className="relative aspect-[4/3] bg-sand-100">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="px-4 py-3 text-sm text-ink-600">
                    {photo.caption}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Factory + Team */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
                {events.gallery.factory.title}
              </h3>
              <div className="mt-5">
                {isPlaceholder(events.gallery.factory.photos) ? (
                  <Placeholder
                    placeholder={events.gallery.factory.photos}
                    locale={locale}
                  />
                ) : (
                  <PhotoGrid photos={events.gallery.factory.photos} />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
                {events.gallery.team.title}
              </h3>
              <div className="mt-5">
                {isPlaceholder(events.gallery.team.photos) ? (
                  <Placeholder
                    placeholder={events.gallery.team.photos}
                    locale={locale}
                  />
                ) : (
                  <PhotoGrid photos={events.gallery.team.photos} />
                )}
              </div>
            </div>
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

function PhotoGrid({
  photos,
}: {
  photos: { src: string; caption: string }[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <li
          key={photo.src}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100"
        >
          <div className="relative aspect-[4/3] bg-sand-100">
            <Image
              src={photo.src}
              alt={photo.caption}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="px-3 py-2 text-xs text-ink-600">{photo.caption}</div>
        </li>
      ))}
    </ul>
  );
}
