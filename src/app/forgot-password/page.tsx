import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน | PlantHub",
  description: "รีเซ็ตรหัสผ่านของคุณบน PlantHub",
};

import ForgotPasswordContent from "./ForgotPasswordContent";

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
