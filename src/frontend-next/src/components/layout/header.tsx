"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { UserCircle, LogOut, LogIn, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import "./header.css";

const Header = () => {
  const [time, setTime] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("사용자");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);

    // 다크모드 초기 상태 확인
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    }

    // 사용자 정보 업데이트
    const updateUserInfo = () => {
      const token = sessionStorage.getItem("accessToken");
      const userStr = sessionStorage.getItem("user");

      setIsLoggedIn(!!token);

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // 수정: user 객체에서 직접 이름 가져오기
          setUserName(user.name || user.username || "사용자");
        } catch (e) {
          console.error("User data parse error:", e);
          setUserName("사용자");
        }
      } else {
        setUserName("사용자");
      }
    };

    updateUserInfo();

    return () => clearInterval(timer);
  }, [pathname]);

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      toast.success("다크 모드가 활성화되었습니다.", {
        duration: 2000,
        icon: "🌙",
      });
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      toast.success("라이트 모드가 활성화되었습니다.", {
        duration: 2000,
        icon: "☀️",
      });
    }
  };

  // 로그아웃 확인 함수
  const confirmLogout = (): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col border border-slate-200`}
          >
            <div className="flex-1 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-slate-900">로그아웃 확인</p>
                  <p className="mt-1 text-sm text-slate-500">정말 로그아웃 하시겠습니까?</p>
                </div>
              </div>
            </div>
            <div className="flex border-t border-slate-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="w-full border-r border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "bottom-center",
        }
      );
    });
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    const confirmed = await confirmLogout();

    if (!confirmed) return;

    try {
      await authApi.logout();

      toast.success("로그아웃되었습니다.", {
        duration: 2000,
        position: "bottom-center",
      });

      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error) {
      console.error("로그아웃 오류: ", error);
      toast.error("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="header-wrapper">
      {/* 시스템 바 */}
      <div className="system-bar">
        <span className="tabular-nums">{time || "0000-00-00 00:00:00"}</span>
        <span className="hide-on-mobile opacity-70 tracking-tight whitespace-nowrap overflow-hidden">
          Woobo Online Support System
        </span>
      </div>

      {/* 앱 바 */}
      <nav className="app-bar">
        <div className="flex items-center gap-2">
          <Link href="/" className="logo-text transition-all active:scale-95">
            <span className="bg-blue-700 text-white px-1.5 py-0.5 rounded mr-1.5 text-[10px] sm:text-xs">
              WB
            </span>
            <span className="tracking-tighter">우보 온라인</span>
            <span className="hide-on-mobile ml-2 text-slate-400 font-normal text-xs border-l pl-2">
              운영지원시스템
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500 dark:text-slate-400"
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDarkMode ? (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {/* 수정: userName 변수 사용 */}
                <span className="text-[10px] sm:text-sm font-medium">{userName}님</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-1.5 sm:h-auto sm:w-auto sm:gap-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-sm font-medium">로그아웃</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
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
