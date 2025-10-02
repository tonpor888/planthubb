'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export function FloatingCart() {
  const itemCount = useCartStore((state) => state.itemCount);
  const [isBouncing, setIsBouncing] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Only animate when items are ADDED (count increases) and count is > 0
    if (itemCount > prevCountRef.current && itemCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => {
        setIsBouncing(false);
      }, 600);
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    // Update prevCount without animation
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <Link
      href="/cart"
      className={`fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white shadow-2xl shadow-emerald-500/40 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/60 ${
        isBouncing ? "animate-bounce" : ""
      }`}
      aria-label="Shopping Cart"
    >
      <ShoppingCart className={`h-7 w-7 transition-transform ${isBouncing ? "scale-125" : "scale-100"}`} />
      <span className="sr-only" aria-live="polite">
        {itemCount} รายการในตะกร้า
      </span>
      {itemCount > 0 && (
        <span 
          className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white shadow-lg transition-all duration-300 ${
            isBouncing ? "animate-[bounce_0.6s_ease-in-out] scale-125" : "scale-100"
          }`}
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}
