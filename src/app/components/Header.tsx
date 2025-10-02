'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Sparkles,
  Users,
  LogIn,
  Store,
  UserCircle,
  ChevronDown,
  Package,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import Image from "next/image";

import { useAuthContext } from "../providers/AuthProvider";

export function Header() {
  const router = useRouter();
  const { profile, signOut: signOutUser } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [profile]);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-emerald-100 bg-white/85 backdrop-blur relative overflow-hidden"
      style={{
        backgroundImage: 'url(/image/imageheader.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-emerald-600/60 pointer-events-none"></div>
      <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sunlight"></div>
      </div>
      <style jsx>{`
        @keyframes sunlight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-sunlight {
          animation: sunlight 8s ease-in-out infinite;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-8 relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-600 text-white font-semibold text-lg shadow-lg">
            PH
          </span>
          <span className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">PlantHub</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white md:flex">
          <Link href="#featured" className="flex items-center gap-2 transition hover:text-white hover:drop-shadow-lg py-2">
            <Sprout className="h-5 w-5" /> สินค้าแนะนำ
          </Link>
          <Link href="#benefits" className="flex items-center gap-2 transition hover:text-white hover:drop-shadow-lg py-2">
            <Sparkles className="h-5 w-5" /> จุดเด่น
          </Link>
          <Link href="#community" className="flex items-center gap-2 transition hover:text-white hover:drop-shadow-lg py-2">
            <Users className="h-5 w-5" /> คอมมูนิตี้
          </Link>

          <div className="ml-4 flex items-center gap-3">
            {profile ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-medium text-white transition hover:bg-emerald-700 shadow-lg"
                >
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.firstName}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                  <span className="text-white">สวัสดี {profile.firstName}</span>
                  <ChevronDown className={`h-5 w-5 text-white transition ${isMenuOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-emerald-100 bg-white p-2 text-sm shadow-2xl z-50">
                    <button
                      onClick={() => goTo("/profile")}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserCircle className="h-4 w-4" /> โปรไฟล์ของฉัน
                    </button>
                    <button
                      onClick={() => goTo("/orders")}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Package className="h-4 w-4" /> คำสั่งซื้อของฉัน
                    </button>
                    {(profile.role === "seller" || profile.role === "admin") && (
                      <button
                        onClick={() => goTo("/my-shop")}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Store className="h-4 w-4" /> ร้านของฉัน
                      </button>
                    )}
                    {profile.role === "admin" && (
                      <>
                        <div className="my-2 h-px bg-slate-200" />
                        <button
                          onClick={() => goTo("/admin/dashboard")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-800 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Shield className="h-4 w-4" /> แอดมิน
                        </button>
                      </>
                    )}
                    <div className="my-2 h-px bg-emerald-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-500 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-emerald-600 shadow-lg"
                >
                  <Store className="h-5 w-5" /> สมัครสมาชิกร้านค้า
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg transition hover:bg-emerald-50"
                >
                  <LogIn className="h-5 w-5" /> เข้าสู่ระบบ
                </Link>
              </>
            )}
          </div>
        </nav>

        <button className="inline-flex items-center gap-2 rounded-full border-2 border-white px-5 py-3 text-base font-medium text-white transition hover:bg-white hover:text-emerald-600 md:hidden shadow-lg">
          เมนู
        </button>
      </div>
    </header>
  );
}
