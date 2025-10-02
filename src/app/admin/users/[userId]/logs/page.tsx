'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Activity, FileText } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { useAuthContext } from "../../../../providers/AuthProvider";
import { getUserLogs, type LogEntry } from "@/services/firebase/logs.service";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";

type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  emailVerified: boolean;
};

export default function UserLogsPage() {
  const router = useRouter();
  const params = useParams();
  const { profile } = useAuthContext();
  const userId = params.userId as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // ดึงข้อมูลผู้ใช้
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            uid: userDoc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
          } as UserProfile);
        }

        // ดึง logs ของผู้ใช้
        const userLogs = await getUserLogs(userId, 100);
        setLogs(userLogs);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">ไม่พบข้อมูลผู้ใช้</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            กลับไปหน้าผู้ใช้
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Log ของผู้ใช้</h1>
            <p className="text-slate-600">ประวัติการใช้งานของ {userProfile.firstName} {userProfile.lastName}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="text-slate-600">{userProfile.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                userProfile.role === 'admin' ? 'bg-red-100 text-red-800' :
                userProfile.role === 'seller' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {userProfile.role === 'admin' ? 'แอดมิน' :
                 userProfile.role === 'seller' ? 'ผู้ขาย' : 'ผู้ซื้อ'}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                userProfile.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userProfile.emailVerified ? 'ยืนยันอีเมลแล้ว' : 'ยังไม่ยืนยันอีเมล'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">วันที่สมัคร</p>
            <p className="text-sm font-medium text-slate-900">
              {format(userProfile.createdAt, 'dd/MM/yyyy HH:mm', { locale: th })}
            </p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">ประวัติการใช้งาน</h3>
            <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              {logs.length} รายการ
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-lime-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  วันที่/เวลา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  การกระทำ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  รายละเอียด
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {format(log.timestamp, 'dd/MM/yyyy', { locale: th })}
                    </div>
                    <div className="text-sm text-slate-500">
                      {format(log.timestamp, 'HH:mm:ss', { locale: th })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-md">
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">ไม่พบประวัติการใช้งาน</p>
          </div>
        )}
      </div>
    </div>
  );
}
