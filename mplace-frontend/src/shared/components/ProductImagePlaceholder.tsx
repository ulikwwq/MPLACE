// Deterministic placeholder for products without a real image yet.
// The backend has no media system (see Phase 7 notes) — this is intentionally
// simple and swappable: once ProductResponse gains an imageUrl field, this
// component's internals can be replaced with an <img> while keeping the same
// call sites (ProductCard, ProductPage) unchanged.

const PALETTE = ["#23507a", "#c8622a", "#1f7a4d", "#6b4f9e", "#a3374d", "#3a7d7d"];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function ProductImagePlaceholder({
  name,
  sku,
  className = "",
}: {
  name: string;
  sku: string;
  className?: string;
}) {
  const seed = sku || name;
  const color = PALETTE[hashString(seed) % PALETTE.length];
  const initials = (name.trim().slice(0, 2) || "?").toUpperCase();

  return (
    <div
      role="img"
      aria-label={`${name} image placeholder`}
      className={`flex aspect-square w-full items-center justify-center rounded-md text-xl font-semibold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
