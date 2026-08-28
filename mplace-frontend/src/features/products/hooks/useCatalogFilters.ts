import { useMemo, useState } from "react";
import type { ProductResponse } from "../types/product";
import {
  filterByCategory,
  filterBySearch,
  getAvailableCategoryIds,
  sortProducts,
  type SortOption,
} from "../lib/productFilters";

export function useCatalogFilters(products: ProductResponse[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [sort, setSort] = useState<SortOption>("default");

  const categoryIds = useMemo(() => getAvailableCategoryIds(products), [products]);

  const visibleProducts = useMemo(() => {
    const bySearch = filterBySearch(products, searchQuery);
    const byCategory = filterByCategory(bySearch, categoryId);
    return sortProducts(byCategory, sort);
  }, [products, searchQuery, categoryId, sort]);

  const hasActiveFilters = searchQuery.trim() !== "" || categoryId !== "all";

  function clearFilters() {
    setSearchQuery("");
    setCategoryId("all");
  }

  return {
    searchQuery,
    setSearchQuery,
    categoryId,
    setCategoryId,
    sort,
    setSort,
    categoryIds,
    visibleProducts,
    hasActiveFilters,
    clearFilters,
  };
}
