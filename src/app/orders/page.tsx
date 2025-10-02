'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Truck, BadgeDollarSign, FileDown, Undo2, Loader2, CalendarCheck, DollarSign, PackageCheck, ArrowLeft, Search } from "lucide-react";

import { useAuthContext } from "../providers/AuthProvider";
import { fetchOrdersForUser } from "../../services/firebase/ordersQuery.service";

type OrderSummary = Awaited<ReturnType<typeof fetchOrdersForUser>>[number];

export default function OrdersPage() {
  const { firebaseUser } = useAuthContext();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchOrdersForUser(firebaseUser.uid);
        setOrders(result);
      } catch (err: any) {
        setError(err?.message ?? "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [firebaseUser]);

  const summary = useMemo(() => {
    const classified: Record<string, number> = {};
    orders.forEach((order) => {
      classified[order.status] = (classified[order.status] ?? 0) + 1;
    });
    return classified;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.status.toLowerCase().includes(query) ||
      order.paymentMethod.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query)) ||
      order.id.toLowerCase().includes(query) ||
      order.total.toString().includes(query)
    );
  }, [orders, searchQuery]);

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-emerald-50/60 py-16">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-emerald-100 bg-white py-16 text-center shadow-xl">
          <h1 className="text-3xl font-bold text-emerald-800">กรุณาเข้าสู่ระบบก่อน</h1>
          <p className="mt-4 text-slate-600">เพื่อดูประวัติคำสั่งซื้อของคุณ จำเป็นต้องเข้าสู่ระบบ</p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-white py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> กลับไปหน้าแรก
          </Link>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">รายการสั่งซื้อของฉัน</h1>
            <p className="mt-1 text-sm text-slate-600">ติดตามสถานะทุกคำสั่งซื้อ พร้อมดาวน์โหลดใบเสร็จ</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 px-5 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
          >
            เลือกซื้อสินค้าเพิ่ม <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { key: "pending", label: "รอจัดการ", color: "bg-amber-100 text-amber-700", icon: Package },
            { key: "awaiting_payment", label: "รอชำระ", color: "bg-rose-100 text-rose-700", icon: BadgeDollarSign },
            { key: "paid", label: "ชำระแล้ว", color: "bg-emerald-100 text-emerald-700", icon: DollarSign },
            { key: "processing", label: "กำลังแพ็ค", color: "bg-sky-100 text-sky-700", icon: PackageCheck },
            { key: "shipping", label: "กำลังส่ง", color: "bg-indigo-100 text-indigo-700", icon: Truck },
            { key: "completed", label: "สำเร็จ", color: "bg-lime-100 text-lime-700", icon: CalendarCheck },
          ].map(({ icon: Icon, ...info }) => (
            <div key={info.key} className={`rounded-3xl border border-emerald-100 p-4 text-center shadow-sm ${info.color}`}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.2em]">{info.label}</p>
              <p className="mt-2 text-3xl font-bold">{summary[info.key] ?? 0}</p>
            </div>
          ))}
        </div>

        {orders.length > 0 && (
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาออเดอร์ (สถานะ, วิธีการชำระเงิน, ชื่อสินค้า, ยอดเงิน...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-emerald-600">
              <Loader2 className="h-5 w-5 animate-spin" /> กำลังโหลดข้อมูล...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">ยังไม่มีคำสั่งซื้อ</div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <article key={order.id} className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">เลขคำสั่งซื้อ</p>
                      <p className="text-lg font-semibold text-emerald-800">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">ยอดสุทธิ</p>
                      <p className="text-lg font-semibold text-emerald-700">฿{order.total.toLocaleString("th-TH")}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">สถานะปัจจุบัน</p>
                      <p className="mt-1 capitalize">{order.status_th}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">ชำระผ่าน</p>
                      <p className="mt-1">{order.paymentMethod_th}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">อัปเดตล่าสุด</p>
                      <p className="mt-1">{order.updatedAt?.toLocaleString("th-TH") ?? "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                      onClick={() => window.open(`/api/orders/${order.id}/invoice`, "_blank")}
                    >
                      <FileDown className="h-4 w-4" /> ดาวน์โหลดใบเสร็จ PDF
                    </button>
                    <button
                      type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                    >
                    <Undo2 className="h-4 w-4" /> ขอคืนสินค้า / ขอเงินคืน
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

