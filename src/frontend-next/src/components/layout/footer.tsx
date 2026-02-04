"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 현재 경로 확인용
import { Map, Tv2, Waves, AlertTriangle, Settings, User } from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();

  // 버튼 정보를 배열로 만들어서 관리하면 코드가 훨씬 깔끔해짐 (DRY 원칙)
  const menuItems = [
    { label: "지도", icon: Map, href: "/map" },
    { label: "통합관측", icon: Tv2, href: "/weathersi" },
    { label: "소하천", icon: Waves, href: "/weathersr" },
    { label: "점검요망", icon: AlertTriangle, href: "/error" },
    { label: "관리", icon: Settings, href: "/setting", adminOnly: true },
  ];

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-blue-700 border-t border-blue-800">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-5 hover:bg-blue-800 group ${isActive ? 'bg-blue-900 text-white' : 'text-blue-100'
                }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-blue-200'}`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;