'use client';

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

import { useAuthContext } from "../providers/AuthProvider";
import FloatingChatButton from "./FloatingChatButton";
import ChatPanel from "./ChatPanel";

export function Header() {
  const router = useRouter();
  const { profile, signOut: signOutUser } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save original overflow style
      const originalOverflow = document.body.style.overflow;
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      // Cleanup: restore original overflow when menu closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

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
    setIsMobileMenuOpen(false);
  }, [profile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <>
      <header
      className="sticky top-0 z-50 border-b border-emerald-100 bg-white/85 backdrop-blur relative"
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
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white font-semibold text-lg shadow-lg">
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
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-6 py-3 text-base font-medium text-white transition hover:scale-105 shadow-lg"
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
                  <div className="absolute right-0 md:right-auto md:left-0 mt-3 w-56 rounded-2xl border border-emerald-100 bg-white p-2 text-sm shadow-2xl z-[9999] animate-slideDown origin-top">
                    <button
                      onClick={() => goTo("/")}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Sprout className="h-4 w-4" /> กลับหน้าแรก
                    </button>
                    <div className="my-2 h-px bg-emerald-100" />
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
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" /> ติดต่อเจ้าหน้าที่
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
                  <Store className="h-5 w-5" /> สมัครร้านค้า
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

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-white px-5 py-3 text-base font-medium text-white transition hover:bg-white hover:text-emerald-600 md:hidden shadow-lg"
        >
          เมนู
        </button>
      </div>
    </header>
    {isMounted &&
      createPortal(
        <>
          <div
            className={`fixed inset-0 z-[1400] transition-opacity duration-300 md:hidden ${
              isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-white/35 backdrop-blur-md" />
          </div>
          <aside
            className={`fixed inset-y-0 right-0 z-[1500] w-[30vw] max-w-xs min-w-[220px] bg-white/95 backdrop-blur-xl border-l border-emerald-100 shadow-2xl transition-transform duration-500 ease-out md:hidden ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col gap-6 px-5 py-6 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-emerald-700">เมนู</span>
                <button
                  type="button"
                  className="rounded-full bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChevronDown className="h-5 w-5 rotate-180" />
                </button>
              </div>

              {profile ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt={profile.firstName}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                        <User className="h-6 w-6 text-emerald-700" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">สวัสดี</span>
                      <span className="text-base font-semibold text-emerald-700">{profile.firstName} {profile.lastName}</span>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-2">
                    <button
                      onClick={() => goTo("/")}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Sprout className="h-4 w-4" /> กลับหน้าแรก
                    </button>
                    <div className="h-px bg-emerald-100" />
                    <button
                      onClick={() => goTo("/profile")}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserCircle className="h-4 w-4" /> โปรไฟล์ของฉัน
                    </button>
                    <button
                      onClick={() => goTo("/orders")}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Package className="h-4 w-4" /> คำสั่งซื้อของฉัน
                    </button>
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" /> ติดต่อเจ้าหน้าที่
                    </button>
                    {(profile.role === "seller" || profile.role === "admin") && (
                      <button
                        onClick={() => goTo("/my-shop")}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Store className="h-4 w-4" /> ร้านของฉัน
                      </button>
                    )}
                    {profile.role === "admin" && (
                      <button
                        onClick={() => goTo("/admin/dashboard")}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Shield className="h-4 w-4" /> แอดมิน
                      </button>
                    )}
                  </nav>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="h-px bg-emerald-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-3 text-base font-semibold text-white shadow transition hover:bg-rose-600"
                    >
                      <LogOut className="h-4 w-4" /> ออกจากระบบ
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-500">เข้าสู่ระบบเพื่อจัดการบัญชีและคำสั่งซื้อของคุณ</p>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-base font-semibold text-white shadow transition hover:bg-emerald-700"
                  >
                    <LogIn className="h-4 w-4" /> เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-3 text-base font-medium text-emerald-600 shadow transition hover:bg-emerald-50"
                  >
                    <Store className="h-4 w-4" /> สมัครร้านค้า
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-2 text-sm font-medium text-slate-600 border-t border-emerald-100 pt-4">
                <Link
                  href="/#featured"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Sprout className="h-4 w-4" /> สินค้าแนะนำ
                </Link>
                <Link
                  href="/#benefits"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Sparkles className="h-4 w-4" /> จุดเด่น
                </Link>
                <Link
                  href="/#community"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Users className="h-4 w-4" /> คอมมูนิตี้
                </Link>
              </div>
            </div>
          </aside>
        </>,
        document.body
      )}
      
      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      
      {/* Chat Panel Component */}
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
