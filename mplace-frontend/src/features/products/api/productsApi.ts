import { apiClient } from "../../../shared/lib/apiClient";
import type { ProductResponse } from "../types/product";

export const productsApi = {
  getAll(categoryId?: number): Promise<ProductResponse[]> {
    const query = categoryId != null ? `?categoryId=${categoryId}` : "";
    return apiClient.get<ProductResponse[]>(`/api/products${query}`);
  },

  getById(id: number): Promise<ProductResponse> {
    return apiClient.get<ProductResponse>(`/api/products/${id}`);
  },
};
