'use client';

import { FormEvent, useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseClient";

import { useAuthContext } from "../providers/AuthProvider";

type UserType = "buyer" | "seller" | "both";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInGoogle } = useAuthContext();

  const [storeName, setStoreName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("buyer");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // ตรวจสอบว่ามีผู้ใช้ที่รอการสมัครสมาชิกหรือไม่
  useEffect(() => {
    const checkPendingUser = async () => {
      const emailParam = searchParams.get('email');
      if (emailParam) {
        try {
          // ค้นหาใน pending_users collection
          const pendingUsersRef = collection(firestore, "pending_users");
          const q = query(
            pendingUsersRef,
            where("email", "==", emailParam),
            where("pendingRegistration", "==", true)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setPendingUser({ ...userData, docId: querySnapshot.docs[0].id });
            setEmail(userData.email);
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setUserType(userData.role === "customer" ? "buyer" : "seller");
          }
        } catch (error) {
          console.error("Error checking pending user:", error);
        }
      }
    };

    checkPendingUser();
  }, [searchParams]);

  const storeNameRequired = useMemo(() => userType !== "buyer", [userType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องต้องตรงกัน");
      return;
    }

    if (storeNameRequired && !storeName.trim()) {
      setError("กรุณากรอกชื่อร้านหรือนามแฝงสำหรับผู้ขาย");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // ถ้ามี pending user ให้อัปเดตข้อมูลแทนการสร้างใหม่
      if (pendingUser) {
        await signUp({
          email,
          password,
          firstName,
          lastName,
          storeName: storeName.trim() || undefined,
          role: userType === "buyer" ? "customer" : "seller",
        });

        // ลบ pending user record
        await deleteDoc(doc(firestore, "pending_users", pendingUser.docId));
      } else {
        await signUp({
          email,
          password,
          firstName,
          lastName,
          storeName: storeName.trim() || undefined,
          role: userType === "buyer" ? "customer" : "seller",
        });
      }

      router.push("/verify-email");
    } catch (err: any) {
      setError(err?.message ?? "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signInGoogle();
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการสมัครสมาชิกด้วย Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <span className="inline-flex items-center rounded-full bg-lime-100 px-4 py-1 text-sm font-semibold text-emerald-700">
            เริ่มต้นกับ PlantHub
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-emerald-900 md:text-5xl">
            สร้างร้านสีเขียวของคุณวันนี้
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            สร้างบัญชีเพื่อขายต้นไม้ของคุณ หรือเลือกช้อปสินค้าที่คัดสรรจากพาร์ทเนอร์ทั่วประเทศ พร้อมระบบจัดการหลังบ้านครบครัน
          </p>
          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-lime-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-emerald-700">แดชบอร์ดจัดการร้าน</h3>
              <p className="mt-2 text-sm text-slate-600">บริหารสินค้า สต็อก และรายการสั่งซื้อได้ภายในไม่กี่คลิก พร้อมเครื่องมือโปรโมชัน</p>
            </div>
            <div className="rounded-2xl border border-lime-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-emerald-700">คอมมูนิตี้กว่า 50,000 คน</h3>
              <p className="mt-2 text-sm text-slate-600">เข้าร่วมกิจกรรม แลกเปลี่ยนความรู้ และขยายฐานลูกค้าได้อย่างรวดเร็ว</p>
            </div>
            <div className="rounded-2xl border border-lime-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-emerald-700">ทีมสนับสนุนเฉพาะทาง</h3>
              <p className="mt-2 text-sm text-slate-600">มีทีมงานคอยช่วยเหลือเรื่องการจัดส่ง บริการหลังการขาย และเคล็ดลับการดูแลต้นไม้</p>
            </div>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="rounded-3xl border border-lime-200 bg-white p-8 shadow-xl shadow-lime-500/10">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-emerald-800">สมัครสมาชิก PlantHub</h2>
              <p className="mt-2 text-sm text-slate-500">สร้างบัญชีภายในไม่กี่นาที เพียงกรอกข้อมูลด้านล่าง</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="w-full rounded-full bg-white border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 shadow-md transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 mb-6"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isGoogleLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิกด้วย Google"}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lime-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">หรือสมัครด้วยอีเมล</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="firstname" className="block text-sm font-medium text-emerald-700">
                  ชื่อจริง
                </label>
                <input
                  id="firstname"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="เช่น สมชาย"
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastname" className="block text-sm font-medium text-emerald-700">
                  นามสกุล
                </label>
                <input
                  id="lastname"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="เช่น ใจดี"
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="storeName" className="block text-sm font-medium text-emerald-700">
                  ชื่อร้าน / นามแฝง (สำหรับผู้ขาย)
                </label>
                <input
                  id="storeName"
                  value={storeName}
                  onChange={(event) => setStoreName(event.target.value)}
                  placeholder="เช่น Greeny Corner"
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
                {storeNameRequired && (
                  <p className="text-xs text-rose-500">* ผู้ขายจำเป็นต้องระบุชื่อร้าน หรือใช้นามแฝง</p>
                )}
              </div>

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
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
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
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-700">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-emerald-700">
                  ประเภทผู้ใช้งาน
                </label>
                <select
                  id="type"
                  value={userType}
                  onChange={(event) => setUserType(event.target.value as UserType)}
                  className="w-full rounded-xl border border-lime-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="buyer">ผู้ซื้อ (Buyer)</option>
                  <option value="seller">ผู้ขาย (Seller)</option>
                  <option value="both">ทั้งสองแบบ</option>
                </select>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-lime-50 p-4 text-sm text-slate-600">
                <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-200" />
                <span>
                  ฉันยอมรับ
                  <Link href="/terms" className="mx-1 font-medium text-emerald-600 hover:text-emerald-800">
                    เงื่อนไขการใช้บริการ
                  </Link>
                  และ
                  <Link href="/privacy" className="ml-1 font-medium text-emerald-600 hover:text-emerald-800">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </span>
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "กำลังสมัครสมาชิก..." : "สร้างบัญชี"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              มีบัญชีอยู่แล้ว?
              <Link href="/login" className="ml-1 font-medium text-emerald-600 hover:text-emerald-800">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

