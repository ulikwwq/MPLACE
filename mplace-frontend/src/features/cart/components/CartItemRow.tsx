import type { CartItem } from "../types/cart";
import { formatPrice } from "../../../shared/lib/formatPrice";
import { useCart } from "../hooks/useCart";

export function CartItemRow({ item }: { item: CartItem }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const atMaxStock = item.quantity >= item.availableStock;

  return (
    <div className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">{item.productName}</p>
        <p className="text-sm text-ink-muted">{formatPrice(item.unitPrice)} each</p>
        {atMaxStock && (
          <p className="text-xs text-accent">Max available stock reached</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border border-line">
          <button
            type="button"
            onClick={() => decreaseQuantity(item.productId)}
            aria-label={`Decrease quantity of ${item.productName}`}
            className="px-3 py-1.5 text-ink hover:bg-paper"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            type="button"
            onClick={() => increaseQuantity(item.productId)}
            disabled={atMaxStock}
            aria-label={`Increase quantity of ${item.productName}`}
            className="px-3 py-1.5 text-ink hover:bg-paper disabled:cursor-not-allowed disabled:text-ink-muted/50"
          >
            +
          </button>
        </div>

        <p className="w-24 text-right font-medium text-ink">
          {formatPrice(item.unitPrice * item.quantity)}
        </p>

        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          aria-label={`Remove ${item.productName} from cart`}
          className="text-sm text-ink-muted hover:text-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
