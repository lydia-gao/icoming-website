import Link from "next/link";
import { capabilitiesContent } from "@/content/capabilities";
import { Placeholder } from "@/components/Placeholder";
import { isPlaceholder } from "@/content/_types";

export const metadata = {
  title: "Capabilities & Customization",
  description:
    "Materials, printing techniques, customization, and quality control for eco-friendly bag production.",
};

export default function CapabilitiesPage() {
  const { hero, materials, printing, moq, leadTime, qc, compliance, cta } =
    capabilitiesContent;

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

      {/* Materials */}
      <section className="py-16 md:py-20">
        <div className="container-content">
          <div className="eyebrow">{materials.eyebrow}</div>
          <h2 className="section-heading mt-2">{materials.heading}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.items.map((m) => (
              <div key={m.name} className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
                <div className="font-semibold text-ink-900">{m.name}</div>
                <div className="mt-1 text-sm text-ink-600">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Printing */}
      <section className="bg-sand-100/60 py-16 md:py-20">
        <div className="container-content">
          <div className="eyebrow">{printing.eyebrow}</div>
          <h2 className="section-heading mt-2">{printing.heading}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {printing.items.map((p) => (
              <div key={p.name} className="rounded-2xl bg-white p-5 ring-1 ring-ink-100">
                <div className="font-semibold text-ink-900">{p.name}</div>
                <div className="mt-1 text-sm text-ink-600">{p.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOQ + Lead time (both currently placeholders) */}
      <section className="py-16 md:py-20">
        <div className="container-content grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-moss-700 p-8 text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-300">
              {moq.title}
            </div>
            <h3 className="mt-2 font-serif text-2xl leading-tight">{moq.heading}</h3>
            <div className="mt-6">
              {isPlaceholder(moq.body) ? (
                <div className="rounded-xl border border-dashed border-white/30 bg-white/[0.06] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-moss-300">
                    To be provided
                  </div>
                  <div className="mt-1 font-medium text-white">{moq.body.label}</div>
                  <p className="mt-2 text-sm text-white/80">{moq.body.needs}</p>
                </div>
              ) : (
                <p className="text-white/90">{moq.body}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-ink-900 p-8 text-ink-100">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-300">
              {leadTime.title}
            </div>
            <h3 className="mt-2 font-serif text-2xl leading-tight text-white">
              {leadTime.heading}
            </h3>
            <div className="mt-6">
              {isPlaceholder(leadTime.body) ? (
                <div className="rounded-xl border border-dashed border-white/25 bg-white/[0.04] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-moss-300">
                    To be provided
                  </div>
                  <div className="mt-1 font-medium text-white">{leadTime.body.label}</div>
                  <p className="mt-2 text-sm text-ink-100/75">{leadTime.body.needs}</p>
                </div>
              ) : (
                <p className="text-ink-100/85">{leadTime.body}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QC */}
      <section className="bg-ink-900 py-16 text-ink-100 md:py-20">
        <div className="container-content">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-300">
            {qc.eyebrow}
          </div>
          <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl">
            {qc.heading}
          </h2>

          <div className="mt-10 max-w-3xl">
            {isPlaceholder(qc.stages) ? (
              <div className="rounded-2xl border border-dashed border-white/25 bg-white/[0.04] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-moss-300">
                  To be provided
                </div>
                <div className="mt-1 font-medium text-white">{qc.stages.label}</div>
                <p className="mt-2 text-sm text-ink-100/75">{qc.stages.needs}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 md:py-20">
        <div className="container-content grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="eyebrow">{compliance.eyebrow}</div>
            <h2 className="section-heading mt-2">{compliance.heading}</h2>
            <p className="mt-4 text-ink-600">{compliance.body}</p>
          </div>

          <div className="md:col-span-7">
            {isPlaceholder(compliance.certifications) && (
              <Placeholder placeholder={compliance.certifications} />
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container-content">
          <div className="rounded-3xl bg-ink-900 p-10 text-center text-ink-100 sm:p-16">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              {cta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-100/70">{cta.body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={cta.primary.href} className="btn-primary">
                {cta.primary.label}
              </Link>
              <Link href={cta.secondary.href} className="btn-secondary">
                {cta.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
