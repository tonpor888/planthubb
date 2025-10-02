import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { useAuthContext } from "../providers/AuthProvider";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const { profile, initializing } = useAuthContext();

  if (initializing) {
    return <div className="flex min-h-screen items-center justify-center bg-emerald-50">กำลังโหลด...</div>;
  }

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "seller" && profile.role !== "admin") {
    redirect("/");
  }

  return <div>{children}</div>;
}

