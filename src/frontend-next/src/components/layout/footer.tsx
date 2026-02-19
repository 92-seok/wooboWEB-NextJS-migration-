"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Tv2, Waves, AlertTriangle, Settings, User } from "lucide-react";
import "./footer.css";

const Footer = () => {
  const pathname = usePathname();

  // 로그인 상태 및 관리자 권한
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("사용자");

  useEffect(() => {
    const updateUserInfo = () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      setIsLoggedIn(!!token);

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === "admin");
          // 수정: user 객체에서 직접 이름 가져오기
          setUserName(user.name || user.username || "사용자");
        } catch (e) {
          console.error("User data parse error: ", e);
          setUserName("사용자");
          setIsAdmin(false);
        }
      } else {
        setUserName("사용자");
        setIsAdmin(false);
      }
    };

    // 초기 로드 시 즉시 실행
    updateUserInfo();
  }, [pathname]);

  const menuItems = [
    { label: "지도", icon: Map, href: "/map" },
    { label: "통합관측", icon: Tv2, href: "/weathersi" },
    { label: "소하천", icon: Waves, href: "/weathersr" },
    { label: "점검요망", icon: AlertTriangle, href: "/error" },
    { label: "관리", icon: Settings, href: "/setting", hidden: !(isLoggedIn && isAdmin) },
    {
      label: isLoggedIn ? `${userName}` : "로그인",
      icon: User,
      href: isLoggedIn ? "/admin" : "/login",
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => !item.hidden);

  return (
    <footer className="footer-nav">
      <div className="flex w-full items-stretch justify-around max-w-screen-xl mx-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${isActive ? "scale-110 transition-transform" : "opacity-80"}`}
              />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
