import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { router } from "../app/router";
import type { ProductResponse } from "../features/products/types/product";
import type { OrderResponse } from "../features/orders/types/order";

const product: ProductResponse = {
  id: 1,
  sku: "MUG-001",
  name: "Coffee Mug",
  description: "Ceramic mug",
  price: 3000,
  stockQuantity: 50,
  status: "ACTIVE",
  categoryId: 2,
};

const orderResponse: OrderResponse = {
  id: 11,
  status: "NEW",
  customerName: "Test Customer",
  customerPhone: "+996700000000",
  totalPrice: 3000,
  items: [
    { productId: 1, productName: "Coffee Mug", quantity: 1, unitPrice: 3000, totalPrice: 3000 },
  ],
};

function jsonResponse(status: number, body: unknown): Response {
  return { ok: status < 400, status, text: async () => JSON.stringify(body) } as Response;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/products") && (!init || init.method === undefined || init.method === "GET")) {
        return jsonResponse(200, [product]);
      }
      if (url.endsWith("/api/products/1")) return jsonResponse(200, product);
      if (url.endsWith("/api/orders") && init?.method === "POST") {
        return jsonResponse(201, orderResponse);
      }
      throw new Error(`Unexpected fetch in test: ${url} (${init?.method ?? "GET"})`);
    })
  );
});

describe("full real click flow through checkout submission (production router)", () => {
  it("Catalog -> Product -> Add to cart -> Cart -> Checkout -> submit -> success page", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    // --- Catalog ---
    await screen.findByText("Coffee Mug");
    const productLink = screen.getByText("Coffee Mug").closest("a");
    await user.click(productLink!);

    // --- Product page ---
    await screen.findByRole("heading", { name: "Coffee Mug" });
    await user.click(await screen.findByRole("button", { name: "Add to cart" }));
    await screen.findByText("Added to cart.");

    // --- Cart, via the real Header link ---
    await user.click(document.querySelector('a[href="/cart"]') as HTMLAnchorElement);
    await screen.findByRole("heading", { name: "Your cart" });

    // --- Checkout, via the real Cart page link ---
    await user.click(document.querySelector('a[href="/checkout"]') as HTMLAnchorElement);
    await screen.findByRole("heading", { name: "Checkout" });

    // --- fill and submit ---
    await user.type(screen.getByLabelText("Full name"), "Test Customer");
    await user.type(screen.getByLabelText("Phone number"), "+996700000000");
    await user.click(screen.getByRole("button", { name: "Place order" }));

    // --- where do we actually land? ---
    await waitFor(() => {
      if (screen.queryByText("Your cart is empty")) {
        throw new Error(
          "BUG REPRODUCED: landed on the empty-cart page after a successful order submission"
        );
      }
      expect(screen.queryByText("Order placed")).toBeInTheDocument();
    });

    expect(screen.getByText("#11")).toBeInTheDocument();
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });
});
