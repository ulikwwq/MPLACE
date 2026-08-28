import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../types/cart";
import { CartContext, type CartContextValue } from "./CartContextDefinition";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === item.productId);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, existing.availableStock);
        return current.map((i) =>
          i.productId === item.productId ? { ...i, quantity: nextQuantity } : i
        );
      }
      const initialQuantity = Math.min(quantity, item.availableStock);
      if (initialQuantity < 1) return current;
      return [...current, { ...item, quantity: initialQuantity }];
    });
  }, []);

  const increaseQuantity = useCallback((productId: number) => {
    setItems((current) =>
      current.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(i.quantity + 1, i.availableStock) }
          : i
      )
    );
  }, []);

  const decreaseQuantity = useCallback((productId: number) => {
    setItems((current) =>
      current
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, itemCount, cartTotal, addItem, increaseQuantity, decreaseQuantity, removeItem, clearCart }),
    [items, itemCount, cartTotal, addItem, increaseQuantity, decreaseQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
