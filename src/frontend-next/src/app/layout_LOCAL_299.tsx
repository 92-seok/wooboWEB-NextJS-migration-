import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./responsive-globals.css"; // 글로벌 반응형 토크 임포트

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "우보 온라인 - 운영지원시스템",
  description: "우보 온라인 운영지원시스템",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        {/* 상단 헤더 */}
        <Header />

        {/* 메인 컨텐츠 영역: 스크롤 가능하도록 설정 */}
        <main className="flex-1 relative pb-20 lg:pb-0">{children}</main>

        {/* 하단 푸터 */}
        <Footer />

        {/* Toast 알림 */}
        <Toaster
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: "#ef444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
