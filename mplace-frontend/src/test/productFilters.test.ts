import { describe, it, expect } from "vitest";
import {
  matchesSearch,
  filterBySearch,
  sortProducts,
  getAvailableCategoryIds,
} from "../features/products/lib/productFilters";
import type { ProductResponse } from "../features/products/types/product";

function makeProduct(overrides: Partial<ProductResponse>): ProductResponse {
  return {
    id: 1,
    sku: "SKU-1",
    name: "Product",
    description: "A description",
    price: 100,
    stockQuantity: 10,
    status: "ACTIVE",
    categoryId: 1,
    ...overrides,
  };
}

describe("matchesSearch / filterBySearch", () => {
  const iphone = makeProduct({ id: 1, sku: "IPHONE-15-128", name: "iPhone 15", description: "Smartphone" });
  const mug = makeProduct({ id: 2, sku: "MUG-001", name: "Coffee Mug", description: "Ceramic mug, 350ml" });

  it("matches by name, case-insensitively", () => {
    expect(matchesSearch(iphone, "iphone")).toBe(true);
    expect(matchesSearch(iphone, "IPHONE")).toBe(true);
  });

  it("matches by SKU", () => {
    expect(matchesSearch(mug, "MUG-001")).toBe(true);
  });

  it("matches by description", () => {
    expect(matchesSearch(mug, "ceramic")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    expect(matchesSearch(iphone, "sunglasses")).toBe(false);
  });

  it("treats an empty/whitespace query as matching everything", () => {
    expect(matchesSearch(iphone, "")).toBe(true);
    expect(matchesSearch(iphone, "   ")).toBe(true);
  });

  it("handles a null description without throwing", () => {
    const noDescription = makeProduct({ description: null });
    expect(matchesSearch(noDescription, "anything")).toBe(false);
    expect(matchesSearch(noDescription, "")).toBe(true);
  });

  it("filterBySearch narrows a list down correctly", () => {
    const result = filterBySearch([iphone, mug], "mug");
    expect(result).toEqual([mug]);
  });
});

describe("sortProducts", () => {
  const cheap = makeProduct({ id: 1, name: "Zebra", price: 10 });
  const mid = makeProduct({ id: 2, name: "Apple", price: 50 });
  const expensive = makeProduct({ id: 3, name: "Mango", price: 90 });
  const list = [mid, expensive, cheap];

  it("sorts by price ascending", () => {
    expect(sortProducts(list, "price-asc").map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("sorts by price descending", () => {
    expect(sortProducts(list, "price-desc").map((p) => p.id)).toEqual([3, 2, 1]);
  });

  it("sorts by name A-Z", () => {
    expect(sortProducts(list, "name-asc").map((p) => p.name)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("sorts by name Z-A", () => {
    expect(sortProducts(list, "name-desc").map((p) => p.name)).toEqual(["Zebra", "Mango", "Apple"]);
  });

  it("'default' preserves original order and does not mutate the input array", () => {
    const original = [...list];
    const result = sortProducts(list, "default");
    expect(result).toEqual(original);
    expect(list).toEqual(original); // input untouched
  });

  it("does not mutate the input array for any sort option", () => {
    const original = [...list];
    sortProducts(list, "price-asc");
    expect(list).toEqual(original);
  });
});

describe("getAvailableCategoryIds", () => {
  it("returns distinct, sorted category ids", () => {
    const products = [
      makeProduct({ id: 1, categoryId: 3 }),
      makeProduct({ id: 2, categoryId: 1 }),
      makeProduct({ id: 3, categoryId: 3 }),
      makeProduct({ id: 4, categoryId: 2 }),
    ];
    expect(getAvailableCategoryIds(products)).toEqual([1, 2, 3]);
  });

  it("returns an empty array for an empty product list", () => {
    expect(getAvailableCategoryIds([])).toEqual([]);
  });
});
