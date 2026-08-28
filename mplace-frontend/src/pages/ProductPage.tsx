import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../features/products/hooks/useProduct";
import { StatusBadge } from "../features/products/components/StatusBadge";
import { useCart } from "../features/cart/hooks/useCart";
import { formatPrice } from "../shared/lib/formatPrice";
import { LoadingState } from "../shared/components/LoadingState";
import { ErrorState } from "../shared/components/ErrorState";
import { EmptyState } from "../shared/components/EmptyState";
import { ProductImagePlaceholder } from "../shared/components/ProductImagePlaceholder";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { product, isLoading, error, notFound } = useProduct(productId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <LoadingState label="Loading product…" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Product not found"
          message="This product may have been removed or the link is incorrect."
          action={
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Back to catalog
            </button>
          }
        />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ErrorState message={error ?? "Failed to load product."} />
      </div>
    );
  }

  const isActive = product.status === "ACTIVE" && product.stockQuantity > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <div className="mx-auto mb-6 max-w-xs">
          <ProductImagePlaceholder name={product.name} sku={product.sku} />
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ink">{product.name}</h1>
          <StatusBadge status={product.status} />
        </div>

        {product.description && (
          <p className="mt-3 text-ink-muted">{product.description}</p>
        )}

        <p className="mt-4 text-2xl font-semibold text-ink">{formatPrice(product.price)}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
        </p>

        {isActive ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border border-line">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-ink hover:bg-paper"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                className="px-3 py-1.5 text-ink hover:bg-paper"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                addItem(
                  {
                    productId: product.id,
                    productName: product.name,
                    unitPrice: product.price,
                    availableStock: product.stockQuantity,
                  },
                  quantity
                );
                setJustAdded(true);
              }}
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Add to cart
            </button>

            {justAdded && <span className="text-sm text-success">Added to cart.</span>}
          </div>
        ) : (
          <p className="mt-6 text-sm font-medium text-ink-muted">
            This product is currently unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
