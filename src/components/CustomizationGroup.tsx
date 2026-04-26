import Image from "next/image";

/**
 * One titled group of customization options (e.g. "Printing methods",
 * "Handles"). Each item renders as a card with an optional image header
 * — when no image is set yet, the area falls back to a quiet placeholder
 * tile so the grid stays visually consistent. Real photos can be added
 * incrementally in `src/content/capabilities.ts` as the business
 * provides them.
 */
type CustomizationItem = {
  name: string;
  note?: string;
  image?: string;
};

type Props = {
  title: string;
  items: CustomizationItem[];
};

export function CustomizationGroup({ title, items }: Props) {
  return (
    <section className="mt-10 first:mt-0">
      <h3 className="font-serif text-xl font-semibold text-ink-900 sm:text-2xl">
        {title}
      </h3>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100"
          >
            <div className="relative aspect-[4/3] bg-sand-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-300">
                  <CameraIcon className="h-8 w-8" aria-hidden />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold text-ink-900">{item.name}</div>
              {item.note && (
                <p className="mt-1 text-sm text-ink-600">{item.note}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CameraIcon({
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
      <path d="M3 8.5C3 7.67 3.67 7 4.5 7h2.7l1.4-2h6.8l1.4 2h2.7c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
