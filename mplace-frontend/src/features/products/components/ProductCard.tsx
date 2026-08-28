import { Link } from "react-router-dom";
import type { ProductResponse } from "../types/product";
import { StatusBadge } from "./StatusBadge";
import { formatPrice } from "../../../shared/lib/formatPrice";
import { useCart } from "../../cart/hooks/useCart";
import { ProductImagePlaceholder } from "../../../shared/components/ProductImagePlaceholder";

export function ProductCard({ product }: { product: ProductResponse }) {
  const { addItem } = useCart();
  const isActive = product.status === "ACTIVE" && product.stockQuantity > 0;

  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-4 transition-shadow hover:shadow-sm">
      <Link to={`/products/${product.id}`} className="flex flex-1 flex-col gap-2">
        <ProductImagePlaceholder name={product.name} sku={product.sku} className="mb-1" />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-ink">{product.name}</h3>
          <StatusBadge status={product.status} />
        </div>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-muted">{product.description}</p>
        )}
        <p className="text-lg font-semibold text-ink">{formatPrice(product.price)}</p>
        <p className="text-xs text-ink-muted">
          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
        </p>
      </Link>
      <button
        type="button"
        disabled={!isActive}
        onClick={() =>
          addItem({
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            availableStock: product.stockQuantity,
          })
        }
        className="mt-3 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-muted"
      >
        {isActive ? "Add to cart" : "Unavailable"}
      </button>
    </div>
  );
}
