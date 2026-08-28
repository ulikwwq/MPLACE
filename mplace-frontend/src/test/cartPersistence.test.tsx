import { useEffect } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { App } from "../app/App";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { useCart } from "../features/cart/hooks/useCart";
import { formatPrice } from "../shared/lib/formatPrice";

/** Stands in for "user clicked Add to cart on a product" without hitting the API. */
function SeedCartPage() {
  const { addItem } = useCart();
  useEffect(() => {
    addItem(
      { productId: 1, productName: "iPhone 15", unitPrice: 65000, availableStock: 12 },
      2
    );
  }, [addItem]);
  return <div data-testid="seed-page">seeded</div>;
}

function buildTestRouter(initialPath: string) {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <App />,
        children: [
          { path: "seed", element: <SeedCartPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  );
}

describe("cart persists across client-side navigation (App -> CartProvider -> Outlet)", () => {
  it("keeps items when navigating /seed -> /cart -> /checkout", async () => {
    const router = buildTestRouter("/seed");
    render(<RouterProvider router={router} />);

    // cart was seeded with 2 units
    await waitFor(() => expect(screen.getByTestId("seed-page")).toBeInTheDocument());

    // navigate to /cart the same way <Link to="/cart"> would (client-side)
    await act(async () => {
      await router.navigate("/cart");
    });
    expect(await screen.findByRole("heading", { name: "Your cart" })).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();

    // navigate to /checkout the same way <Link to="/checkout"> would
    await act(async () => {
      await router.navigate("/checkout");
    });

    // BUG would manifest here: CheckoutPage redirecting to "Your cart is empty"
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    // itemized order summary (Phase 7) shows the product line and quantity
    expect(screen.getAllByText("iPhone 15").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, node) => (node?.textContent ?? "") === "2 × " + formatPrice(65000)).length
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });
});
