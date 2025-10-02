import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบแอดมิน | PlantHub",
  description: "เข้าสู่ระบบสำหรับผู้ดูแลระบบ PlantHub",
};

import AdminLoginContent from "./AdminLoginContent";

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}
