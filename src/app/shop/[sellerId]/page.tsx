'use client';

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store, MapPin, Star, Eye, Search } from "lucide-react";
import { ref, get, onValue } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";

import { realtimeDb, firestore } from "@/lib/firebaseClient";
import { useCartStore } from "@/store/cartStore";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  description: string;
  sellerId?: string;
  active?: boolean;
  views?: number;
  createdAt?: number;
};

type SellerProfile = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  shopName?: string;
  shopDescription?: string;
  shopLocation?: string;
};

export default function ShopPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  const addToCart = useCartStore((state) => state.addItem);

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "views">("newest");

  useEffect(() => {
    const fetchSellerAndProducts = async () => {
      try {
        setLoading(true);

        // Fetch seller info
        const sellerDoc = await getDoc(doc(firestore, "users", sellerId));
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data() as SellerProfile);
        }

        // Fetch all products
        const productsRef = ref(realtimeDb, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
          const allProducts = snapshot.val() ?? {};
          // Filter products by sellerId
          const sellerProducts: Record<string, Product> = {};
          Object.entries(allProducts).forEach(([id, product]: [string, any]) => {
            if (product.sellerId === sellerId && product.active !== false) {
              sellerProducts[id] = { ...product, id };
            }
          });
          setProducts(sellerProducts);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching shop data:", error);
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerAndProducts();
    }
  }, [sellerId]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let items = Object.entries(products).map(([id, product]) => ({ ...product, id }));

    if (normalized) {
      items = items.filter((product) => product.name.toLowerCase().includes(normalized));
    }

    // Sort products
    items.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "newest":
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });

    return items;
  }, [products, query, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.imageUrl,
      sellerId: product.sellerId ?? "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> กลับไปหน้าแรก
        </Link>

        {/* Shop Header */}
        {seller && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg mb-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 flex-shrink-0">
                <Store className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  {seller.shopName || `${seller.firstName} ${seller.lastName}`}
                </h1>
                {seller.shopDescription && (
                  <p className="mt-2 text-slate-600">{seller.shopDescription}</p>
                )}
                {seller.shopLocation && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {seller.shopLocation}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-900">4.9</span>
                    <span className="text-sm text-slate-500">(1.2k รีวิว)</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-900">{filteredProducts.length}</span>
                    <span className="text-slate-500"> สินค้า</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Sort */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex flex-1 items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาสินค้าในร้านนี้..."
                className="w-full rounded-full border border-emerald-100 bg-white pl-12 pr-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border border-emerald-100 bg-white px-6 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="price-low">ราคา: ต่ำ-สูง</option>
              <option value="price-high">ราคา: สูง-ต่ำ</option>
              <option value="views">ยอดนิยม</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
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
                    unoptimized={true}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <span className="text-slate-400">ไม่มีรูปภาพ</span>
                  </div>
                )}
                {/* View count badge */}
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow backdrop-blur-sm">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{product.views || 0}</span>
                </div>
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
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
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
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-16 text-center">
            <Store className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-medium text-slate-600">
              {query ? "ไม่พบสินค้าที่ตรงกับคำค้นหา" : "ร้านนี้ยังไม่มีสินค้า"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
