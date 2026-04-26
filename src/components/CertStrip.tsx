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
                  {cred.image ? (
                    <Image
                      src={cred.image}
                      alt={cred.imageAlt ?? cred.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300">
                      <CertIcon className="h-10 w-10" aria-hidden />
                    </div>
                  )}
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

function CertIcon({
  className = "",
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
      <path d="M12 21l-2 2 4-2 4 2-2-2" />
    </svg>
  );
}
