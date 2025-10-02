import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterContent from "./RegisterContent";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | PlantHub",
  description: "สร้างบัญชีใหม่เพื่อเริ่มขายและซื้อสินค้าต้นไม้กับ PlantHub",
};

function RegisterFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-lime-200 rounded-full w-48"></div>
            <div className="h-12 bg-lime-200 rounded w-3/4"></div>
            <div className="h-6 bg-lime-200 rounded w-full"></div>
            <div className="h-6 bg-lime-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="rounded-3xl border border-lime-200 bg-white p-8 shadow-xl shadow-lime-500/10">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-lime-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-lime-200 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-lime-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  );
}


