"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import dayjs from 'dayjs';
import { UserCircle, LogOut, LogIn, Sun } from "lucide-react";
import './header.css'; // 분리한 반응형 CSS 임포트

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
    <header className="header-wrapper">
      {/* 시스템 바 (Vue: v-system-bar) */}
      <div className="system-bar">
        <span className="tabular-nums">{time || "0000-00-00 00:00:00"}</span>
        <span className="hide-on-mobile opacity-70 tracking-tight whitespace-nowrap overflow-hidden">Woobo Online Support System</span>
      </div>

      {/* 앱 바 (Vue: v-app-bar) */}
      <nav className="app-bar">
        <div className="flex items-center gap-2">
          <Link href="/" className="logo-text transition-all active:scale-95">
            <span className="bg-blue-700 text-white px-1.5 py-0.5 rounded mr-1.5 text-[10px] sm:text-xs">WB</span>
            <span className="tracking-tighter">우보 온라인</span>
            <span className="hide-on-mobile ml-2 text-slate-400 font-normal text-xs border-l pl-2">운영지원시스템</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          <button className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-sm font-medium">관리자님</span>
              </div>
              <button className="flex items-center justify-center p-1.5 sm:h-auto sm:w-auto sm:gap-1 text-red-500 hover:text-red-700 transition-colors">
                <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-sm font-medium">로그아웃</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95">
              <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>로그인</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;