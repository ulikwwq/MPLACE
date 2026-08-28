import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../features/cart/hooks/useCart";
import { ordersApi } from "../features/orders/api/ordersApi";
import { formatPrice } from "../shared/lib/formatPrice";
import { ApiError } from "../shared/types/api";

export function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) {
      errors.customerName = "Please enter your name.";
    }
    if (!customerPhone.trim()) {
      errors.customerPhone = "Please enter your phone number.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const order = await ordersApi.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      navigate(`/orders/${order.id}/success`, { state: { order } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
        setFormError(describeError(err));
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Checkout</h1>

      <div className="mb-6 rounded-lg border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-ink-muted">Order summary</h2>
        <div className="divide-y divide-line">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{item.productName}</p>
                <p className="text-xs text-ink-muted">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="whitespace-nowrap text-sm font-medium text-ink">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <p className="font-medium text-ink">Total</p>
          <p className="text-lg font-semibold text-ink">{formatPrice(cartTotal)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <h2 className="text-sm font-medium text-ink-muted">Customer information</h2>
        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus:border-brand focus:outline-none"
            placeholder="Jane Doe"
          />
          {fieldErrors.customerName && (
            <p className="mt-1 text-sm text-danger">{fieldErrors.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-ink">
            Phone number
          </label>
          <input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus:border-brand focus:outline-none"
            placeholder="+996700000000"
          />
          {fieldErrors.customerPhone && (
            <p className="mt-1 text-sm text-danger">{fieldErrors.customerPhone}</p>
          )}
        </div>

        {formError && (
          <div className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-muted"
        >
          {isSubmitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}

function describeError(err: ApiError): string {
  switch (err.code) {
    case "VALIDATION_ERROR":
      return "Please check the highlighted fields and try again.";
    case "INVALID_ORDER":
      return err.message;
    case "PRODUCT_NOT_FOUND":
      return "One of the items in your cart is no longer available. Please review your cart.";
    case "INSUFFICIENT_STOCK":
      return "One of the items in your cart no longer has enough stock. Please adjust the quantity.";
    default:
      return err.message || "Something went wrong. Please try again.";
  }
}
