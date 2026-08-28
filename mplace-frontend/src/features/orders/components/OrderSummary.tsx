import type { OrderResponse } from "../types/order";
import { formatPrice } from "../../../shared/lib/formatPrice";

export function OrderSummary({ order }: { order: OrderResponse }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-sm text-ink-muted">Order number</p>
          <p className="text-lg font-semibold text-ink">#{order.id}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
          {order.status}
        </span>
      </div>

      <div className="border-b border-line py-4">
        <p className="text-sm text-ink-muted">Customer</p>
        <p className="text-ink">{order.customerName}</p>
        <p className="text-sm text-ink-muted">{order.customerPhone}</p>
      </div>

      <div className="divide-y divide-line py-2">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between py-3">
            <div>
              <p className="text-ink">{item.productName}</p>
              <p className="text-sm text-ink-muted">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </p>
            </div>
            <p className="font-medium text-ink">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <p className="font-medium text-ink">Total</p>
        <p className="text-xl font-semibold text-ink">{formatPrice(order.totalPrice)}</p>
      </div>
    </div>
  );
}
