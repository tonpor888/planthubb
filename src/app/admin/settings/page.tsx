'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  ArrowLeft,
  Save,
  Database,
  Mail,
  Shield,
  Bell,
  Globe,
  CreditCard
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";

type SystemSettings = {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maxProductsPerSeller: number;
  deliveryFee: number;
  minOrderAmount: number;
  autoApproveOrders: boolean;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  currency: string;
  timezone: string;
};

export default function SystemSettingsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "PlantHub",
    siteDescription: "ตลาดออนไลน์สำหรับพืชและต้นไม้",
    adminEmail: "admin@planthub.dev",
    supportEmail: "support@planthub.dev",
    maxProductsPerSeller: 100,
    deliveryFee: 40,
    minOrderAmount: 100,
    autoApproveOrders: false,
    emailNotifications: true,
    maintenanceMode: false,
    currency: "THB",
    timezone: "Asia/Bangkok",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [profile, router]);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // TODO: บันทึกการตั้งค่าไปยัง Firebase
      // await updateDoc(doc(firestore, "settings", "system"), settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage("บันทึกการตั้งค่าเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== "admin") {
    return null;
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
              <h1 className="text-xl font-semibold text-slate-800">การตั้งค่าระบบ</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("เรียบร้อย") 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">การตั้งค่าทั่วไป</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ชื่อเว็บไซต์
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  คำอธิบายเว็บไซต์
                </label>
                <input
                  type="text"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  อีเมลแอดมิน
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  อีเมลสนับสนุน
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">การตั้งค่าธุรกิจ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  จำนวนสินค้าสูงสุดต่อร้าน
                </label>
                <input
                  type="number"
                  value={settings.maxProductsPerSeller}
                  onChange={(e) => setSettings({ ...settings, maxProductsPerSeller: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ค่าจัดส่ง (บาท)
                </label>
                <input
                  type="number"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ยอดสั่งซื้อขั้นต่ำ (บาท)
                </label>
                <input
                  type="number"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  สกุลเงิน
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="THB">THB (บาทไทย)</option>
                  <option value="USD">USD (ดอลลาร์สหรัฐ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">การตั้งค่าระบบ</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">อนุมัติออเดอร์อัตโนมัติ</h3>
                  <p className="text-sm text-slate-500">ระบบจะอนุมัติออเดอร์โดยอัตโนมัติเมื่อชำระเงินแล้ว</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveOrders}
                    onChange={(e) => setSettings({ ...settings, autoApproveOrders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">การแจ้งเตือนทางอีเมล</h3>
                  <p className="text-sm text-slate-500">ส่งการแจ้งเตือนทางอีเมลให้ผู้ใช้</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">โหมดบำรุงรักษา</h3>
                  <p className="text-sm text-slate-500">ปิดเว็บไซต์ชั่วคราวเพื่อบำรุงรักษา</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">การตั้งค่าฐานข้อมูล</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-sm font-medium text-yellow-800">คำเตือน</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  การเปลี่ยนแปลงการตั้งค่าฐานข้อมูลอาจส่งผลกระทบต่อการทำงานของระบบ
                  กรุณาติดต่อผู้ดูแลระบบก่อนดำเนินการ
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  สำรองข้อมูล
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  ล้างข้อมูลทดสอบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
