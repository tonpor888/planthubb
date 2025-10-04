'use client';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-600 mb-8">เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
