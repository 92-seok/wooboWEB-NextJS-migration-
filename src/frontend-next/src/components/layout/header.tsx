"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import dayjs from 'dayjs';
import { UserCircle, LogOut, LogIn, Sun } from "lucide-react";

const Header = () => {
  const [time, setTime] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full flex flex-col border-b">
      {/* 시스템 바 (Vue: v-system-bar) - 진한 파란색 계열 */}
      <div className="bg-slate-900 text-white text-[10px] md:text-xs py-1 px-4 flex justify-between">
        <span>{time || "0000-00-00 00:00:00"}</span>
        <span className="hidden sm:inline opacity-70">Woobo Support System</span>
      </div>

      {/* 앱 바 (Vue: v-app-bar) */}
      <nav className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2">
          {/* 로고 영역: 회사 상징색인 Blue 적용 */}
          <Link href="/" className="text-base md:text-xl font-bold text-blue-700 flex items-center">
            <span className="bg-blue-700 text-white px-2 py-0.5 rounded mr-2 text-sm">WB</span>
            우보 온라인
            <span className="hidden lg:inline ml-2 text-slate-400 font-normal text-sm border-l pl-2">운영지원시스템</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <Sun className="h-5 w-5" />
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <UserCircle className="h-4 w-4" />
                <span className="text-sm font-medium">사용자님</span>
              </div>
              <button className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
              <LogIn className="h-4 w-4" />
              <span>로그인</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;