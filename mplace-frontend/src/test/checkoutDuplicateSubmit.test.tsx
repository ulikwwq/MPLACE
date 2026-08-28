import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CartPage } from "../pages/CartPage";
import { CartProvider } from "../features/cart/context/CartContext";
import { useCart } from "../features/cart/hooks/useCart";
import { useEffect, useState } from "react";
import type { OrderResponse } from "../features/orders/types/order";

const orderResponse: OrderResponse = {
  id: 42,
  status: "NEW",
  customerName: "Test Customer",
  customerPhone: "+996700000000",
  totalPrice: 3000,
  items: [
    { productId: 1, productName: "Coffee Mug", quantity: 1, unitPrice: 3000, totalPrice: 3000 },
  ],
};

function SeedCart() {
  const { addItem } = useCart();
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    addItem({ productId: 1, productName: "Coffee Mug", unitPrice: 3000, availableStock: 50 }, 1);
    setSeeded(true);
  }, [addItem]);
  if (!seeded) return null;
  return <Navigate to="/checkout" replace />;
}

describe("CheckoutPage: duplicate submission prevention", () => {
  let postCallCount: number;

  beforeEach(() => {
    postCallCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/api/orders") && init?.method === "POST") {
          postCallCount += 1;
          // simulate real network latency so a second click has a window to
          // land before the first request resolves
          await new Promise((resolve) => setTimeout(resolve, 50));
          return { ok: true, status: 201, text: async () => JSON.stringify(orderResponse) } as Response;
        }
        throw new Error(`Unexpected fetch: ${url}`);
      })
    );
  });

  it("sends exactly one POST /api/orders even when Place order is clicked twice rapidly", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/seed"]}>
        <CartProvider>
          <Routes>
            <Route path="/seed" element={<SeedCart />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id/success" element={<div>Order placed</div>} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );

    await user.type(await screen.findByLabelText("Full name"), "Test Customer");
    await user.type(screen.getByLabelText("Phone number"), "+996700000000");

    const submitButton = screen.getByRole("button", { name: "Place order" });
    // fire two rapid clicks without waiting between them
    await user.click(submitButton);
    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Order placed")).toBeInTheDocument());

    expect(postCallCount).toBe(1);
  });
});
