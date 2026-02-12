"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { weathersrApi } from "@/lib/api";
import { WeatherDevice } from "@/lib/types";
import { DataSyncIndicator } from "@/components/ui/data-sync-indicator";
import { getDeviceStatusBadgeClass } from "@/lib/dataDisplay";
import dayjs from "dayjs";

const REGION_MENU = [
  { name: "전국", filter: ["전국"] },
  { name: "경기도", filter: ["경기", "서울"] },
  { name: "전라도", filter: ["전라", "광주"] },
  { name: "경상도", filter: ["경상", "부산", "울산", "대구"] },
  { name: "충청도", filter: ["충청", "대전", "세종"] },
  { name: "강원도", filter: ["강원"] },
  { name: "인천/제주도", filter: ["인천", "제주"] },
];

const WeatherSRPage = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [areaList, setAreaList] = useState<{ title: string; value: string }[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("%");
  const [selectedRegionMenu, setSelectedRegionMenu] = useState<string | null>(null);
  const [devices, setDevices] = useState<WeatherDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const filterAndSortArea = (filterTerms: string[]) => {
    return areaList
      .filter((area) =>
        filterTerms.some((term) => (area.title || "").includes(term))
      )
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, devicesRes] = await Promise.all([
        weathersrApi.getAreas(),
        weathersrApi.getDevices(selectedArea === "%" ? undefined : selectedArea),
      ]);
      if (areasRes?.success && areasRes?.data) {
        const list = (
          areasRes.data as { RM?: string; ADMCODE?: string; title?: string; value?: string }[]
        ).map((item) => ({
          title: item.RM || item.title || "",
          value: item.ADMCODE || item.value || "",
        }));
        setAreaList(list);
      }
      if (devicesRes?.success && devicesRes?.data) {
        setDevices(devicesRes.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("SR 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = async (adcode: string, menuName?: string | null) => {
    setSelectedArea(adcode);
    setSelectedRegionMenu(menuName ?? null);
    setLoading(true);
    try {
      const res = await weathersrApi.getDevices(adcode === "%" ? undefined : adcode);
      if (res?.success) setDevices(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("SR 장비 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedArea, searchQuery]);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      (d.NM_DIST_OBSV || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.IDX || "").includes(searchQuery);
    return matchesSearch;
  });

  const totalItems = filteredDevices.length;
  const normalCount = filteredDevices.filter((d) => d.STATUS === "OK").length;
  const errorCount = filteredDevices.filter((d) => d.STATUS !== "OK").length;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-container max-w-[1440px] mx-auto space-y-6 pb-32 lg:pb-32 px-4 sm:px-8 lg:px-12 mt-8" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            소하천 관측 목록
          </h1>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>마지막 갱신: {dayjs(lastUpdated).format("YYYY-MM-DD HH:mm:ss")}</span>
              <span className="mx-2">|</span>
              <span>현재: {dayjs(currentTime).format("HH:mm:ss")}</span>
            </div>
          )}
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 상태 요약 박스 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">전체</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{totalItems}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
          <div className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 mb-1">정상</div>
          <div className="text-2xl sm:text-3xl font-black text-green-700 dark:text-green-300">{normalCount}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
          <div className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mb-1">점검필요</div>
          <div className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-300">{errorCount}</div>
        </div>
      </div>

      {/* 지역 필터 */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              지역 필터
            </label>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
              {REGION_MENU.filter((menu) => {
                if (menu.name === "전국") return true;
                return filterAndSortArea(menu.filter).length > 0;
              }).map((menu) => (
                <DropdownMenu key={menu.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={selectedRegionMenu === menu.name ? "default" : "ghost"}
                      size="sm"
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                        selectedRegionMenu === menu.name
                          ? "bg-blue-600 dark:bg-blue-700 text-white shadow-md"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {menu.name}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                    {menu.name === "전국" ? (
                      <DropdownMenuItem onClick={() => handleAreaChange("%", menu.name)}>
                        전국
                      </DropdownMenuItem>
                    ) : (
                      filterAndSortArea(menu.filter).map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          onClick={() => handleAreaChange(item.value, menu.name)}
                        >
                          {item.title}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder="장비명 또는 코드 검색..."
          className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 장비 테이블 */}
      <div className="space-y-4">
        <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-blue-600 dark:border-blue-700 bg-white dark:bg-slate-800">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/80 border-b dark:border-slate-600">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="w-[30px] sm:w-[40px] px-1"></TableHead>
                <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  번호
                </TableHead>
                <TableHead className="w-[40px] sm:w-[70px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  유형
                </TableHead>
                <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center text-[9px] sm:text-[12px] px-0.5">
                  관측소명
                </TableHead>
                <TableHead className="w-[50px] sm:w-[80px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  상태
                </TableHead>
                <TableHead className="w-[80px] sm:w-[160px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  수위 데이터
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    데이터를 로드 중입니다...
                  </TableCell>
                </TableRow>
              ) : paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    조회된 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((item, index) => {
                  const isNormal = item.STATUS === "OK";
                  const statusClass = getDeviceStatusBadgeClass(isNormal);
                  
                  return (
                  <React.Fragment key={item.IDX}>
                    <TableRow
                      className={`h-14 border-b dark:border-slate-700 transition-all cursor-pointer ${
                        expandedRow === item.IDX
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                      }`}
                      onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                    >
                      <TableCell className="text-center px-2">
                        {expandedRow === item.IDX ? (
                          <ChevronUp className="h-4 w-4 text-blue-500 dark:text-blue-400 mx-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <img
                            src="/water.png"
                            alt="수위계"
                            className="h-6 w-6 mx-auto object-contain"
                          />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                            소하천
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate px-2">
                          {item.NM_DIST_OBSV || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={statusClass}>
                          {isNormal ? "정상" : "점검"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono px-1">
                          {item.waterLevel ? (
                            <span className="font-bold">{item.waterLevel} <span className="text-[10px] text-slate-400 dark:text-slate-500">M</span></span>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRow === item.IDX && (
                      <TableRow className="bg-slate-50/30 dark:bg-slate-900/30">
                        <TableCell colSpan={6} className="p-4 sm:p-6">
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* 기본 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="p-5 space-y-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                  <MapPin size={16} /> 기본 정보
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">주소</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-medium text-right">
                                      {item.DTL_ADRES || "-"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">법정동코드</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono">{item.BDONG_CD || "-"}</span>
                                  </div>
                                  <div className="flex justify-between py-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">좌표</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono">
                                      {item.LAT} / {item.LON}
                                    </span>
                                  </div>
                                </div>
                              </Card>

                              <Card className="p-5 space-y-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                  <Activity size={16} /> 로거 데이터
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">로거 시간</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                      {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">부팅 시간</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                      {item.LOGGER_UPTIME ? dayjs(item.LOGGER_UPTIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">GL</p>
                                      <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                                        {item.LOGGER_GL || "0.00"} M
                                      </p>
                                    </div>
                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-center border border-teal-100 dark:border-teal-800">
                                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mb-1">FL</p>
                                      <p className="text-lg font-black text-teal-700 dark:text-teal-300">
                                        {item.LOGGER_FL || "0.00"} M
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </div>

                            {/* API 연계 정보 */}
                            <Card className="p-5 space-y-4 bg-amber-50/30 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-sm rounded-2xl">
                              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={16} /> 국립재난안전연구원 API 연계
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-amber-100 dark:border-amber-900">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">서비스키</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-mono text-xs truncate max-w-[200px]">
                                    {item.serviceKey || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-amber-100 dark:border-amber-900">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">API 연계 상태</span>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      item.ResultCode === "OK"
                                        ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    } font-black text-[10px] px-2 py-1 rounded-full`}
                                  >
                                    {item.ResultCode || "-"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between py-2 border-b border-amber-100 dark:border-amber-900">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">API 전송시간</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                    {item.observationDateTime ? dayjs(item.observationDateTime).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg text-center border border-amber-100 dark:border-amber-800">
                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-1">수위(FL)</p>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-300 mb-1.5">
                                      {item.waterLevel || "-"}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        item.waterLevelStatusCode === "00"
                                          ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                          : "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                      } font-black text-[8px] px-1.5 py-0.5 rounded-full`}
                                    >
                                      {item.waterLevelStatusCode === "00" ? "정상" : "점검"}
                                    </Badge>
                                  </div>
                                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg text-center border border-amber-100 dark:border-amber-800">
                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-1">유량(㎧)</p>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-300 mb-1.5">
                                      {item.averageVelocity || "-"}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        item.velocityStatusCode === "10"
                                          ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                          : "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                      } font-black text-[8px] px-1.5 py-0.5 rounded-full`}
                                    >
                                      {item.velocityStatusCode === "10" ? "정상" : "점검"}
                                    </Badge>
                                  </div>
                                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg text-center border border-amber-100 dark:border-amber-800">
                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-1">유속(㎥/s)</p>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-300 mb-1.5">
                                      {item.totalDischarge || "-"}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        item.dischargeStatusCode === "20"
                                          ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                          : "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                      } font-black text-[8px] px-1.5 py-0.5 rounded-full`}
                                    >
                                      {item.dischargeStatusCode === "20" ? "정상" : "점검"}
                                    </Badge>
                                  </div>
                                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg text-center border border-amber-100 dark:border-amber-800">
                                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-1">UPS</p>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-300 mb-1.5">
                                      -
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        item.upsStatusCode === "00"
                                          ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                          : "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                      } font-black text-[8px] px-1.5 py-0.5 rounded-full`}
                                    >
                                      {item.upsStatusCode === "00" ? "정상" : "점검"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="relative py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6 bg-white dark:bg-slate-900 rounded-b-3xl z-10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                전체 <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span>개 중{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>
                -
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                표시
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-3 py-1.5 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{currentPage}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">/</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WeatherSRPage;
