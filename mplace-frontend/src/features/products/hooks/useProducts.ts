import { useEffect, useState, useCallback } from "react";
import { productsApi } from "../api/productsApi";
import type { ProductResponse } from "../types/product";
import { ApiError } from "../../../shared/types/api";

interface UseProductsResult {
  products: ProductResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(categoryId?: number): UseProductsResult {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    productsApi
      .getAll(categoryId)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : "Failed to load products.";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, reloadToken]);

  return { products, isLoading, error, refetch };
}
