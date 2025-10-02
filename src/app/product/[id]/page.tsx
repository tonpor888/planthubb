'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Store, 
  Package, 
  ShoppingCart, 
  Star,
  MapPin,
  Shield,
  Heart,
  Share2,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { ref, get } from "firebase/database";
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
  category?: string;
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const addToCart = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product from Realtime Database
        const productRef = ref(realtimeDb, `products/${productId}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          const productData = { id: productId, ...snapshot.val() } as Product;
          setProduct(productData);
          
          // Fetch seller info if sellerId exists
          if (productData.sellerId) {
            const sellerDoc = await getDoc(doc(firestore, "users", productData.sellerId));
            if (sellerDoc.exists()) {
              setSeller(sellerDoc.data() as SellerProfile);
            }
          }
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.imageUrl,
          sellerId: product.sellerId ?? "",
        },
        quantity,
      );
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (product && quantity > 0) {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.imageUrl,
          sellerId: product.sellerId ?? "",
        },
        quantity,
      );
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ไม่พบสินค้า</h1>
          <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline">
            กลับไปหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> กลับสู่หน้าแรก
        </Link>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Product Image - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 shadow-sm">
                {product.imageUrl && !imageError ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    unoptimized={true}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Package className="mx-auto h-20 w-20 text-slate-300" />
                      <p className="mt-3 text-sm text-slate-500">ไม่มีรูปภาพ</p>
                    </div>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                    <span className="rounded-full bg-rose-500 px-6 py-3 text-base font-bold text-white shadow-xl">
                      สินค้าหมดชั่วคราว
                    </span>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" /> บันทึก
                </button>
                <button className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" /> แชร์
                </button>
              </div>
            </div>
          </div>

          {/* Product Info - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Product Title & Price */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-5xl font-bold text-emerald-600">
                  ฿{product.price.toLocaleString("th-TH")}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                  <span className="font-medium text-slate-600">245 รีวิว</span>
                  <span className="hidden sm:inline h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                  <span className="text-slate-500">จัดส่งรวดเร็ว ภายใน 2-3 วัน</span>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">สถานะสินค้า</span>
                {product.stock > 0 ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    มีสินค้า {product.stock} ต้น
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                    สินค้าหมด
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">รายละเอียดสินค้า</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || "ไม่มีรายละเอียดเพิ่มเติม"}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                <label className="block text-sm font-semibold text-slate-900">เลือกจำนวน</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-semibold transition hover:border-emerald-400 hover:text-emerald-600"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-24 rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-center text-base font-semibold text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-semibold transition hover:border-emerald-400 hover:text-emerald-600"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">สูงสุด {product.stock} ต้น</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 rounded-2xl border-2 border-emerald-600 bg-white px-6 py-4 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                เพิ่มลงตะกร้า
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                ซื้อเลย
              </button>
            </div>

            {/* Seller Info Card */}
            {seller && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white">
                      <Store className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {seller.shopName || `${seller.firstName} ${seller.lastName}`}
                      </h3>
                      {seller.shopDescription && (
                        <p className="mt-1 text-sm text-slate-600">{seller.shopDescription}</p>
                      )}
                      {seller.shopLocation && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {seller.shopLocation}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">ผู้ขายที่ผ่านการตรวจสอบ</span>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    แชท
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-emerald-100 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">98%</p>
                    <p className="text-xs text-slate-500">คะแนนบวก</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">1.2k</p>
                    <p className="text-xs text-slate-500">สินค้า</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500">คะแนนร้าน</p>
                  </div>
                </div>

                <Link
                  href={`/shop/${product.sellerId}`}
                  className="mt-4 block w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  เข้าชมร้านค้า
                </Link>
              </div>
            )}

            {/* Delivery & Return Info */}
            <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">การจัดส่งและรับประกัน</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">จัดส่งฟรี</p>
                    <p className="text-slate-500">สำหรับคำสั่งซื้อมากกว่า ฿500</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">รับประกันต้นไม้</p>
                    <p className="text-slate-500">คืนเงิน 100% หากต้นไม้มีปัญหา ภายใน 7 วัน</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
