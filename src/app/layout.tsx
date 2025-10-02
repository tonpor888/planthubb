import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastContainer } from "../components/ui/toast-container";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PlantHub | ศูนย์รวมต้นไม้และดอกไม้",
  description:
    "เลือกชมต้นไม้และดอกไม้คุณภาพดี พร้อมโปรโมชั่นและบริการจัดส่งถึงมือคุณที่ PlantHub",
  metadataBase: new URL("https://example.com"),
  keywords: [
    "PlantHub",
    "ต้นไม้",
    "ดอกไม้",
    "ร้านต้นไม้",
    "จัดสวน",
    "สวน",
    "ปลูกต้นไม้",
  ],
  openGraph: {
    title: "PlantHub | ศูนย์รวมต้นไม้และดอกไม้",
    description:
      "ค้นพบต้นไม้และดอกไม้หลากหลายสายพันธุ์ พร้อมโปรโมชั่นสุดคุ้มจาก PlantHub",
    url: "https://example.com",
    siteName: "PlantHub",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
