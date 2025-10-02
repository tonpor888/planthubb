'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Filter,
  DollarSign
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { ref, onValue, update, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebaseClient";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  stock: number;
  imageUrl: string;
  sellerId: string;
  active: boolean;
  createdAt: number;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const productsRef = ref(realtimeDb, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const value = snapshot.val() ?? {};
      setProducts(value);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, router]);

  const filteredProducts = Object.entries(products).filter(([, product]) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && product.active) ||
      (statusFilter === "inactive" && !product.active);
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await update(ref(realtimeDb, `products/${productId}`), {
        active: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("ไม่สามารถเปลี่ยนสถานะสินค้าได้");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`ต้องการลบสินค้า "${productName}" หรือไม่?`)) {
      try {
        await remove(ref(realtimeDb, `products/${productId}`));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("ไม่สามารถลบสินค้าได้");
      }
    }
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
              <h1 className="text-xl font-semibold text-slate-800">จัดการสินค้า</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
              <Plus className="h-4 w-4" />
              เพิ่มสินค้าใหม่
            </button>
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
              placeholder="ค้นหาสินค้าด้วยชื่อหรือคำอธิบาย..."
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
              <option value="active">เปิดขาย</option>
              <option value="inactive">ปิดขาย</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(([id, product]) => (
            <div
              key={id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition ${
                product.active ? 'border border-emerald-200' : 'border border-slate-200'
              }`}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.active 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {product.active ? 'เปิดขาย' : 'ปิดขาย'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">ราคา:</span>
                    <span className="font-semibold text-emerald-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">สต็อก:</span>
                    <span className="font-medium text-slate-900">
                      {product.stock} ชิ้น
                    </span>
                  </div>
                  {product.cost && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">ต้นทุน:</span>
                      <span className="font-medium text-red-600">
                        ฿{product.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(id, product.active)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                      product.active
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {product.active ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        ปิดขาย
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        เปิดขาย
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(id, product.name)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900">{Object.keys(products).length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">เปิดขาย</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.values(products).filter(p => p.active).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ปิดขาย</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.values(products).filter(p => !p.active).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">มูลค่ารวม</p>
                <p className="text-2xl font-bold text-slate-900">
                  ฿{Object.values(products).reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
