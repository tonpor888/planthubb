'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Mail,
  Shield,
  UserCheck,
  ArrowLeft,
  Filter,
  Key,
  Eye
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebaseClient";
import { createLog } from "@/services/firebase/logs.service";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'seller' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as User[];
      
      setUsers(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, router]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`ต้องการเปลี่ยน Role ของผู้ใช้นี้เป็น ${newRole} หรือไม่?`)) {
      try {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        await updateDoc(doc(firestore, "users", userId), {
          role: newRole,
          updatedAt: new Date(),
        });
        
        // สร้าง log
        await createLog(
          userId,
          user.email,
          `${user.firstName} ${user.lastName}`,
          "ROLE_CHANGED",
          `แอดมินเปลี่ยนสิทธิ์ผู้ใช้จาก ${user.role} เป็น ${newRole}`,
          { oldRole: user.role, newRole, adminId: profile?.uid }
        );
        
        alert("เปลี่ยนสิทธิ์ผู้ใช้สำเร็จ");
      } catch (error) {
        console.error("Error updating user role:", error);
        alert("ไม่สามารถเปลี่ยน Role ได้");
      }
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (confirm(`ต้องการลบผู้ใช้ ${userEmail} หรือไม่?`)) {
      try {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        await deleteDoc(doc(firestore, "users", userId));
        
        // สร้าง log
        await createLog(
          userId,
          user.email,
          `${user.firstName} ${user.lastName}`,
          "USER_DELETED",
          `แอดมินลบผู้ใช้: ${user.email} (${user.role})`,
          { deletedUser: user, adminId: profile?.uid }
        );
        
        alert("ลบผู้ใช้สำเร็จ");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("ไม่สามารถลบผู้ใช้ได้");
      }
    }
  };

  const handleSendPasswordReset = async (userEmail: string) => {
    if (confirm(`ต้องการส่งอีเมลรีเซ็ตรหัสผ่านให้ ${userEmail} หรือไม่?`)) {
      try {
        const { sendPasswordResetEmail } = await import("firebase/auth");
        await sendPasswordResetEmail(auth, userEmail);
        
        // สร้าง log
        await createLog(
          "system",
          userEmail,
          "ระบบ",
          "PASSWORD_RESET",
          `แอดมินส่งอีเมลรีเซ็ตรหัสผ่านให้: ${userEmail}`,
          { adminId: profile?.uid, targetEmail: userEmail }
        );
        
        alert(`ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง ${userEmail} แล้ว`);
      } catch (error) {
        console.error("Error sending password reset email:", error);
        alert("ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง");
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition p-2 rounded-lg hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">จัดการผู้ใช้</h1>
              <p className="text-slate-600">จัดการข้อมูลผู้ใช้และสิทธิ์การเข้าถึง</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push("/admin/users/send-password-reset")}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Key className="h-4 w-4" />
              ส่งอีเมลตั้งรหัสผ่าน
            </button>
            <button 
              onClick={() => router.push("/admin/users/add")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-400 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              เพิ่มผู้ใช้ใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้ด้วยอีเมลหรือชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            >
              <option value="all">ทุก Role</option>
              <option value="customer">ผู้ซื้อ</option>
              <option value="seller">ผู้ขาย</option>
              <option value="admin">แอดมิน</option>
            </select>
          </div>
        </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-lime-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                        >
                        <option value="customer">ผู้ซื้อ</option>
                        <option value="seller">ผู้ขาย</option>
                        <option value="admin">แอดมิน</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.emailVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.createdAt.toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}/logs`)}
                          className="text-emerald-600 hover:text-emerald-800 transition p-1 rounded hover:bg-emerald-50"
                          title="ดู Log ของผู้ใช้"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendPasswordReset(user.email)}
                          className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                          title="ส่งอีเมลรีเซ็ตรหัสผ่าน"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ผู้ซื้อ</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'customer').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ผู้ขาย</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'seller').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">แอดมิน</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
