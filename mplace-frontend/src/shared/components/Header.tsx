import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-ink">
          MPlace
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link to="/" className="hover:text-brand">
            Catalog
          </Link>
          <Link to="/cart" className="flex items-center gap-1.5 hover:text-brand">
            Cart
            {itemCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
