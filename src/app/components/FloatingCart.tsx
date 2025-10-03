'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBasket, ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export function FloatingCart() {
  const { items, itemCount, updateQuantity, removeItem } = useCartStore();
  const [isBouncing, setIsBouncing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPanelOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = itemCount > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsPanelOpen(true)}
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
      </button>

      {/* Backdrop with Blur */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 z-[70] h-full w-full md:w-[30%] min-w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-emerald-800">ตะกร้าสินค้า</h2>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-emerald-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBasket className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-700">ตะกร้าว่างเปล่า</p>
                <p className="mt-2 text-sm text-slate-500">เริ่มเลือกซื้อสินค้ากันเลย!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm transition hover:shadow-md">
                    <div className="flex gap-3">
                      {item.image ? (
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-emerald-50">
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={80}
                            height={80}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                          <ShoppingBasket className="h-8 w-8" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col gap-2">
                        <h3 className="text-sm font-semibold text-emerald-800 line-clamp-2">{item.name}</h3>
                        <p className="text-sm font-bold text-emerald-600">฿{item.price.toLocaleString("th-TH")}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-emerald-700">{item.quantity}</span>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Summary */}
          {items.length > 0 && (
            <div className="border-t border-emerald-100 bg-emerald-50/50 px-6 py-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ยอดรวม ({itemCount} รายการ)</span>
                  <span>฿{subtotal.toLocaleString("th-TH")}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ค่าจัดส่ง</span>
                  <span>฿{deliveryFee.toLocaleString("th-TH")}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-emerald-800 pt-2 border-t border-emerald-200">
                  <span>รวมทั้งหมด</span>
                  <span>฿{total.toLocaleString("th-TH")}</span>
                </div>
              </div>
              
              <Link
                href="/cart"
                onClick={() => setIsPanelOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-105"
              >
                ดำเนินการชำระเงิน
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
