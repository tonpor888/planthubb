'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Calendar, CreditCard, Truck, Eye, Search } from "lucide-react";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";

import { useAuthContext } from "../../providers/AuthProvider";
import { firestore } from "@/lib/firebaseClient";

type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!profile) {
      router.push("/login");
      return;
    }

    const ordersRef = collection(firestore, "orders");
    const q = query(
      ordersRef,
      where("sellerIds", "array-contains", profile.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Order[];
      
      setOrders(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, router]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.buyerName.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.paymentMethod.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query)) ||
      order.id.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (confirm(`ต้องการเปลี่ยนสถานะออเดอร์เป็น "${newStatus}" หรือไม่?`)) {
      try {
        await updateDoc(doc(firestore, "orders", orderId), {
          status: newStatus,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("ไม่สามารถเปลี่ยนสถานะออเดอร์ได้");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอการยืนยัน';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'shipped': return 'จัดส่งแล้ว';
      case 'delivered': return 'ส่งมอบแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/my-shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> กลับไปร้านของฉัน
          </Link>
        </div>

        <header className="flex flex-col gap-4 border-b border-emerald-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">ออเดอร์ทั้งหมด</h1>
            <p className="mt-1 text-sm text-slate-600">จัดการและติดตามคำสั่งซื้อจากลูกค้า</p>
          </div>
        </header>

        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาออเดอร์ (ชื่อลูกค้า, สถานะ, วิธีการชำระเงิน, ชื่อสินค้า...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-12 text-center shadow-lg">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">ยังไม่มีออเดอร์</p>
            <p className="text-sm text-slate-500 mt-2">เมื่อมีลูกค้าสั่งซื้อสินค้าของคุณ ออเดอร์จะแสดงที่นี่</p>
          </section>
        ) : (
          <section className="mt-10 space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-emerald-800">ออเดอร์ #{order.id.slice(-8)}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {order.createdAt.toLocaleDateString('th-TH')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : 
                           order.paymentMethod === 'credit' ? 'บัตรเครดิต' :
                           order.paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'โอนธนาคาร'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          {order.items.length} รายการ
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-emerald-600">
                          ฿{order.total.toLocaleString('th-TH')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">รายการสินค้า:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-slate-600">
                            <span>{item.name} × {item.quantity}</span>
                            <span>฿{(item.price * item.quantity).toLocaleString('th-TH')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="paid">ชำระเงินแล้ว</option>
                      <option value="shipped">จัดส่งแล้ว</option>
                      <option value="completed">เสร็จสิ้น</option>
                      <option value="canceled">ยกเลิก</option>
                    </select>
                    <button className="rounded-xl border border-emerald-200 px-4 py-2 text-sm text-emerald-600 transition hover:bg-emerald-50">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

