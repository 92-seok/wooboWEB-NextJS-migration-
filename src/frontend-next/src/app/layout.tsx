import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./responsive-globals.css"; // 글로벌 반응형 토크 임포트

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const inter = Inter({ subsets: ['latin'] });

export const metaadata: Metadata = {
  title: "우보 온라인 - 운영지원시스템",
  description: "우보 온라인 운영지원시스템",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} h-screen flex flex-col bg-background text-foreground antialiased overflow-hidden`}>
        {/* 상단 헤더 */}
        <Header />

        {/* 메인 컨텐츠 영역: 스크롤 가능하도록 설정 */}
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>

        {/* 하단 푸터 */}
        <Footer />
      </body>
    </html>
  )
}