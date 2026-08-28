export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  categoryId: number;
}
