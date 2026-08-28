import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { ProductCard } from "../features/products/components/ProductCard";
import { CartItemRow } from "../features/cart/components/CartItemRow";
import { CartProvider } from "../features/cart/context/CartContext";
import type { ProductResponse } from "../features/products/types/product";
import type { CartItem } from "../features/cart/types/cart";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <CartProvider>{ui}</CartProvider>
    </MemoryRouter>
  );
}

function makeProduct(overrides: Partial<ProductResponse>): ProductResponse {
  return {
    id: 1,
    sku: "SKU-1",
    name: "Test Product",
    description: "desc",
    price: 100,
    stockQuantity: 10,
    status: "ACTIVE",
    categoryId: 1,
    ...overrides,
  };
}

describe("ProductCard: Add to cart button state", () => {
  it("is enabled for an ACTIVE product with stock", () => {
    renderWithProviders(<ProductCard product={makeProduct({})} />);
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });

  it("is disabled and reads 'Unavailable' for an INACTIVE product", () => {
    renderWithProviders(<ProductCard product={makeProduct({ status: "INACTIVE" })} />);
    const button = screen.getByRole("button", { name: "Unavailable" });
    expect(button).toBeDisabled();
  });

  it("is disabled for an ACTIVE product with stockQuantity = 0", () => {
    renderWithProviders(<ProductCard product={makeProduct({ stockQuantity: 0 })} />);
    const button = screen.getByRole("button", { name: "Unavailable" });
    expect(button).toBeDisabled();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });
});

describe("CartItemRow: quantity never exceeds stock or drops below 1", () => {
  function Wrapper({ item }: { item: CartItem }) {
    return <CartItemRow item={item} />;
  }

  it("disables the increase button once quantity reaches availableStock", async () => {
    const user = userEvent.setup();
    const item: CartItem = {
      productId: 1,
      productName: "Coffee Mug",
      unitPrice: 500,
      quantity: 3,
      availableStock: 3,
    };
    renderWithProviders(<Wrapper item={item} />);

    const increaseButton = screen.getByLabelText("Increase quantity of Coffee Mug");
    expect(increaseButton).toBeDisabled();
    expect(screen.getByText("Max available stock reached")).toBeInTheDocument();

    // clicking a disabled button should not change the displayed quantity
    await user.click(increaseButton);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not show the max-stock warning below the limit", () => {
    const item: CartItem = {
      productId: 1,
      productName: "Coffee Mug",
      unitPrice: 500,
      quantity: 1,
      availableStock: 5,
    };
    renderWithProviders(<Wrapper item={item} />);

    expect(screen.getByLabelText("Increase quantity of Coffee Mug")).toBeEnabled();
    expect(screen.queryByText("Max available stock reached")).not.toBeInTheDocument();
  });
});
