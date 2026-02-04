import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* 상단 헤더 : 시스템 바 + 앱 바 {Vuetify = v-app-bar} */}
        <Header />
        {/* 메인 컨텐츠 {Vuetify = v-main} */}
        <main className="flex-1 pb-16">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        {/* 하단 푸터 {Vuetify = v-bottom-navigation} */}
        <Footer />
      </body>
    </html>
  )
}