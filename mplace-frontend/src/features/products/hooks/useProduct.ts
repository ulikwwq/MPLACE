import { useEffect, useState } from "react";
import { productsApi } from "../api/productsApi";
import type { ProductResponse } from "../types/product";
import { ApiError } from "../../../shared/types/api";

interface UseProductResult {
  product: ProductResponse | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useProduct(id: number): UseProductResult {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    productsApi
      .getById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        const message = err instanceof ApiError ? err.message : "Failed to load product.";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, isLoading, error, notFound };
}
