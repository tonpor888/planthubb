import type { Metadata } from "next";
import RegisterContent from "./RegisterContent";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | PlantHub",
  description: "สร้างบัญชีใหม่เพื่อเริ่มขายและซื้อสินค้าต้นไม้กับ PlantHub",
};

export default function RegisterPage() {
  return <RegisterContent />;
}


