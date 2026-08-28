import { Outlet } from "react-router-dom";
import { CartProvider } from "../features/cart/context/CartContext";
import { Header } from "../shared/components/Header";

export function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-paper">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </CartProvider>
  );
}
