import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { router } from "../app/router";
import type { ProductResponse } from "../features/products/types/product";
import type { OrderResponse } from "../features/orders/types/order";

const product: ProductResponse = {
  id: 1,
  sku: "IPHONE-15-128",
  name: "iPhone 15",
  description: "Smartphone, 128GB",
  price: 65000,
  stockQuantity: 12,
  status: "ACTIVE",
  categoryId: 1,
};

const createdOrder: OrderResponse = {
  id: 11,
  status: "NEW",
  customerName: "Test Customer",
  customerPhone: "+996700000000",
  totalPrice: 65000,
  items: [
    {
      productId: 1,
      productName: "iPhone 15",
      quantity: 1,
      unitPrice: 65000,
      totalPrice: 65000,
    },
  ],
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/products")) return jsonResponse([product]);
      if (url.endsWith("/api/products/1")) return jsonResponse(product);
      if (url.endsWith("/api/orders") && init?.method === "POST") {
        return jsonResponse(createdOrder, 201);
      }
      throw new Error(`Unexpected fetch in test: ${url}`);
    })
  );
});

describe("real click flow: Catalog -> open product -> Add to cart -> Cart -> Checkout", () => {
  it("cart survives the exact click path a user takes, using the real production router", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    // --- Catalog ---
    await screen.findByText("iPhone 15");
    const productLink = screen.getByText("iPhone 15").closest("a");
    expect(productLink).toBeTruthy();
    await user.click(productLink!);

    // --- Product page ---
    await screen.findByRole("heading", { name: "iPhone 15" });
    const addToCartButton = await screen.findByRole("button", { name: "Add to cart" });
    await user.click(addToCartButton);
    await screen.findByText("Added to cart.");

    // --- Navigate to Cart via the real Header link ---
    const cartNavLink = document.querySelector('a[href="/cart"]') as HTMLAnchorElement;
    expect(cartNavLink).toBeTruthy();
    await user.click(cartNavLink);

    await screen.findByRole("heading", { name: "Your cart" });
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();

    // --- Navigate to Checkout via the real Cart page link ---
    const checkoutLink = document.querySelector('a[href="/checkout"]') as HTMLAnchorElement;
    expect(checkoutLink).toBeTruthy();
    await user.click(checkoutLink);

    // This is exactly where the reported bug manifests, if it's real.
    await waitFor(() => {
      expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    });
    expect(await screen.findByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();

    // --- Fill and submit the real checkout form ---
    await user.type(screen.getByLabelText("Full name"), "Test Customer");
    await user.type(screen.getByLabelText("Phone number"), "+996700000000");
    await user.click(screen.getByRole("button", { name: "Place order" }));

    // Regression coverage for the reported bug: after a successful
    // POST /api/orders, the app must land on the order success page —
    // not bounce back to CartPage's "Your cart is empty" state.
    expect(
      await screen.findByRole("heading", { name: "Order placed" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    expect(screen.getByText("#11")).toBeInTheDocument();
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });
});
