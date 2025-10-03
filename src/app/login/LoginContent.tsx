'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthContext } from "../providers/AuthProvider";

export default function LoginContent() {
  const router = useRouter();
  const { signIn, signInFacebook, profile, firebaseUser, reloadUser } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const user = await signIn(email, password);

      if (!user.emailVerified) {
        await reloadUser();
        router.push("/verify-email");
        return;
      }

      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setIsFacebookLoading(true);

    try {
      await signInFacebook();
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook");
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-white py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
            PlantHub Member
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-emerald-900 md:text-5xl">
            ยินดีต้อนรับกลับ 🌿
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อ ดูแลร้านค้า และรับสิทธิพิเศษจากคอมมูนิตี้คนรักต้นไม้ของเรา
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              ติดตามสถานะคำสั่งซื้อและบริการจัดส่งแบบเรียลไทม์
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              จัดการสต็อกสินค้าและโปรโมชั่นของร้านได้อย่างง่ายดาย
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">•</span>
              เข้าร่วมเวิร์กช็อปและกิจกรรมจากผู้เชี่ยวชาญด้านการปลูก
            </li>
          </ul>
        </div>

        <div className="md:w-1/2">
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-500/10">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-emerald-800">เข้าสู่ระบบบัญชีของคุณ</h2>
              <p className="mt-2 text-sm text-slate-500">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน PlantHub</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-emerald-700">
                  อีเมล
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-emerald-700">
                  รหัสผ่าน
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-200" />
                  จดจำฉันไว้ในระบบ
                </label>
                <Link href="/forgot-password" className="text-emerald-600 transition hover:text-emerald-800">
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">หรือ</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isFacebookLoading}
                className="w-full rounded-full bg-[#1877F2] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#166FE5] disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {isFacebookLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Facebook"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ยังไม่มีบัญชีร้านค้า?
              <Link href="/register" className="ml-1 font-medium text-emerald-600 hover:text-emerald-800">
                สมัครสมาชิก
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-slate-400">
              การเข้าสู่ระบบถือเป็นการยอมรับ
              <Link href="/terms" className="mx-1 text-emerald-600 hover:text-emerald-800">
                เงื่อนไขการใช้บริการ
              </Link>
              และ
              <Link href="/privacy" className="ml-1 text-emerald-600 hover:text-emerald-800">
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

