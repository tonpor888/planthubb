'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthContext } from "../providers/AuthProvider";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { firebaseUser, profile, resendVerification, reloadUser, cancelRegistration } = useAuthContext();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const refreshStatus = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const user = await reloadUser();
      if (user?.emailVerified) {
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.message ?? "ไม่สามารถตรวจสอบสถานะได้");
    } finally {
      setChecking(false);
    }
  }, [reloadUser, router]);

  useEffect(() => {
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    if (firebaseUser.emailVerified) {
      router.replace("/");
    }
  }, [firebaseUser, router]);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    try {
      await resendVerification();
      setMessage("ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาตรวจสอบกล่องจดหมาย");
    } catch (err: any) {
      setError(err?.message ?? "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleCancel = async () => {
    setError(null);
    try {
      await cancelRegistration();
      router.replace("/register");
    } catch (err: any) {
      setError(err?.message ?? "ไม่สามารถยกเลิกการสมัครได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-400 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white/95 p-10 shadow-xl shadow-emerald-950/20 backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            ✉️
          </div>
          <h1 className="text-3xl font-bold text-emerald-800">ยืนยันอีเมลเพื่อเริ่มใช้งาน</h1>
          <p className="mt-4 max-w-xl text-slate-600">
            เราส่งลิงก์ยืนยันไปที่ <span className="font-semibold text-emerald-700">{firebaseUser.email}</span> แล้ว
            กรุณากดปุ่มยืนยันในอีเมลของคุณเพื่อเปิดใช้งานบัญชี PlantHub เต็มรูปแบบ
          </p>

          <div className="mt-8 w-full space-y-4">
            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              onClick={handleResend}
              className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
            >
              ส่งอีเมลยืนยันอีกครั้ง
            </button>

            <button
              onClick={refreshStatus}
              disabled={checking}
              className="w-full rounded-full border border-emerald-500 px-6 py-3 text-base font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {checking ? "กำลังตรวจสอบ..." : "ฉันยืนยันอีเมลแล้ว"}
            </button>

            <button
              onClick={handleCancel}
              className="w-full rounded-full border border-rose-400 px-6 py-3 text-base font-semibold text-rose-500 transition hover:bg-rose-50"
            >
              ยกเลิกการสมัครและกลับไปหน้าแรก
            </button>
          </div>

          <div className="mt-10 text-sm text-slate-500">
            <p>
              ไม่ได้เมล? ตรวจสอบโฟลเดอร์ <strong>Spam/Promotions</strong> หรือใช้ปุ่มส่งอีกครั้งด้านบน
            </p>
            <p className="mt-2">
              หากยังไม่ได้รับ ให้ติดต่อทีมงานที่ <Link href="mailto:support@planthub.com" className="text-emerald-600 hover:text-emerald-800">support@planthub.com</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

