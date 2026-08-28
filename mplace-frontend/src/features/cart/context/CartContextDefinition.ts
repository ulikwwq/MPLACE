import { createContext } from "react";
import type { CartItem } from "../types/cart";

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);
