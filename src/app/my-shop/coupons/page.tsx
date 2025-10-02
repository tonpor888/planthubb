'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit3, Trash2, Calendar, Users, DollarSign, Search, Save, X } from "lucide-react";
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";

import { useAuthContext } from "../../providers/AuthProvider";
import { firestore } from "@/lib/firebaseClient";

type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
};

type EditForm = {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minPurchase: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

export default function CouponsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    code: "",
    discountType: 'percentage',
    discountValue: "",
    minPurchase: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  useEffect(() => {
    if (!profile) {
      router.push("/login");
      return;
    }

    const couponsRef = collection(firestore, "coupons");
    const q = query(couponsRef, where("sellerId", "==", profile.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const couponData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        validFrom: doc.data().validFrom?.toDate() || new Date(),
        validUntil: doc.data().validUntil?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Coupon[];
      
      setCoupons(couponData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, router]);

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    
    const query = searchQuery.toLowerCase();
    return coupons.filter(coupon => 
      coupon.code.toLowerCase().includes(query) ||
      coupon.discountType.toLowerCase().includes(query) ||
      coupon.discountValue.toString().includes(query)
    );
  }, [coupons, searchQuery]);

  const deleteCoupon = async (couponId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบคูปองนี้?")) {
      try {
        await deleteDoc(doc(firestore, "coupons", couponId));
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon.id);
    setEditForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxUses: coupon.maxUses.toString(),
      validFrom: coupon.validFrom.toISOString().split('T')[0],
      validUntil: coupon.validUntil.toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingCoupon(null);
    setEditForm({
      code: "",
      discountType: 'percentage',
      discountValue: "",
      minPurchase: "",
      maxUses: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
  };

  const saveEdit = async () => {
    if (!editingCoupon) return;

    const discountValue = parseFloat(editForm.discountValue);
    const minPurchase = parseFloat(editForm.minPurchase);
    const maxUses = parseInt(editForm.maxUses);

    if (!editForm.code.trim()) {
      alert("กรุณากรอกรหัสคูปอง");
      return;
    }
    if (isNaN(discountValue) || discountValue <= 0) {
      alert("กรุณากรอกจำนวนส่วนลดที่ถูกต้อง");
      return;
    }
    if (isNaN(minPurchase) || minPurchase < 0) {
      alert("กรุณากรอกยอดซื้อขั้นต่ำที่ถูกต้อง");
      return;
    }
    if (isNaN(maxUses) || maxUses <= 0) {
      alert("กรุณากรอกจำนวนครั้งที่ใช้งานที่ถูกต้อง");
      return;
    }
    if (!editForm.validFrom || !editForm.validUntil) {
      alert("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
      return;
    }
    if (new Date(editForm.validFrom) >= new Date(editForm.validUntil)) {
      alert("วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น");
      return;
    }

    try {
      await updateDoc(doc(firestore, "coupons", editingCoupon), {
        code: editForm.code.trim(),
        discountType: editForm.discountType,
        discountValue: discountValue,
        minPurchase: minPurchase,
        maxUses: maxUses,
        validFrom: new Date(editForm.validFrom),
        validUntil: new Date(editForm.validUntil),
        isActive: editForm.isActive,
      });
      
      setEditingCoupon(null);
      setEditForm({
        code: "",
        discountType: 'percentage',
        discountValue: "",
        minPurchase: "",
        maxUses: "",
        validFrom: "",
        validUntil: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Error updating coupon:", error);
      alert("ไม่สามารถบันทึกการแก้ไขได้");
    }
  };

  const isExpired = (validUntil: Date) => {
    return new Date() > validUntil;
  };

  const isActive = (coupon: Coupon) => {
    const now = new Date();
    return coupon.isActive && 
           now >= coupon.validFrom && 
           now <= coupon.validUntil && 
           coupon.usedCount < coupon.maxUses;
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
            <h1 className="text-3xl font-bold text-emerald-800">จัดการคูปอง</h1>
            <p className="mt-1 text-sm text-slate-600">สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า</p>
          </div>
          <Link
            href="/my-shop/coupons/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> สร้างคูปองใหม่
          </Link>
        </header>

        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาคูปอง (รหัส, ประเภท, จำนวนส่วนลด...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-12 text-center shadow-lg">
            <p className="text-slate-600">คุณยังไม่มีคูปอง</p>
            <Link
              href="/my-shop/coupons/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> สร้างคูปองแรก
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`rounded-3xl border p-6 shadow-lg transition ${
                  isActive(coupon)
                    ? "border-emerald-200 bg-white"
                    : isExpired(coupon.validUntil)
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {editingCoupon === coupon.id ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสคูปอง</label>
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                          placeholder="SUMMER2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทส่วนลด</label>
                        <select
                          value={editForm.discountType}
                          onChange={(e) => setEditForm(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        >
                          <option value="percentage">เปอร์เซ็นต์ (%)</option>
                          <option value="fixed">จำนวนเงิน (฿)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนส่วนลด</label>
                        <input
                          type="number"
                          value={editForm.discountValue}
                          onChange={(e) => setEditForm(prev => ({ ...prev, discountValue: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                          placeholder="10"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ยอดซื้อขั้นต่ำ (฿)</label>
                        <input
                          type="number"
                          value={editForm.minPurchase}
                          onChange={(e) => setEditForm(prev => ({ ...prev, minPurchase: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                          placeholder="100"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนครั้งที่ใช้งาน</label>
                        <input
                          type="number"
                          value={editForm.maxUses}
                          onChange={(e) => setEditForm(prev => ({ ...prev, maxUses: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                          placeholder="100"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่มต้น</label>
                        <input
                          type="date"
                          value={editForm.validFrom}
                          onChange={(e) => setEditForm(prev => ({ ...prev, validFrom: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันที่สิ้นสุด</label>
                        <input
                          type="date"
                          value={editForm.validUntil}
                          onChange={(e) => setEditForm(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-700">เปิดใช้งาน</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                      >
                        <Save className="mr-2 inline h-4 w-4" />
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <X className="mr-2 inline h-4 w-4" />
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-emerald-800">{coupon.code}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive(coupon)
                              ? "bg-emerald-100 text-emerald-700"
                              : isExpired(coupon.validUntil)
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isActive(coupon) ? "ใช้งานได้" : isExpired(coupon.validUntil) ? "หมดอายุ" : "ไม่เปิดใช้งาน"}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {coupon.discountType === 'percentage' 
                              ? `ลด ${coupon.discountValue}%` 
                              : `ลด ฿${coupon.discountValue}`
                            }
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            ถึง {coupon.validUntil.toLocaleDateString('th-TH')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {coupon.usedCount}/{coupon.maxUses} ครั้ง
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            ขั้นต่ำ ฿{coupon.minPurchase.toLocaleString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(coupon)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

