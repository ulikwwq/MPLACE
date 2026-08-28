import { apiClient } from "../../../shared/lib/apiClient";
import type { OrderRequest, OrderResponse } from "../types/order";

export const ordersApi = {
  create(request: OrderRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>("/api/orders", request);
  },

  getById(id: number): Promise<OrderResponse> {
    return apiClient.get<OrderResponse>(`/api/orders/${id}`);
  },
};
