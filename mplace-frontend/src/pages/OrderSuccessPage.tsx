import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { OrderResponse } from "../features/orders/types/order";
import { ordersApi } from "../features/orders/api/ordersApi";
import { OrderSummary } from "../features/orders/components/OrderSummary";
import { LoadingState } from "../shared/components/LoadingState";
import { ErrorState } from "../shared/components/ErrorState";
import { ApiError } from "../shared/types/api";
import { useCart } from "../features/cart/hooks/useCart";

interface LocationState {
  order?: OrderResponse;
}

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateOrder = (location.state as LocationState | null)?.order;
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderResponse | null>(stateOrder ?? null);
  const [isLoading, setIsLoading] = useState(!stateOrder);
  const [error, setError] = useState<string | null>(null);

  // The cart belongs to the shopping flow, not the confirmation page.
  // Clearing it here (once, on arrival) means CheckoutPage never has to
  // clear it itself — so there's no window where CheckoutPage is still
  // mounted with an empty cart and could redirect back to /cart.
  const hasCleared = useRef(false);
  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  useEffect(() => {
    // Order data is normally passed via navigation state right after
    // POST /api/orders, so no extra request is needed. Only fetch if the
    // page was opened directly (e.g. a refresh or a shared link).
    if (stateOrder || !id) return;

    let cancelled = false;
    setIsLoading(true);
    ordersApi
      .getById(Number(id))
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load order.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, stateOrder]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <LoadingState label="Loading order…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <ErrorState message={error ?? "Order not found."} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-ink">Order placed</h1>
        <p className="mt-1 text-ink-muted">Thanks — we've received your order.</p>
      </div>

      <OrderSummary order={order} />

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm font-medium text-brand hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
