/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Minus, LocateFixed, Search, Menu, X, Activity } from "lucide-react";
import { weathersiApi } from "@/lib/api";
import "./map.css";

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_KEY = "78043f0e0163452bfd6915fc3ef926a6";
const KAKAO_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;

const MapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mountTime, setMountTime] = useState("");
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentLayer, setCurrentLayer] = useState("SKYVIEW");
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusCard, setShowStatusCard] = useState(false); // 모바일 상태창 토글
  const [isMobile, setIsMobile] = useState(false);

  // 현재 열려있는 단일 커스텀 오버레이와 마커들을 관리하기 위한 Ref
  const activeOverlay = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const loadStations = async () => {
    try {
      const response = await weathersiApi.getDevices();
      console.log("📍 Map Page API Response:", response); // 디버깅용 로그

      if (response && response.success && Array.isArray(response.data)) {
        const mappedData = response.data.map((item: any) => {
          // GB_OBSV 코드 매핑 (숫자/문자 모두 대응)
          const gbCode = String(item.GB_OBSV || "").padStart(2, "0");
          let type = "rain";
          switch (gbCode) {
            case "01":
              type = "rain";
              break;
            case "02":
              type = "water";
              break;
            case "03":
            case "04":
              type = "tilt";
              break;
            case "06":
              type = "flood";
              break;
            case "08":
              type = "snow";
              break;
            case "17":
              type = "display";
              break;
            case "18":
            case "21":
              type = "broad";
              break;
            case "20":
              type = "gate";
              break;
            default:
              type = "rain";
          }

          return {
            id: item.IDX,
            name: item.NM_DIST_OBSV || "이름 없음",
            lat: parseFloat(item.LAT) || 37.4341,
            lng: parseFloat(item.LON) || 127.174,
            type: type,
            status: Number(item.ErrorChk) === 5 ? "normal" : "error",
          };
        });
        setStations(mappedData);
      } else {
        console.warn("⚠️ API 성공했으나 데이터가 비어있거나 실패함:", response);
      }
    } catch (error) {
      console.error("❌ 관측소 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    if (map || !window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = mapContainerRef.current;
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.4341, 127.174),
        level: 8,
      };

      const newMap = new window.kakao.maps.Map(container, options);
      newMap.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
      setMap(newMap);
      setMapLoaded(true);
    });
  };

  // 데이터가 변경될 때마다 마커 다시 그리기
  useEffect(() => {
    if (!map || stations.length === 0) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    stations.forEach((station) => {
      const isError = station.status !== "normal";
      const imageSrc = `/markers/${station.type}_marker${isError ? "_error" : ""}.png`;
      const imageSize = new window.kakao.maps.Size(36, 51);
      const imageOption = { offset: new window.kakao.maps.Point(18, 51) };
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: new window.kakao.maps.LatLng(station.lat, station.lng),
        title: station.name,
        image: markerImage,
      });

      markersRef.current.push(marker);

      const content = document.createElement("div");
      content.className = "custom-overlay animate-slide-up";
      content.innerHTML = `
        <div class="overlay-header">
          <span class="overlay-title text-[13px] font-black">${station.name}</span>
          <span class="overlay-close text-slate-400 hover:text-red-500 transition-colors cursor-pointer text-lg">×</span>
        </div>
        <div class="overlay-body mt-1">
          <span class="overlay-status-badge ${station.status === "normal" ? "badge-normal" : "badge-error"}">
            ${station.status === "normal" ? "정상" : "점검요망"}
          </span>
          <span class="text-[10px] text-slate-400 font-mono ml-2">${station.id}</span>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: marker.getPosition(),
        content: content,
        yAnchor: 1.3,
      });

      const closeBtn = content.querySelector(".overlay-close");
      closeBtn?.addEventListener("click", () => overlay.setMap(null));

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (activeOverlay.current) activeOverlay.current.setMap(null);
        overlay.setMap(map);
        activeOverlay.current = overlay;
      });
    });
  }, [map, stations]);

  useEffect(() => {
    setMountTime(new Date().toLocaleTimeString());
    loadStations(); // 초기 로드

    // 30초마다 데이터 갱신
    const timer = setInterval(loadStations, 30000);

    const handleResize = () => {
      if (window.innerWidth < 1024) setShowSidebar(false);
      else setShowSidebar(true);
    };
    handleResize();

    if (window.kakao && window.kakao.maps) {
      initMap();
    }

    return () => clearInterval(timer);
  }, []);

  const moveToStation = (lat: number, lng: number) => {
    if (!map) return;
    map.panTo(new window.kakao.maps.LatLng(lat, lng));
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const changeMapType = (type: string) => {
    if (!map || !window.kakao || !window.kakao.maps) return;

    const MapTypeId = window.kakao.maps.MapTypeId;
    let targetMapTypeId;

    if (type === "ROADMAP") {
      targetMapTypeId = MapTypeId.ROADMAP;
    } else if (type === "HYBRID") {
      targetMapTypeId = MapTypeId.HYBRID;
    } else {
      // 기본값 (일반 지도)
      targetMapTypeId = MapTypeId.HYBRID;
    }

    console.log(`🗺️ 지도 타입 변경: ${type}`, targetMapTypeId);
    map.setMapTypeId(targetMapTypeId);
    setCurrentLayer(type);
    setShowLayerMenu(false);
  };

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // 초기 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredStations = stations.filter((s) => s.name?.includes(searchQuery));

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-100 overflow-hidden">
      <Script
        src={KAKAO_SDK_URL}
        strategy="afterInteractive"
        onLoad={initMap}
        onError={() => alert("카카오맵 로드 실패! 도메인 설정을 확인하세요.")}
      />

      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 사이드바 토글 버튼 */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`h-10 px-4 gap-2 rounded-xl shadow-2xl border-none transition-all ${
            showSidebar ? "bg-indigo-600 text-white" : "bg-white hover:bg-slate-50 text-slate-800"
          }`}
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="text-xs font-black">장비 목록</span>
        </Button>
      </div>

      <aside className={`station-sidebar ${showSidebar ? "open" : ""} h-[400px]`}>
        <div className="sidebar-header">
          <div className="flex items-center mb-2.5">
            <h2 className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
              장비 현황
            </h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 font-bold" />
            <input
              type="text"
              placeholder="장비 명칭 검색..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-none rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="station-list">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400">데이터 로드 중...</div>
          ) : (
            <>
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  className="station-item group"
                  onClick={() => moveToStation(station.lat, station.lng)}
                >
                  <div
                    className={`status-dot ${station.status === "normal" ? "bg-green-500" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"}`}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[12px] font-bold text-slate-700 group-hover:text-indigo-600 truncate max-w-[110px]">
                      {station.name}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{station.id}</span>
                  </div>
                </button>
              ))}
              {filteredStations.length === 0 && (
                <div className="py-12 text-center opacity-30">
                  <Search className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-[10px]">검색 결과 없음</p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {(!mapLoaded || loading) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 z-50">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-bold">인증 확인 및 데이터 동기화...</p>
        </div>
      )}

      <div className="map-controls">
        <Card className="flex flex-col p-1 bg-white/95 backdrop-blur border-none shadow-2xl pointer-events-auto rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => map?.setLevel(map.getLevel() - 1)}
            className="h-10 w-10 sm:h-11 sm:w-11"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 font-bold" />
          </Button>
          <div className="h-px bg-slate-200 mx-1.5" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => map?.setLevel(map.getLevel() + 1)}
            className="h-10 w-10 sm:h-11 sm:w-11"
          >
            <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 font-bold" />
          </Button>
        </Card>
        <Button
          onClick={() => map?.panTo(new window.kakao.maps.LatLng(37.4341, 127.174))}
          className="bg-indigo-700 hover:bg-indigo-800 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-2xl pointer-events-auto transition-transform active:scale-90"
        >
          <LocateFixed className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </Button>
      </div>

      {/* 하단 컨트롤: Live 박스 + 레이어 버튼 동일 라인 (레이어 우측 끝) */}
      <div
        className={`absolute z-[999] flex justify-between items-center gap-4 pointer-events-none ${
          isMobile
            ? "left-3 right-3 bottom-[calc(var(--footer-h-mobile)+180px)]"
            : "left-6 right-6 bottom-[calc(var(--footer-h-desktop)+20px)]"
        }`}
      >
        {/* 좌측: Live 박스 또는 모바일 상태 토글 버튼 */}
        <div className="pointer-events-auto flex items-center min-w-0">
          {(showStatusCard || !isMobile) ? (
            <div
              className={`status-card relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-6 ${
                isMobile ? "animate-slide-up origin-bottom" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5 pr-5 border-r border-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-tight hidden sm:block">
                  {mountTime}
                </span>
              </div>
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-slate-500 font-bold">Total</span>
                  <span className="text-sm font-black text-white">{stations.length}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-green-500/70 font-bold">Normal</span>
                  <span className="text-sm font-black text-green-400">
                    {stations.filter((s) => s.status === "normal").length}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-red-500/70 font-bold">Error</span>
                  <span className="text-sm font-black text-red-500 animate-pulse">
                    {stations.filter((s) => s.status === "error").length}
                  </span>
                </div>
              </div>
              {isMobile && (
                <button
                  onClick={() => setShowStatusCard(false)}
                  className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border border-slate-600 shadow-lg"
                >
                  <X size={12} className="text-slate-300" />
                </button>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setShowStatusCard(!showStatusCard)}
              className={`sm:hidden h-12 w-12 rounded-2xl shadow-xl transition-all border-none ${
                showStatusCard
                  ? "bg-green-500 text-white ring-4 ring-green-500/30"
                  : "bg-white text-slate-900"
              }`}
            >
              <Activity className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* 우측 끝: 레이어 버튼 */}
        <div className="pointer-events-auto relative flex-shrink-0">
          {showLayerMenu && (
            <div
              className={`absolute bottom-14 right-0 w-32 sm:w-40 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up p-1 sm:p-1.5 flex flex-col gap-1 ${
                isMobile ? "" : "sm:block"
              }`}
            >
              {[
                { id: "ROADMAP", name: "일반 지도", desc: "표준 벡터" },
                { id: "HYBRID", name: "하이브리드", desc: "위성+도로" },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => changeMapType(layer.id)}
                  className={`text-[11px] sm:text-xs font-bold py-2 px-3 sm:py-2.5 sm:px-3 rounded-xl text-left w-full transition-colors flex flex-col ${
                    currentLayer === layer.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{layer.name}</span>
                  <span className="text-[9px] opacity-50 font-normal hidden sm:inline">
                    {layer.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
          <Button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`h-12 w-12 sm:h-14 sm:px-6 sm:w-auto rounded-2xl shadow-2xl border-none font-bold gap-3 transition-all ${
              showLayerMenu ? "bg-indigo-600 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="h-5 w-5" />
            <span className="hidden sm:inline">레이어</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
