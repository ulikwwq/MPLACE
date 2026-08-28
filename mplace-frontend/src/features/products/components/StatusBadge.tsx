import type { ProductStatus } from "../types/product";

export function StatusBadge({ status }: { status: ProductStatus }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (isActive
          ? "bg-success/10 text-success"
          : "bg-ink-muted/10 text-ink-muted")
      }
    >
      {isActive ? "In stock" : "Unavailable"}
    </span>
  );
}
