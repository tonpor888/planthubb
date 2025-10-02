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
  Truck,
  BadgeCheck
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
        
        const productRef = ref(realtimeDb, `products/${productId}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          const productData = { id: productId, ...snapshot.val() } as Product;
          setProduct(productData);
          
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
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.imageUrl,
          sellerId: product.sellerId ?? "",
        });
      }
      router.push("/cart");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ไม่พบสินค้า</h1>
          <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline font-medium">
            กลับสู่หน้าแรก
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
            <div className="border-b border-slate-100 pb-6">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-6">
                <span className="text-5xl font-bold text-emerald-600">
                  ฿{product.price.toLocaleString("th-TH")}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">4.8</span>
                  </div>
                  <span className="text-sm text-slate-500">(245 รีวิว)</span>
                </div>
              </div>
            </div>

            {/* Stock Badge */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 border border-emerald-100">
              <Package className="h-5 w-5 text-emerald-600" />
              {product.stock > 0 ? (
                <span className="text-sm font-semibold text-emerald-700">
                  พร้อมส่ง {product.stock} ต้น
                </span>
              ) : (
                <span className="text-sm font-semibold text-rose-700">
                  สินค้าหมด
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">รายละเอียดสินค้า</h2>
              <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || "ไม่มีรายละเอียดเพิ่มเติม"}
              </p>
            </div>

            {/* Quantity Selector & Actions */}
            {product.stock > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">เลือกจำนวน</label>
                  <div className="flex items-center gap-4">
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 rounded-xl border-2 border-emerald-600 bg-white px-6 py-4 text-base font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    เพิ่มลงตะกร้า
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:brightness-105 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    ซื้อเลย
                  </button>
                </div>
              </div>
            )}

            {/* Seller Info Card */}
            {seller && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white flex-shrink-0">
                      <Store className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {seller.shopName || `${seller.firstName} ${seller.lastName}`}
                      </h3>
                      {seller.shopDescription && (
                        <p className="text-sm text-slate-600 mb-2">{seller.shopDescription}</p>
                      )}
                      {seller.shopLocation && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                          <MapPin className="h-4 w-4" />
                          {seller.shopLocation}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">ผู้ขายที่ผ่านการตรวจสอบ</span>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition flex items-center gap-2 flex-shrink-0">
                    <MessageCircle className="h-4 w-4" />
                    แชท
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-5 mb-5">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-1">98%</p>
                    <p className="text-xs text-slate-500 font-medium">คะแนนบวก</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-1">1.2k</p>
                    <p className="text-xs text-slate-500 font-medium">สินค้า</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-1">4.9</p>
                    <p className="text-xs text-slate-500 font-medium">คะแนนร้าน</p>
                  </div>
                </div>

                <Link
                  href={`/shop/${product.sellerId}`}
                  className="block w-full rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-900 transition"
                >
                  เข้าชมร้านค้า
                </Link>
              </div>
            )}

            {/* Delivery & Guarantee Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">การจัดส่งและรับประกัน</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                    <Truck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">จัดส่งฟรี</p>
                    <p className="text-sm text-slate-600">สำหรับคำสั่งซื้อมากกว่า ฿500</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">รับประกันต้นไม้</p>
                    <p className="text-sm text-slate-600">คืนเงิน 100% หากต้นไม้มีปัญหา ภายใน 7 วัน</p>
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
