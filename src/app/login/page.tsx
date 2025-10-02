import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | PlantHub",
  description: "ลงชื่อเข้าใช้งานเพื่อจัดการคำสั่งซื้อและร้านค้าของคุณบน PlantHub",
};

export default function LoginPage() {
  return <LoginContent />;
}

