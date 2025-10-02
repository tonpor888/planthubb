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
      <head>
        <link
          rel="preload"
          href="/hero-plant.svg"
          as="image"
          fetchPriority="high"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://planthub-694cf-default-rtdb.asia-southeast1.firebasedatabase.app" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for LCP and above-the-fold */
            .hero-image { 
              background: linear-gradient(135deg, #10b981 0%, #84cc16 100%);
              min-height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .hero-image::before {
              content: '';
              width: 60px;
              height: 60px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.1); }
            }
            /* Critical above-the-fold styles */
            .hero-section {
              background: linear-gradient(135deg, #10b981 0%, #84cc16 100%);
              min-height: 100vh;
              contain: layout style paint;
            }
            .hero-content {
              will-change: transform;
              transform: translateZ(0);
            }
            /* Optimize font loading */
            @font-face {
              font-family: 'Manrope';
              font-style: normal;
              font-weight: 400 800;
              font-display: swap;
              src: url('https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk59FO_F87jxeN7B.woff2') format('woff2');
            }
          `
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate performance optimizations
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(console.error);
              }
              
              // Preload critical resources immediately
              const heroLink = document.createElement('link');
              heroLink.rel = 'preload';
              heroLink.href = '/hero-plant.svg';
              heroLink.as = 'image';
              document.head.appendChild(heroLink);
              
              // Load Google Fonts asynchronously
              const fontLink = document.createElement('link');
              fontLink.rel = 'stylesheet';
              fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';
              document.head.appendChild(fontLink);
              
              // Optimize font loading
              if ('fonts' in document) {
                document.fonts.ready.then(() => {
                  document.documentElement.classList.add('fonts-loaded');
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
