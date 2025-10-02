'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Search, 
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Activity,
  Download,
  Eye
} from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";
import { getLogs, getUserLogs, type LogEntry } from "@/services/firebase/logs.service";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const actionTypes = [
  { value: 'all', label: 'ทุกการกระทำ' },
  { value: 'เข้าสู่ระบบ', label: 'เข้าสู่ระบบ' },
  { value: 'ออกจากระบบ', label: 'ออกจากระบบ' },
  { value: 'สมัครสมาชิก', label: 'สมัครสมาชิก' },
  { value: 'สร้างผู้ใช้', label: 'สร้างผู้ใช้' },
  { value: 'อัปเดตข้อมูลผู้ใช้', label: 'อัปเดตข้อมูลผู้ใช้' },
  { value: 'ลบผู้ใช้', label: 'ลบผู้ใช้' },
  { value: 'เปลี่ยนสิทธิ์ผู้ใช้', label: 'เปลี่ยนสิทธิ์ผู้ใช้' },
  { value: 'เพิ่มสินค้า', label: 'เพิ่มสินค้า' },
  { value: 'แก้ไขสินค้า', label: 'แก้ไขสินค้า' },
  { value: 'ลบสินค้า', label: 'ลบสินค้า' },
  { value: 'สร้างออเดอร์', label: 'สร้างออเดอร์' },
  { value: 'อัปเดตออเดอร์', label: 'อัปเดตออเดอร์' },
  { value: 'ยกเลิกออเดอร์', label: 'ยกเลิกออเดอร์' },
  { value: 'สร้างคูปอง', label: 'สร้างคูปอง' },
  { value: 'แก้ไขคูปอง', label: 'แก้ไขคูปอง' },
  { value: 'ลบคูปอง', label: 'ลบคูปอง' },
  { value: 'แอดมินเข้าสู่ระบบ', label: 'แอดมินเข้าสู่ระบบ' },
];

export default function AdminLogsPage() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchLogs = async () => {
      try {
        const logsData = await getLogs(200);
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [profile, router]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  // const logAction = async (action: string, description: string, targetType: string, targetId: string, targetName: string, details?: unknown) => {
  //   if (profile?.role !== "admin") return;

  //   const logEntry: Omit<LogEntry, 'id'> = {
  //     action,
  //     description,
  //     adminId: profile.uid,
  //     adminName: `${profile.firstName} ${profile.lastName}`,
  //     targetType,
  //     targetId,
  //     targetName,
  //     timestamp: Date.now(),
  //     details,
  //   };

  //   try {
  //     const logsRef = ref(realtimeDb, "admin_logs");
  //     const newLogRef = push(logsRef);
  //     await set(newLogRef, logEntry);
  //   } catch (error) {
  //     console.error("Error logging action:", error);
  //   }
  // };

  const exportLogs = () => {
    const csvContent = [
      ['วันที่', 'เวลา', 'การกระทำ', 'คำอธิบาย', 'แอดมิน', 'เป้าหมาย', 'รายละเอียด'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleDateString('th-TH'),
        new Date(log.timestamp).toLocaleTimeString('th-TH'),
        log.action,
        `"${log.details}"`,
        log.userName,
        log.userEmail,
        log.metadata ? `"${JSON.stringify(log.metadata)}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <h1 className="text-xl font-semibold text-slate-800">ระบบ Log</h1>
            </div>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              Export CSV
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
              placeholder="ค้นหา Log ด้วยคำอธิบาย, ชื่อแอดมิน, หรือเป้าหมาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {actionTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
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
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{log.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{log.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800 transition">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">ไม่พบ Log ที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Log ทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">วันนี้</p>
                <p className="text-2xl font-bold text-slate-900">
                  {logs.filter(log => {
                    const today = new Date();
                    const logDate = new Date(log.timestamp);
                    return today.toDateString() === logDate.toDateString();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">สัปดาห์นี้</p>
                <p className="text-2xl font-bold text-slate-900">
                  {logs.filter(log => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(log.timestamp) >= weekAgo;
                  }).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">ผู้ใช้ที่ใช้งาน</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(logs.map(log => log.userId)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Export function for other components to use
// export { AdminLogsPage as logAction };
