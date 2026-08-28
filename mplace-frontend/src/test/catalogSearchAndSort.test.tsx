import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CatalogPage } from "../pages/CatalogPage";
import { CartProvider } from "../features/cart/context/CartContext";
import type { ProductResponse } from "../features/products/types/product";

const products: ProductResponse[] = [
  { id: 1, sku: "MUG-001", name: "Coffee Mug", description: "Ceramic", price: 450, stockQuantity: 100, status: "ACTIVE", categoryId: 2 },
  { id: 2, sku: "IPHONE-15-128", name: "iPhone 15", description: "Smartphone", price: 65000, stockQuantity: 12, status: "ACTIVE", categoryId: 1 },
  { id: 3, sku: "BAG-001", name: "Leather Bag", description: "Genuine leather", price: 3200, stockQuantity: 15, status: "ACTIVE", categoryId: 3 },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, status: 200, text: async () => JSON.stringify(products) } as Response))
  );
});

function renderCatalog() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CatalogPage />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("CatalogPage: search and sort (Phase 7)", () => {
  it("search narrows the visible product grid by name/sku/description", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByText("Coffee Mug");
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText("Leather Bag")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search products"), "mug");

    expect(screen.getByText("Coffee Mug")).toBeInTheDocument();
    expect(screen.queryByText("iPhone 15")).not.toBeInTheDocument();
    expect(screen.queryByText("Leather Bag")).not.toBeInTheDocument();
  });

  it("shows a 'no products match' state with a clear-filters action for an unmatched search", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByText("Coffee Mug");
    await user.type(screen.getByLabelText("Search products"), "nonexistent product xyz");

    expect(await screen.findByText("No products match")).toBeInTheDocument();
    const clearButton = screen.getByRole("button", { name: "Clear filters" });
    await user.click(clearButton);

    expect(await screen.findByText("Coffee Mug")).toBeInTheDocument();
  });

  it("sorting by price low-to-high reorders the grid", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByText("Coffee Mug");
    await user.selectOptions(screen.getByLabelText("Sort products"), "price-asc");

    const names = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(names).toEqual(["Coffee Mug", "Leather Bag", "iPhone 15"]);
  });
});
