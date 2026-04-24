import Link from "next/link";
import { company } from "@/data/company";
import { contactContent } from "@/content/contact";

export const metadata = {
  title: "Contact",
  description: `Get in touch with ${company.brand} for quotes, samples, and custom projects.`,
};

export default function ContactPage() {
  const { hero, channels, visit } = contactContent;

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {hero.headline}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              {hero.body}{" "}
              <Link href="/inquiry" className="font-medium text-moss-700 underline decoration-moss-300 underline-offset-4 hover:text-moss-800">
                Start an inquiry →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-content grid gap-6 md:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.label === "WhatsApp" ? "_blank" : undefined}
              rel={c.label === "WhatsApp" ? "noopener noreferrer" : undefined}
              className="group rounded-2xl bg-white p-6 ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-700">
                {c.label}
              </div>
              <div className="mt-3 font-serif text-xl font-semibold text-ink-900 group-hover:text-moss-700">
                {c.primary}
              </div>
              {c.secondary && (
                <div className="mt-1 text-sm text-ink-600">{c.secondary}</div>
              )}
              <div className="mt-4 text-sm text-ink-400">{c.note}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-content grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">{visit.eyebrow}</div>
            <h2 className="section-heading mt-2">{visit.heading}</h2>
            <address className="mt-6 not-italic text-ink-600">
              <div className="font-medium text-ink-900">{company.legalName}</div>
              <div className="mt-2">
                {company.contact.address.line1}
                <br />
                {company.contact.address.line2}
                <br />
                {company.contact.address.region}
              </div>
            </address>
            <p className="mt-6 text-sm text-ink-600">{visit.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${company.contact.primaryEmail}`} className="btn-primary">
                Email sales
              </a>
              <Link href="/inquiry" className="btn-secondary">
                Inquiry basket
              </Link>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="overflow-hidden rounded-2xl bg-sand-100 ring-1 ring-ink-100">
              <iframe
                title="Factory location — Wenzhou"
                src="https://maps.google.com/maps?q=Wenzhou%20Zhejiang%20China&t=&z=11&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="420"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
