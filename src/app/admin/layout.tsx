'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useAuthContext } from "../providers/AuthProvider";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  Settings,
  FileText,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { profile, firebaseUser, initializing } = useAuthContext();
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
      { href: "/admin/users", label: "จัดการผู้ใช้", icon: Users },
      { href: "/admin/products", label: "จัดการสินค้า", icon: Package },
      { href: "/admin/orders", label: "จัดการออเดอร์", icon: ShoppingCart },
      { href: "/admin/top-products", label: "สินค้าขายดี", icon: TrendingUp },
      { href: "/admin/pending-orders", label: "ออเดอร์รอดำเนินการ", icon: Clock },
      { href: "/admin/settings", label: "การตั้งค่าระบบ", icon: Settings },
      { href: "/admin/logs", label: "บันทึกระบบ", icon: FileText },
    ],
    []
  );

  const isPathActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initializing) return;

    if (!firebaseUser) {
      router.replace("/admin/login");
      return;
    }

    if (!profile || profile.role !== "admin") {
      router.replace("/");
    }
  }, [firebaseUser, profile, initializing, router]);

  useEffect(() => {
    if (!isMounted) return;

    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen, isMounted]);

  // แสดง loading ขณะตรวจสอบ
  if (initializing || !firebaseUser || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  const navigation = (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">PH</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">PlantHub</h2>
            <p className="text-xs text-emerald-600 font-medium">Admin Panel</p>
          </div>
        </div>
        <Link
          href="/"
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          title="กลับไปหน้าหลัก"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isPathActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsNavOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition shadow-sm ${
                active
                  ? "bg-emerald-100 text-emerald-700 shadow-inner"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${
                  active ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <aside
        className="hidden lg:flex lg:flex-col fixed left-0 top-[114px] w-64 bg-white shadow-xl border-r border-emerald-100 overflow-y-auto"
        style={{ height: "calc(100vh - 114px)" }}
      >
        <div className="p-6">
          {navigation}
        </div>
      </aside>
      <main className="px-6 pb-12 pt-[30px] lg:ml-64 lg:px-8 lg:pt-[68px]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h1 className="text-lg font-semibold text-slate-800">แผงควบคุมผู้ดูแล</h1>
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-600 shadow-sm transition hover:bg-emerald-50"
            >
              <span>เมนูผู้ดูแล</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </main>
      {isMounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-[1400] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                isNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsNavOpen(false)}
            />
            <div
              className={`fixed inset-y-0 right-0 z-[1500] w-[70vw] max-w-xs md:max-w-sm bg-white shadow-2xl border-l border-emerald-100 transition-transform duration-500 ease-out lg:hidden ${
                isNavOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="h-full overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-700">เมนูผู้ดูแลระบบ</span>
                  <button
                    type="button"
                    onClick={() => setIsNavOpen(false)}
                    className="rounded-full bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {navigation}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
