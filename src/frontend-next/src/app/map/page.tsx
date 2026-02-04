"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Navigation, Plus, Minus, LocateFixed } from "lucide-react";

const MapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. 지도 초기화 로직 (임시로 배경색만 지정)
  useEffect(() => {
    if (mapContainerRef.current) {
      // 여기에 실제 지도 SDK(카카오맵 등) 초기화 코드가 들어갈 예정입니다.
      setMapLoaded(true);
    }
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-128px)] bg-slate-100 rounded-xl overflow-hidden shadow-inner border">
      {/* 1. 지도 컨테이너 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full flex items-center justify-center"
      >
        {!mapLoaded ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">지도를 불러오는 중...</p>
          </div>
        ) : (
          <div className="text-slate-300 pointer-events-none select-none">
            <Navigation className="w-24 h-24 mb-4 opacity-20 mx-auto" />
            <p className="text-xl font-bold opacity-30 text-center">MAP VIEW AREA</p>
          </div>
        )}
      </div>

      {/* 2. 지도 컨트롤 유틸리티 (우측 상단) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Card className="flex flex-col p-1 shadow-lg border-none bg-white/90 backdrop-blur">
          <Button variant="ghost" size="icon" className="rounded-md">
            <Plus className="h-5 w-5 text-slate-700" />
          </Button>
          <div className="h-[1px] bg-slate-200 mx-2" />
          <Button variant="ghost" size="icon" className="rounded-md">
            <Minus className="h-5 w-5 text-slate-700" />
          </Button>
        </Card>

        <Button size="icon" className="bg-white/90 backdrop-blur shadow-lg border-none hover:bg-white text-slate-700 rounded-md">
          <LocateFixed className="h-5 w-5" />
        </Button>
      </div>

      {/* 3. 레이어 선택 (좌측 상단) */}
      <div className="absolute top-4 left-4 z-10">
        <Button className="gap-2 bg-blue-700 hover:bg-blue-800 shadow-lg border-none">
          <Layers className="h-4 w-4" />
          <span>지도 레이어</span>
        </Button>
      </div>

      {/* 4. 하단 정보 바 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-auto">
        <Card className="px-6 py-3 shadow-2xl border-none bg-slate-900/80 backdrop-blur text-white flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">실시간 통신 정상</span>
          </div>
          <p className="text-xs text-slate-300">현재 표시 중인 관측소: <span className="text-white font-bold ml-1">24개소</span></p>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;