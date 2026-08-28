import { useProducts } from "../features/products/hooks/useProducts";
import { useCatalogFilters } from "../features/products/hooks/useCatalogFilters";
import { ProductGrid } from "../features/products/components/ProductGrid";
import { SORT_OPTIONS } from "../features/products/lib/productFilters";
import { LoadingState } from "../shared/components/LoadingState";
import { ErrorState } from "../shared/components/ErrorState";
import { EmptyState } from "../shared/components/EmptyState";

export function CatalogPage() {
  const { products, isLoading, error, refetch } = useProducts();
  const {
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
  } = useCatalogFilters(products);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Catalog</h1>

      {isLoading && <LoadingState label="Loading products…" />}

      {!isLoading && error && <ErrorState message={error} onRetry={refetch} />}

      {!isLoading && !error && products.length === 0 && (
        <EmptyState title="No products yet" message="Check back soon." />
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 sm:min-w-[220px]">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full rounded-md border border-line bg-surface px-3 py-2 pr-8 text-sm text-ink focus:border-brand focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={categoryId === "all" ? "all" : String(categoryId)}
              onChange={(e) =>
                setCategoryId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              aria-label="Filter by category"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            >
              <option value="all">All categories</option>
              {categoryIds.map((id) => (
                <option key={id} value={id}>
                  Category {id}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort products"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {visibleProducts.length === 0 ? (
            <EmptyState
              title="No products match"
              message="Try a different search term or category."
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <ProductGrid products={visibleProducts} />
          )}
        </>
      )}
    </div>
  );
}
