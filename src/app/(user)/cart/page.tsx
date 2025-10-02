'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBasket, ArrowLeft } from "lucide-react";

import { useCartStore } from "../../../store/cartStore";

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = itemCount > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-emerald-50/60 py-16">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-emerald-100 bg-white p-10 shadow-xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> กลับไปหน้าแรก
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-emerald-800">ตะกร้าสินค้า</h1>
        <p className="mt-2 text-slate-600">จัดการรายการสินค้าของคุณก่อนขั้นตอนชำระเงิน</p>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 py-16 text-center">
            <p className="text-lg font-medium text-emerald-700">ยังไม่มีสินค้าในตะกร้า</p>
            <p className="mt-2 text-sm text-slate-500">ลองเลือกชมสินค้าในหน้าหลัก แล้วเพิ่มลงตะกร้าได้เลย</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
            >
              ไปเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    {item.image ? (
                      <div className="h-24 w-24 overflow-hidden rounded-2xl bg-emerald-50">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={96}
                          height={96}
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                        <ShoppingBasket className="h-10 w-10" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-emerald-800">{item.name}</h2>
                        <p className="text-sm text-slate-500">จำนวนคงเหลือ {item.stock} ต้น</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                          ฿{item.price.toLocaleString("th-TH")}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-base font-semibold text-emerald-700">{item.quantity}</span>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      ราคารวมสินค้า: ฿{(item.price * item.quantity).toLocaleString("th-TH")}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-rose-500 transition hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" /> ลบสินค้าออก
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-emerald-800">สรุปรายการ</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>จำนวนสินค้า</span>
                  <span>{totalQuantity} ชิ้น</span>
                </div>
                <div className="flex justify-between">
                  <span>จำนวนรายการ</span>
                  <span>{items.length} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span>ยอดสุทธิ</span>
                  <span>฿{subtotal.toLocaleString("th-TH")}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง (เหมาจ่าย)</span>
                  <span>฿{deliveryFee.toLocaleString("th-TH")}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-3 text-base font-semibold text-emerald-700">
                  <span>ยอดชำระทั้งหมด</span>
                  <span>฿{total.toLocaleString("th-TH")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-6 w-full rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
              >
                ซื้อทันที
              </button>
              <Link
                href="/"
                className="mt-3 block text-center text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
              >
                เลือกซื้อสินค้าเพิ่ม
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

