"use client";

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Minus, LocateFixed, Signal, SignalLow } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

// 카카오 앱키
const KAKAO_KEY = 'f4592e97c349ab41d02ff73bd314a201';
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;

const MapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 샘플 데이터
  const stations = [
    { id: 1, name: "성남 관측소", lat: 37.4341, lng: 127.174, type: "rain", status: "normal" },
    { id: 2, name: "분당 차단기", lat: 37.4141, lng: 127.154, type: "gate", status: "error" },
    { id: 3, name: "판교 방송", lat: 37.4041, lng: 127.114, type: "broad", status: "normal" },
  ];

  const initMap = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = mapContainerRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.4341, 127.174), // 지도의 중심좌표
          level: 9,
        };
        const newMap = new window.kakao.maps.Map(container, options);
        // 마커 생성
        stations.forEach((station) => {
          const imgName = station.status === 'error' ? `${station.type}_marker_error.png` : `${station.type}_marker.png`;
          const imageSrc = `/images/markers/${imgName}`;
          const imageSize = new window.kakao.maps.Size(34, 42);
          const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

          const marker = new window.kakao.maps.Marker({
            map: newMap,
            position: new window.kakao.maps.LatLng(station.lat, station.lng),
            title: station.name,
            image: markerImage,
          });
          // 인포윈도우 추가 (InfoWindow 대문자 주의!)
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:10px; min-width:150px; text-align:center;">
                        <div style="font-weight:bold; font-size:14px; margin-bottom:5px; color:#333;">${station.name}</div>
                        <div style="font-size:12px; color:#666;">상태: ${station.status === 'normal' ? '정상' : '점검요망'}</div>
                      </div>`
          });
          // 이벤트 등록 (event.addListener 주의!)
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(newMap, marker);
          });
        });
        setMap(newMap);
        setMapLoaded(true);
      });
    }
  };

  const zoomIn = () => map?.setLevel(map.getLevel() - 1);
  const zoomOut = () => map?.setLevel(map.getLevel() + 1);
  const relocalize = () => map?.panTo(new window.kakao.maps.LatLng(37.5665, 126.9780));

  return (
    <div className="relative w-full h-[calc(100vh-128px)] bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <Script src={KAKAO_SDK_URL} strategy="afterInteractive" onLoad={initMap} />

      {/* 1. 지도 영역 */}
      <div ref={mapContainerRef} className="w-full h-full">
        {!mapLoaded && (
          <div className="flex flex-col items-center justify-center w-full h-full gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold">카카오맵 로드 중...</p>
          </div>
        )}
      </div>
      {/* 2. 네비게이션 컨트롤 (우측 상단) */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <Card className="flex flex-col p-1 shadow-2xl border-none bg-white/95 backdrop-blur">
          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-10 w-10 hover:bg-slate-100">
            <Plus className="h-6 w-6 text-slate-700" />
          </Button>
          <div className="h-[1px] bg-slate-200 mx-2" />
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-10 w-10 hover:bg-slate-100">
            <Minus className="h-6 w-6 text-slate-700" />
          </Button>
        </Card>
        <Button
          onClick={relocalize}
          className="bg-indigo-700 hover:bg-indigo-800 shadow-2xl border-none h-12 w-12 rounded-full transition-all active:scale-90"
        >
          <LocateFixed className="h-6 w-6 text-white" />
        </Button>
      </div>
      {/* 3. 하단 상태 바 (포트폴리오 임팩트용) */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end pointer-events-none">
        <Card className="p-4 bg-slate-900/90 backdrop-blur border-none shadow-2xl text-white flex items-center gap-6 pointer-events-auto">
          <div className="flex flex-col gap-1 pr-6 border-r border-slate-700">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-bold">시스템 실시간 연결</span>
            </div>
            <span className="text-[10px] text-slate-400">마지막 업데이트: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</p>
              <p className="text-lg font-black tracking-tighter">125</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Normal</p>
              <p className="text-lg font-black tracking-tighter text-green-400">124</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Error</p>
              <p className="text-lg font-black tracking-tighter text-red-500">1</p>
            </div>
          </div>
        </Card>
        <Button className="h-12 px-6 gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold shadow-2xl border-none p-4 rounded-xl pointer-events-auto">
          <Layers className="h-5 w-5" />
          레이어 메뉴
        </Button>
      </div>
    </div>
  );
};
export default MapPage;