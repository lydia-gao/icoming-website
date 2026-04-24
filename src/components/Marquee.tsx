import Image from "next/image";

type Tile = { src: string; alt: string };

type Props = {
  tiles: Tile[];
  /** Rows to render. Alternates direction. Default 3. */
  rows?: number;
  /** Seconds for one full loop per row. Larger = slower. */
  speedSeconds?: number;
  className?: string;
};

/**
 * Slow, ambient horizontal marquee for the hero. Pure CSS — no JS.
 * - Tiles duplicate so the loop is seamless.
 * - Rows alternate direction (L, R, L, ...) via row index.
 * - Pauses on hover and honors `prefers-reduced-motion`.
 * - Edges fade out via a mask so tiles don't visually clip.
 */
export function Marquee({
  tiles,
  rows = 3,
  speedSeconds = 60,
  className = "",
}: Props) {
  if (tiles.length === 0) return null;

  // Distribute tiles evenly across rows, keeping each row reasonably long.
  const rowSize = Math.max(8, Math.ceil(tiles.length / rows));
  const rowTiles: Tile[][] = Array.from({ length: rows }, (_, i) => {
    const start = (i * rowSize) % tiles.length;
    const rotated = [...tiles.slice(start), ...tiles.slice(0, start)];
    return rotated.slice(0, rowSize);
  });

  return (
    <div
      className={`group/marquee relative overflow-hidden ${className}`}
      style={{
        // Soft fade on left/right edges
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {rowTiles.map((row, i) => {
          const reverse = i % 2 === 1;
          // Offset staggering so rows don't look perfectly aligned
          const delay = (-speedSeconds / rows) * i;
          const doubled = [...row, ...row]; // for seamless loop
          return (
            <div key={i} className="marquee-row">
              <div
                className="marquee-track"
                style={{
                  animationDuration: `${speedSeconds}s`,
                  animationDirection: reverse ? "reverse" : "normal",
                  animationDelay: `${delay}s`,
                }}
              >
                {doubled.map((tile, j) => (
                  <div key={`${i}-${j}`} className="marquee-tile">
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      sizes="(max-width: 640px) 120px, 160px"
                      className="object-cover"
                      // Mark later tiles lower-priority; first few still preload
                      priority={i === 0 && j < 3}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
