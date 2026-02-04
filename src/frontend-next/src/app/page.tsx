import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Apple, Globe } from "lucide-react";

export default function Home() {
  const downloadItems = [
    {
      title: "웹페이지",
      text: "http://woobo.online",
      icon: Globe,
      href: "/weathersi",
      color: "text-blue-600",
    },
    {
      title: "안드로이드",
      text: "com.woobo.online.apk",
      icon: Smartphone,
      href: "http://woobo.online/api/download",
      external: true,
      color: "text-green-600",
    },
    {
      title: "윈도우즈",
      text: "우보 온라인.exe",
      icon: Monitor,
      href: "#",
      disabled: true,
      color: "text-slate-400",
    },
    {
      title: "아이폰",
      text: "com.woobo.online.ipa",
      icon: Apple,
      href: "#",
      disabled: true,
      color: "text-slate-400",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      {/* 로고 영역 (Vue의 v-img) */}
      <div className="w-full max-w-[200px]">
        <h1 className="text-3xl font-black text-blue-700 italic text-center">WOOBO</h1>
        <p className="text-center text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest">Support System</p>
      </div>

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">설치 파일 다운로드</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloadItems.map((item) => (
            <Link 
              key={item.title} 
              href={item.disabled ? "#" : item.href}
              target={item.external ? "_blank" : "_self"}
              className={`${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Card className={`group transition-all hover:shadow-md ${item.disabled ? 'opacity-60 grayscale' : 'hover:border-blue-300'}`}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className={`p-2 rounded-lg bg-slate-50 mr-3 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-dashed text-center">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}