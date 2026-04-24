import Image from "next/image";
import type { Credential } from "@/content/_types";
import { isPlaceholder } from "@/content/_types";
import type { Locale } from "@/lib/i18n";
import { Placeholder } from "./Placeholder";

type Props = {
  eyebrow?: string;
  heading: string;
  body?: string;
  credentials: Credential[];
  locale: Locale;
};

export function CertStrip({ eyebrow, heading, body, credentials, locale }: Props) {
  return (
    <section className="bg-sand-100/60 py-16 sm:py-24">
      <div className="container-content">
        <div className="max-w-2xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 className="section-heading mt-2">{heading}</h2>
          {body && <p className="mt-3 text-ink-600">{body}</p>}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred, i) => {
            if (isPlaceholder(cred)) {
              return <Placeholder key={i} placeholder={cred} locale={locale} />;
            }
            return (
              <figure
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100"
              >
                <div className="relative aspect-[5/7] bg-sand-50">
                  <Image
                    src={cred.image}
                    alt={cred.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-contain p-4"
                  />
                </div>
                <figcaption className="border-t border-ink-100 p-4">
                  <div className="font-semibold text-ink-900">{cred.title}</div>
                  {cred.subtitle && (
                    <div className="mt-1 text-sm text-ink-600">{cred.subtitle}</div>
                  )}
                  {cred.issuer && (
                    <div className="mt-3 text-xs uppercase tracking-[0.12em] text-ink-400">
                      {cred.issuer}
                    </div>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
