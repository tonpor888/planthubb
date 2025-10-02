'use client';

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { onValue, ref } from "firebase/database";

import { useCartStore } from "../store/cartStore";
import { realtimeDb } from "@/lib/firebaseClient";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  description: string;
  sellerId?: string;
  active?: boolean;
};

export default function Home() {
  const addToCart = useCartStore((state) => state.addItem);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const productsRef = ref(realtimeDb, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const value = snapshot.val() ?? {};
      setProducts(value);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [profile]);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const filteredProducts = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    const items = Object.entries(products)
      .map(([id, product]) => ({ ...product, id }))
      .filter((product) => product.active !== false);

    if (!normalized) {
      return items;
    }

    return items.filter((product) => product.name.toLowerCase().includes(normalized));
  }, [products, debouncedQuery]);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.imageUrl,
      sellerId: product.sellerId ?? "",
    });
  }, [addToCart]);

  return (
    <>
    <section id="featured" className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                สินค้าแนะนำสำหรับคุณ
              </h2>
              <p className="mt-2 max-w-2xl text-lg text-slate-600">
                สำรวจพันธุ์ไม้ยอดนิยมที่ได้รับความนิยมสูงสุดจากคอมมูนิตี้ของเรา
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            <label className="relative flex w-full items-center">
              <span className="absolute left-4 text-sm text-slate-400">🔍</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาต้นไม้ ดอกไม้ หรือชื่อร้าน..."
                className="w-full rounded-full border border-emerald-100 bg-white px-12 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                // Skeleton loading cards
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm"
                  >
                    <div className="relative h-60 overflow-hidden bg-slate-200 animate-pulse" />
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div>
                        <div className="h-6 bg-slate-200 rounded animate-pulse mb-2" />
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="h-6 bg-slate-200 rounded animate-pulse w-20" />
                        <div className="h-8 bg-slate-200 rounded-full animate-pulse w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  <div className="relative h-60 overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={400}
                        height={240}
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={true}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <span className="text-slate-400">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                    {product.stock === 0 ? (
                      <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                        สินค้าหมดชั่วคราว
                      </span>
                    ) : (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
                        คงเหลือ {product.stock} ต้น
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-xl font-bold text-emerald-600">
                        ฿{product.price.toLocaleString("th-TH")}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500 z-10"
                        disabled={product.stock === 0}
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-16 text-center">
                <p className="text-lg font-medium text-slate-600">
                  ไม่พบสินค้าที่ตรงกับคำค้นหานี้ ลองใช้คำอื่นดูนะคะ 🌱
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="benefits" className="bg-white py-16">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">ระบบจัดส่งคุณภาพ</h3>
              <p className="mt-3 text-sm text-slate-600">
                บรรจุอย่างพิถีพิถันพร้อมอุปกรณ์ป้องกัน ผ่่านการรับรองจากผู้เชี่ยวชาญ เพื่อให้ต้นไม้ถึงมืออย่างสมบูรณ์แบบ
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">คอมมูนิตี้คนรักต้นไม้</h3>
              <p className="mt-3 text-sm text-slate-600">
                แชร์ประสบการณ์การปลูก ดูแล และแต่งบ้านกับผู้ใช้กว่า 50,000 คน พร้อมกิจกรรมออนไลน์ทุกเดือน
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">แดชบอร์ดสำหรับผู้ขาย</h3>
              <p className="mt-3 text-sm text-slate-600">
                บริหารจัดการสต็อก คำสั่งซื้อ และโปรโมชั่นได้ในที่เดียว พร้อมเครื่องมือการตลาดครบวงจร
              </p>
            </div>
          </div>
        </section>

        <section id="community" className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 py-20 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">PlantHub Community</p>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              ร่วมสร้างโลกที่เต็มไปด้วยพื้นที่สีเขียวไปกับเรา
            </h2>
            <p className="max-w-2xl text-lg text-white/90">
              เพียงสมัครสมาชิกวันนี้ รับทันทีคูปองส่วนลดสำหรับคำสั่งซื้อครั้งแรก พร้อมเข้าถึงเวิร์กช็อปออนไลน์และคำแนะนำจากผู้เชี่ยวชาญ
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/15"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </section>
      </>
  );
}
