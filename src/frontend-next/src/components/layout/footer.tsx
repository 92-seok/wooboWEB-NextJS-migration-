"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 현재 경로 확인용
import { Map, Tv2, Waves, AlertTriangle, Settings, User } from 'lucide-react';
import './footer.css'; // 분리한 반응형 CSS 임포트

const Footer = () => {
  const pathname = usePathname();

  // 로그인 상태 및 관리자 권한
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [userName, setUserName] = useState("관리자");

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const userStr = sessionStorage.getItem('user');

    setIsLoggedIn(!!token);

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
        setUserName(sessionStorage.getItem('userName') || "관리자")
      } catch (e) {
        console.error('User data parse error: ', e);
      }
    };
  }, [pathname]);

  const menuItems = [
    { label: "지도", icon: Map, href: "/map" },
    { label: "통합관측", icon: Tv2, href: "/weathersi" },
    { label: "소하천", icon: Waves, href: "/weathersr" },
    { label: "점검요망", icon: AlertTriangle, href: "/error" },
    { label: "관리", icon: Settings, href: "/setting", hidden: !(isLoggedIn && isAdmin) },
    { label: isLoggedIn ? `${userName}님` : "로그인", icon: User, href: isLoggedIn ? "/admin" : "/login" },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.hidden);

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
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110 transition-transform' : 'opacity-80'}`} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;