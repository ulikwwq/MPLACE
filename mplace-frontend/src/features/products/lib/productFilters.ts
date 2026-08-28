import type { ProductResponse } from "../types/product";

export type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

/** Case-insensitive match against name, SKU, and description. */
export function matchesSearch(product: ProductResponse, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q) ||
    (product.description?.toLowerCase().includes(q) ?? false)
  );
}

export function filterBySearch(products: ProductResponse[], query: string): ProductResponse[] {
  return products.filter((p) => matchesSearch(p, query));
}

export function filterByCategory(
  products: ProductResponse[],
  categoryId: number | "all"
): ProductResponse[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.categoryId === categoryId);
}

export function sortProducts(products: ProductResponse[], sort: SortOption): ProductResponse[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return copy;
  }
}

/** Distinct category ids present in the currently loaded product list.
 *  The backend has no category-name endpoint yet, so options are labeled
 *  generically ("Category {id}") rather than guessing real names. */
export function getAvailableCategoryIds(products: ProductResponse[]): number[] {
  return [...new Set(products.map((p) => p.categoryId))].sort((a, b) => a - b);
}
