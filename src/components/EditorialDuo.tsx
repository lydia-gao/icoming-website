import Image from "next/image";

type Panel = { image: string; caption?: string };

type Props = {
  eyebrow?: string;
  heading: string;
  body?: string;
  left: Panel;
  right: Panel;
};

/**
 * Two-column editorial section using styled flat-lay photography.
 * Mobile: stacks left → right.
 */
export function EditorialDuo({ eyebrow, heading, body, left, right }: Props) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-content">
        <div className="max-w-2xl">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 className="section-heading mt-2">{heading}</h2>
          {body && <p className="mt-3 text-ink-600">{body}</p>}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl">
            <div className="relative aspect-[4/5]">
              <Image
                src={left.image}
                alt={left.caption ?? "Product photography"}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {left.caption && (
              <figcaption className="mt-2 text-xs text-ink-400">{left.caption}</figcaption>
            )}
          </figure>

          <figure className="overflow-hidden rounded-3xl sm:mt-16">
            <div className="relative aspect-[4/5]">
              <Image
                src={right.image}
                alt={right.caption ?? "Product photography"}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {right.caption && (
              <figcaption className="mt-2 text-xs text-ink-400">{right.caption}</figcaption>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
