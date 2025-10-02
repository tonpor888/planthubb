'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export function FloatingCart() {
  const itemCount = useCartStore((state) => state.itemCount);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <Link
      href="/cart"
      className={`fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white shadow-2xl shadow-emerald-500/40 transition hover:scale-110 hover:shadow-emerald-500/60 ${isBouncing ? "animate-[pulse_0.4s_ease-out]" : ""} relative`}
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="h-7 w-7" />
      <span className="sr-only" aria-live="polite">
        {itemCount} รายการในตะกร้า
      </span>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white shadow-lg">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
