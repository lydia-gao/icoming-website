import Image from "next/image";
import Link from "next/link";
import { aboutContent } from "@/content/about";
import { trustContent } from "@/content/trust";
import { isPlaceholder, type Credential } from "@/content/_types";
import { Placeholder } from "@/components/Placeholder";
import { CertStrip } from "@/components/CertStrip";
import {
  cmsImageUrl,
  loadCmsCards,
  loadCmsSection,
  pickField,
  pickLocaleText,
  pickParagraphs,
  type CmsCardRow,
} from "@/lib/cms";
import { localePath, type Locale } from "@/lib/i18n";

type Photo = { src: string; caption: string };

export async function AboutView({ locale }: { locale: Locale }) {
  const a = aboutContent[locale];
  const [
    heroCms,
    storyCms,
    eventsCms,
    valuesCms,
    factoryStrengthCms,
    factoryCms,
    teamCms,
    tradeshowsCms,
    valuesItemsCms,
    credentialsCms,
  ] = await Promise.all([
    loadCmsSection("about.hero"),
    loadCmsSection("about.story"),
    loadCmsSection("about.events"),
    loadCmsSection("about.values"),
    loadCmsSection("about.factoryStrength"),
    loadCmsCards("about.events.factory"),
    loadCmsCards("about.events.team"),
    loadCmsCards("about.events.tradeshows"),
    loadCmsCards("about.values.items"),
    loadCmsCards("trust.credentials"),
  ]);

  const hero = {
    eyebrow: pickField(heroCms?.fields, "eyebrow", locale) ?? a.hero.eyebrow,
    headline:
      pickField(heroCms?.fields, "headline", locale) ?? a.hero.headline,
    body: pickField(heroCms?.fields, "body", locale) ?? a.hero.body,
  };
  const story = {
    eyebrow: pickField(storyCms?.fields, "eyebrow", locale) ?? a.story.eyebrow,
    heading:
      pickField(storyCms?.fields, "heading", locale) ?? a.story.heading,
    paragraphs:
      pickParagraphs(storyCms?.fields, "paragraphs", locale) ??
      a.story.paragraphs,
  };
  const events = {
    eyebrow:
      pickField(eventsCms?.fields, "eyebrow", locale) ?? a.events.eyebrow,
    heading:
      pickField(eventsCms?.fields, "heading", locale) ?? a.events.heading,
    intro: pickField(eventsCms?.fields, "intro", locale) ?? a.events.intro,
  };

  const factoryGallery = cardsToPhotos(factoryCms.cards, locale);
  const teamGallery = cardsToPhotos(teamCms.cards, locale);
  const tradeshowsGallery = cardsToPhotos(tradeshowsCms.cards, locale);

  const factoryPhotos =
    factoryGallery.length > 0 ? factoryGallery : a.events.gallery.factory.photos;
  const teamPhotos =
    teamGallery.length > 0 ? teamGallery : a.events.gallery.team.photos;
  const tradeshowPhotos =
    tradeshowsGallery.length > 0
      ? tradeshowsGallery
      : a.events.gallery.tradeshows.photos;

  const cmsValueItems =
    valuesItemsCms.cards.length > 0
      ? valuesItemsCms.cards.map((card) => ({
          title:
            (locale === "en" ? card.title_en : card.title_zh) ?? "",
          body:
            (locale === "en" ? card.description_en : card.description_zh) ?? "",
        }))
      : null;
  const values = {
    eyebrow: pickField(valuesCms?.fields, "eyebrow", locale) ?? a.values.eyebrow,
    heading:
      pickField(valuesCms?.fields, "heading", locale) ?? a.values.heading,
    items: cmsValueItems ?? a.values.items,
  };

  const factoryStrength = {
    eyebrow:
      pickField(factoryStrengthCms?.fields, "eyebrow", locale) ??
      a.factoryStrength.eyebrow,
    heading:
      pickField(factoryStrengthCms?.fields, "heading", locale) ??
      a.factoryStrength.heading,
    body:
      pickField(factoryStrengthCms?.fields, "body", locale) ??
      a.factoryStrength.body,
  };

  const cmsCredentials =
    credentialsCms.cards.length > 0
      ? credentialsCms.cards.map((card) => cardToCredential(card, locale))
      : null;
  const credentials = cmsCredentials ?? trustContent[locale].credentials;

  const { timeline, cta } = a;
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
        credentials={credentials}
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
              {a.events.gallery.tradeshows.title}
            </h3>
            {isPlaceholder(tradeshowPhotos) ? (
              <div className="mt-5">
                <Placeholder placeholder={tradeshowPhotos} locale={locale} />
              </div>
            ) : (
              <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tradeshowPhotos.map((photo, i) => (
                  <li
                    key={`${photo.src}-${i}`}
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
            )}
          </div>

          {/* Factory + Team */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
                {a.events.gallery.factory.title}
              </h3>
              <div className="mt-5">
                {isPlaceholder(factoryPhotos) ? (
                  <Placeholder placeholder={factoryPhotos} locale={locale} />
                ) : (
                  <PhotoGrid photos={factoryPhotos} />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
                {a.events.gallery.team.title}
              </h3>
              <div className="mt-5">
                {isPlaceholder(teamPhotos) ? (
                  <Placeholder placeholder={teamPhotos} locale={locale} />
                ) : (
                  <PhotoGrid photos={teamPhotos} />
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

function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {photos.map((photo, i) => (
        <li
          key={`${photo.src}-${i}`}
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

/** Convert CMS card rows into the {src, caption} shape PhotoGrid expects.
 *  Cards without an uploaded image are skipped (galleries need a photo). */
function cardsToPhotos(cards: CmsCardRow[], locale: Locale): Photo[] {
  return cards
    .map((c): Photo | null => {
      const src = cmsImageUrl(c.image_path);
      if (!src) return null;
      const caption = locale === "en" ? c.title_en : c.title_zh;
      return { src, caption: caption ?? "" };
    })
    .filter((p): p is Photo => p !== null);
}

/** Convert a CMS card row into a Credential for the CertStrip.
 *  Image is optional — CertStrip falls back to an icon tile when null. */
function cardToCredential(card: CmsCardRow, locale: Locale): Credential {
  const title =
    (locale === "en" ? card.title_en : card.title_zh) ??
    card.title_en ??
    card.title_zh ??
    "";
  const subtitle =
    (locale === "en" ? card.description_en : card.description_zh) ?? undefined;
  const image = cmsImageUrl(card.image_path) ?? undefined;
  const imageAlt =
    (locale === "en" ? card.image_alt_en : card.image_alt_zh) ?? undefined;
  const issuer = pickLocaleText(card.meta?.issuer, locale) ?? undefined;
  const validity = pickLocaleText(card.meta?.validity, locale) ?? undefined;
  return {
    title,
    subtitle: subtitle || undefined,
    image,
    imageAlt: imageAlt || undefined,
    issuer,
    validity,
  };
}
