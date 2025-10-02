'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Search, 
  ArrowLeft,
  Package,
  Star,
  Eye,
  ShoppingCart
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { ref, onValue } from "firebase/database";
import { collection, onSnapshot } from "firebase/firestore";
import { realtimeDb, firestore } from "@/lib/firebaseClient";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  sellerId: string;
  active: boolean;
  createdAt: number;
};

type ProductSales = {
  product: Product;
  totalSold: number;
  totalRevenue: number;
  orderCount: number;
};

export default function TopProductsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchTopProducts = async () => {
      try {
        // ดึงข้อมูลสินค้า
        const productsRef = ref(realtimeDb, "products");
        const productsSnapshot = await new Promise((resolve) => {
          onValue(productsRef, (snapshot) => {
            resolve(snapshot.val() || {});
          }, { onlyOnce: true });
        });

        const products = productsSnapshot as Record<string, Product>;

        // ดึงข้อมูลออเดอร์
        const ordersRef = collection(firestore, "orders");
        const ordersSnapshot = await new Promise((resolve) => {
          onSnapshot(ordersRef, (snapshot) => {
            const orders = snapshot.docs.map(doc => doc.data());
            resolve(orders);
          }, { onlyOnce: true });
        });

        const orders = ordersSnapshot as any[];

        // คำนวณยอดขายของแต่ละสินค้า
        const productSales: Record<string, ProductSales> = {};

        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const productId = item.productId;
              if (products[productId]) {
                if (!productSales[productId]) {
                  productSales[productId] = {
                    product: products[productId],
                    totalSold: 0,
                    totalRevenue: 0,
                    orderCount: 0,
                  };
                }
                productSales[productId].totalSold += item.quantity;
                productSales[productId].totalRevenue += item.price * item.quantity;
                productSales[productId].orderCount += 1;
              }
            });
          }
        });

        // เรียงตามยอดขายและเอา Top 10
        const sortedProducts = Object.values(productSales)
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 10);

        setTopProducts(sortedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [profile, router]);

  const filteredProducts = topProducts.filter(item =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </button>
              <h1 className="text-xl font-semibold text-slate-800">สินค้าขายดี</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Top Products List */}
        <div className="space-y-4">
          {filteredProducts.map((item, index) => (
            <div key={item.product.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {item.product.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>ราคา: ฿{item.product.price.toLocaleString()}</span>
                    <span>สต็อก: {item.product.stock} ชิ้น</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.product.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.product.active ? 'เปิดขาย' : 'ปิดขาย'}
                    </span>
                  </div>
                </div>

                {/* Sales Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-emerald-600" />
                      <span className="text-lg font-bold text-emerald-600">
                        {item.totalSold} ชิ้น
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      ยอดขาย: ฿{item.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">
                      ออเดอร์: {item.orderCount} ครั้ง
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">สินค้าที่มียอดขาย</p>
                <p className="text-2xl font-bold text-slate-900">{topProducts.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-slate-900">
                  ฿{topProducts.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">จำนวนขายรวม</p>
                <p className="text-2xl font-bold text-slate-900">
                  {topProducts.reduce((sum, item) => sum + item.totalSold, 0)} ชิ้น
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
