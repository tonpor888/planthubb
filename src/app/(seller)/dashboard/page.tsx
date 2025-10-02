'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

import { useAuthContext } from "../../providers/AuthProvider";
import { useSellerOrders } from "../../hooks/useSellerOrders";

export default function SellerDashboardPage() {
  const { profile } = useAuthContext();
  const { orders, loading, error } = useSellerOrders(profile?.uid ?? "");
  const [period] = useState<"all" | "month">("all");

  const metrics = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pending: 0,
        completed: 0,
        grossProfit: 0,
      };
    }

    return orders.reduce(
      (acc, order) => {
        const revenue = order.total ?? 0;
        acc.totalRevenue += revenue;
        acc.totalOrders += 1;

        if (order.status === "completed") acc.completed += 1;
        if (order.status === "pending" || order.status === "awaiting_payment") acc.pending += 1;

        const cost = (order.items || []).reduce((sum, item) => sum + (item.costPrice ?? 0) * (item.quantity ?? 0), 0);
        acc.grossProfit += revenue - cost;
        return acc;
      },
      { totalRevenue: 0, totalOrders: 0, pending: 0, completed: 0, grossProfit: 0 },
    );
  }, [orders]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50">
        <p className="text-slate-600">กรุณาเข้าสู่ระบบเพื่อดูแดชบอร์ด</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/60 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">แดชบอร์ดร้านค้า</h1>
            <p className="mt-2 text-sm text-slate-600">ดูภาพรวมยอดขายและคำสั่งซื้อของคุณ</p>
          </div>
          <Link
            href="/seller/coupons"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-5 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-100"
          >
            จัดการคูปอง
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="ยอดขายสะสม" value={`฿${metrics.totalRevenue.toLocaleString("th-TH")}`}></MetricCard>
          <MetricCard title="จำนวนคำสั่งซื้อ" value={`${metrics.totalOrders}`}>
            <span className="text-xs text-slate-500">ช่วงเวลา: {period === "month" ? "เดือนนี้" : "ทั้งหมด"}</span>
          </MetricCard>
          <MetricCard title="ออเดอร์รอดำเนินการ" value={`${metrics.pending}`} />
          <MetricCard title="กำไรขั้นต้น (ประมาณ)" value={`฿${metrics.grossProfit.toLocaleString("th-TH")}`} />
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-emerald-800">คำสั่งซื้อล่าสุด</h2>
            <Link href="/seller/orders" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              ดูทั้งหมด
            </Link>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center text-emerald-600">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="flex h-36 items-center justify-center text-slate-500">ยังไม่มีคำสั่งซื้อ</div>
          ) : (
            <div className="mt-5 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <article key={order.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-lg font-semibold text-emerald-800">฿{order.total.toLocaleString("th-TH")}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>สถานะ: <span className="font-medium text-emerald-700">{order.status_th}</span></p>
                      <p>อัปเดตล่าสุด: {order.updatedAt?.toLocaleString("th-TH") ?? "-"}</p>
                    </div>
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

function MetricCard({ title, value, children }: { title: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-emerald-700">{value}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}


