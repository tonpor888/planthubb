'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";

type Order = {
  id: string;
  total: number;
  createdAt: Date;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};

export default function SellerChartsPage() {
  const router = useRouter();
  const { profile, initializing } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initializing) return;

    if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
      router.push("/");
      return;
    }

    const ordersRef = collection(firestore, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as Order[];
      
      // กรองเฉพาะออเดอร์ที่มีสินค้าของร้านนี้
      const sellerOrders = orderData.filter(order => 
        order.items.some(item => {
          // TODO: ตรวจสอบว่า item.productId เป็นของร้านนี้หรือไม่
          // ในที่นี้จะแสดงข้อมูลทั้งหมดก่อน
          return true;
        })
      );
      
      setOrders(sellerOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initializing, profile, router]);

  // คำนวณข้อมูลสำหรับกราฟ
  const getMonthlyData = () => {
    const monthlyData: Record<string, { sales: number; orders: number }> = {};
    
    orders.forEach(order => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, orders: 0 };
      }
      monthlyData[month].sales += order.total;
      monthlyData[month].orders += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // 6 เดือนล่าสุด
  };

  const getTopProducts = () => {
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            sold: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].sold += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  };

  const monthlyData = getMonthlyData();
  const topProducts = getTopProducts();

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
                onClick={() => router.push("/my-shop")}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </button>
              <h1 className="text-xl font-semibold text-slate-800">กราฟยอดขาย</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-slate-900">
                  ฿{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ออเดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ออเดอร์ที่เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ยอดขายเฉลี่ย</p>
                <p className="text-2xl font-bold text-slate-900">
                  ฿{orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toLocaleString() : 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">ยอดขายรายเดือน</h2>
            </div>
            
            <div className="space-y-4">
              {monthlyData.map(([month, data]) => (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-600">
                    {new Date(month + '-01').toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="h-4 bg-emerald-500 rounded"
                        style={{ 
                          width: `${Math.min(100, (data.sales / Math.max(...monthlyData.map(([, d]) => d.sales))) * 100)}%` 
                        }}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        ฿{data.sales.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {data.orders} ออเดอร์
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {monthlyData.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">ไม่มีข้อมูลยอดขาย</p>
              </div>
            )}
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">สินค้าขายดี 5 อันดับ</h2>
            </div>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="h-4 bg-blue-500 rounded"
                        style={{ 
                          width: `${Math.min(100, (product.sold / Math.max(...topProducts.map(p => p.sold))) * 100)}%` 
                        }}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {product.sold} ชิ้น
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {product.name}
                    </div>
                    <div className="text-xs text-emerald-600">
                      ฿{product.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {topProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">ไม่มีข้อมูลสินค้า</p>
              </div>
            )}
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">กำลังพัฒนา</h3>
          </div>
          <p className="text-yellow-700">
            กราฟยอดขายนี้กำลังอยู่ในขั้นตอนการพัฒนา ข้อมูลที่แสดงอาจไม่ครบถ้วน
            กราฟแบบ Interactive และการ Export ข้อมูลจะเพิ่มเติมในอนาคต
          </p>
        </div>
      </main>
    </div>
  );
}
