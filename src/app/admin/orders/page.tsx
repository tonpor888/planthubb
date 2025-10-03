'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Search, 
  Filter,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";

type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

const statusOptions = [
  { value: 'pending', label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'ชำระเงินแล้ว', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' },
  { value: 'canceled', label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const ordersRef = collection(firestore, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Order[];
      
      setOrders(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, router]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (confirm(`ต้องการเปลี่ยนสถานะออเดอร์เป็น "${statusOptions.find(s => s.value === newStatus)?.label}" หรือไม่?`)) {
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

  const handleDelete = async (orderId: string) => {
    if (confirm("ต้องการลบออเดอร์นี้ออกจากระบบหรือไม่?")) {
      try {
        await deleteDoc(doc(firestore, "orders", orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("ไม่สามารถลบออเดอร์ได้");
      }
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

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
              <h1 className="text-xl font-semibold text-slate-800">จัดการคำสั่งซื้อ</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาออเดอร์ด้วย ID, ชื่อลูกค้า, หรือชื่อสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">ทุกสถานะ</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        ออเดอร์ #{order.id.slice(-8)}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-500">ลูกค้า</p>
                        <p className="font-medium text-slate-900">{order.buyerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">ยอดรวม</p>
                        <p className="font-semibold text-emerald-600">
                          ฿{order.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">วิธีการชำระ</p>
                        <p className="font-medium text-slate-900">
                          {order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' :
                           order.paymentMethod === 'credit' ? 'บัตรเครดิต' :
                           order.paymentMethod === 'promptpay' ? 'พร้อมเพย์' :
                           order.paymentMethod === 'bank_transfer' ? 'โอนธนาคาร' : order.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">วันที่สั่งซื้อ</p>
                        <p className="font-medium text-slate-900">
                          {order.createdAt.toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2">รายการสินค้า:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-sm text-slate-500">
                                ฿{item.price.toLocaleString()} × {item.quantity} ชิ้น
                              </p>
                            </div>
                            <p className="font-semibold text-slate-900">
                              ฿{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <p className="text-sm text-slate-500 mb-2">ที่อยู่จัดส่ง:</p>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>
                        <p className="text-sm text-slate-600">
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                        </p>
                        <p className="text-sm text-slate-600">
                          {order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-sm text-slate-600">โทร: {order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          เปลี่ยนสถานะ
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
                        <Eye className="h-4 w-4" />
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                      >
                        <XCircle className="h-4 w-4" />
                        ลบออเดอร์นี้
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">ไม่พบออเดอร์ที่ตรงกับเงื่อนไข</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          {statusOptions.map(option => (
            <div key={option.value} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{option.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {orders.filter(o => o.status === option.value).length}
                  </p>
                </div>
                {option.value === 'pending' && <Clock className="h-8 w-8 text-yellow-600" />}
                {option.value === 'paid' && <Package className="h-8 w-8 text-blue-600" />}
                {option.value === 'shipped' && <Truck className="h-8 w-8 text-purple-600" />}
                {option.value === 'completed' && <CheckCircle className="h-8 w-8 text-green-600" />}
                {option.value === 'canceled' && <XCircle className="h-8 w-8 text-red-600" />}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
