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
  Monitor,
  AlertCircle,
  Clock,
  MapPin,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { weathersiApi } from "@/lib/api";
import { WeatherDevice } from "@/lib/types";
import { DataSyncIndicator } from "@/components/ui/data-sync-indicator";
import { getDeviceImageSrc, getDeviceTypeName } from "@/lib/deviceIcons";
import { calculateDaysSince, getDaysColorClass, isImageUrl, isHtmlContent } from "@/lib/dataDisplay";
import dayjs from "dayjs";

const PROVINCE_GROUPS = [
  { name: "전국", codes: [] },
  { name: "경기도/서울/인천", codes: ["11", "28", "41"] },
  { name: "전라도", codes: ["29", "45", "46"] },
  { name: "경상도", codes: ["26", "27", "31", "47", "48"] },
  { name: "충청도", codes: ["30", "36", "43", "44"] },
  { name: "강원도", codes: ["42", "51"] },
  { name: "제주도", codes: ["50"] },
];

const ErrorDevicesPage = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState(PROVINCE_GROUPS[0]);
  const [devices, setDevices] = useState<WeatherDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const ITEMS_PER_PAGE = 50;

  const loadErrorDevices = async () => {
    setLoading(true);
    try {
      const res = await weathersiApi.getErrorDevices();
      if (res && res.success) {
        setDevices(res.data || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("에러 장비 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrorDevices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, searchQuery]);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      (d.NM_DIST_OBSV || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.CD_DIST_OBSV || "").includes(searchQuery);
    const sidoCode = String(d.BDONG_CD || "").substring(0, 2);
    const matchesProvince =
      selectedProvince.codes.length === 0 || selectedProvince.codes.includes(sidoCode);
    return matchesSearch && matchesProvince;
  });

  const totalItems = filteredDevices.length;
  const normalCount = 0; // 점검필요 페이지에는 정상 장비 없음
  const errorCount = totalItems;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDeviceIcon = (gb: unknown) => {
    const code = String(gb || "").padStart(2, "0");
    switch (code) {
      case "01":
        return "📡";
      case "02":
        return "💧";
      case "08":
        return "❄️";
      case "20":
        return "🚧";
      case "18":
      case "21":
        return "📢";
      case "17":
        return "🖼️";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-32 px-4 sm:px-8 lg:px-12 mt-8">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            점검 필요 장비 현황
          </h1>
          <DataSyncIndicator loading={loading} lastUpdated={lastUpdated} variant="red" />
        </div>
        <Button
          onClick={loadErrorDevices}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
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

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 items-end">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            지역 필터
          </label>
          <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
            {PROVINCE_GROUPS.map((prov) => (
              <Button
                key={prov.name}
                variant={selectedProvince.name === prov.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedProvince(prov)}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  selectedProvince.name === prov.name
                    ? "bg-red-600 dark:bg-red-700 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {prov.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors" />
          <Input
            placeholder="장비명 또는 코드 검색..."
            className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-red-500/20 dark:focus:ring-red-500/30 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 목록 본문 */}
      <div className="space-y-6">
        <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white dark:bg-slate-800 border-t-4 border-red-500 dark:border-red-600">
          <div className="overflow-x-auto overscroll-x-contain">
            <Table className="w-full min-w-[650px]">
              <colgroup>
                <col className="w-10" />
                <col className="w-12" />
                <col className="w-20" />
                <col />
                <col className="w-28" />
                <col className="w-20" />
              </colgroup>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                <TableRow className="h-12 hover:bg-transparent">
                  <TableHead className="px-2"></TableHead>
                  <TableHead className="text-center font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    No
                  </TableHead>
                  <TableHead className="text-center font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    유형
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-xs text-center">
                    장비명
                  </TableHead>
                  <TableHead className="text-center font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    마지막 통신
                  </TableHead>
                  <TableHead className="text-center font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    경과일
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-60 text-center">
                      <div className="animate-spin h-10 w-10 border-4 border-red-500 dark:border-red-600 border-t-transparent rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedDevices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-60 text-center text-slate-400 dark:text-slate-500 font-bold text-base"
                    >
                      점검이 필요한 장비가 없습니다. ✨
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDevices.map((item, index) => {
                    const days = calculateDaysSince(item.LastDate);
                    const daysColorClass = getDaysColorClass(days);
                    const deviceImage = getDeviceImageSrc(item.GB_OBSV);
                    const deviceTypeName = getDeviceTypeName(item.GB_OBSV);

                    return (
                      <React.Fragment key={item.IDX}>
                        <TableRow
                          className={`h-14 border-b dark:border-slate-700 transition-all cursor-pointer ${
                            expandedRow === item.IDX
                              ? "bg-red-50/50 dark:bg-red-900/10"
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                          }`}
                          onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                        >
                          <TableCell className="text-center px-2">
                            {expandedRow === item.IDX ? (
                              <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400 mx-auto" />
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
                                src={deviceImage}
                                alt={deviceTypeName}
                                className="h-5 w-5 object-contain"
                              />
                              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                {deviceTypeName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate px-2">
                              {item.NM_DIST_OBSV || "-"}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {item.CD_DIST_OBSV || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                              {item.LastDate
                                ? dayjs(item.LastDate).format("M/D HH:mm")
                                : "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`${daysColorClass} font-black text-[10px] px-2 py-1 rounded-full`}
                            >
                              {days !== null ? `${days}일` : "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                    {expandedRow === item.IDX && (
                      <TableRow className="bg-transparent border-none">
                        <TableCell colSpan={6} className="p-1 sm:p-10 sm:pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <Card className="p-5 sm:p-8 space-y-5 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 shadow-inner">
                                  <MapPin size={24} />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                  설치 정보
                                </h4>
                              </div>
                              <div className="space-y-4 text-sm font-bold">
                                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-700">
                                  <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase">
                                    설치 주소
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200 tracking-tight">
                                    {item.DTL_ADRES || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-700">
                                  <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase">
                                    GPS 좌표
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200 font-mono italic">
                                    {item.LAT} / {item.LON}
                                  </span>
                                </div>
                              </div>
                            </Card>
                            <Card className="p-5 sm:p-8 space-y-5 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-600 dark:text-orange-400 shadow-inner">
                                  <Clock size={24} />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                  상태 및 연결
                                </h4>
                              </div>
                              <div className="space-y-4 text-sm font-bold">
                                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-700">
                                  <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase">
                                    마지막 수신
                                  </span>
                                  <span className="text-red-500 dark:text-red-400 font-black">
                                    {item.LastDate || "응답 없음"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-700">
                                  <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase">
                                    노드 주소
                                  </span>
                                  <span className="text-slate-800 dark:text-slate-200 font-mono tracking-tighter">
                                    {item.IP || "오프라인"} : {item.PORT || "####"}
                                  </span>
                                </div>
                                <div className="pt-2">
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-medium text-center">
                                    ※ 원격으로 장비의 로그를 확인하고 재부팅 명령을 전송합니다.
                                  </p>
                                  <Button className="w-full h-14 bg-slate-900 dark:bg-slate-700 rounded-2xl font-black text-[11px] gap-3 shadow-2xl active:scale-95 transition-all">
                                    <Settings size={18} /> 장비 정밀 진단 도구
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )}
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
        </div>
        {totalPages > 0 && (
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              전체 <span className="font-bold text-red-600 dark:text-red-400">{totalItems}</span>개 중{" "}
              <span className="font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> ~{" "}
              <span className="font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> 표시
            </p>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1.5 flex items-center gap-1.5">
                <span className="text-xs font-black text-red-600 dark:text-red-400">{currentPage}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">/</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{totalPages}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
  );
};

export default ErrorDevicesPage;
