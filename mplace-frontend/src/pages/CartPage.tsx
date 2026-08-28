import { Link } from "react-router-dom";
import { useCart } from "../features/cart/hooks/useCart";
import { CartItemRow } from "../features/cart/components/CartItemRow";
import { EmptyState } from "../shared/components/EmptyState";
import { formatPrice } from "../shared/lib/formatPrice";

export function CartPage() {
  const { items, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalog to add products."
          action={
            <Link
              to="/"
              className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Go to catalog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Your cart</h1>

      <div className="rounded-lg border border-line bg-surface px-6">
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-line bg-surface p-6">
        <p className="text-lg font-medium text-ink">Total</p>
        <p className="text-xl font-semibold text-ink">{formatPrice(cartTotal)}</p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/"
          className="rounded-md border border-line bg-surface px-5 py-2.5 text-center text-sm font-medium text-ink hover:bg-paper"
        >
          Continue shopping
        </Link>
        <Link
          to="/checkout"
          className="rounded-md bg-brand px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-dark"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
