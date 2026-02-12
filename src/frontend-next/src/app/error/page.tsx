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
  Activity,
  Clock,
} from "lucide-react";
import { weathersiApi } from "@/lib/api";
import { WeatherDevice } from "@/lib/types";
import { getDeviceImageSrc, getDeviceTypeName } from "@/lib/deviceIcons";
import { getDeviceStatusBadgeClass, calculateDaysSince } from "@/lib/dataDisplay";
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
  const [currentTime, setCurrentTime] = useState(new Date());
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

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDaysColorClass = (days: number | null) => {
    if (days === null) return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600";
    if (days === 0) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700";
    if (days >= 1 && days <= 60) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    if (days >= 61 && days <= 365) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
    return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600";
  };

  return (
    <div className="page-container max-w-[1440px] mx-auto space-y-6 pb-32 lg:pb-32 px-4 sm:px-8 lg:px-12 mt-8" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
            점검 필요 장비 현황
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
          onClick={loadErrorDevices}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 필터 섹션 */}
      <div className="space-y-4">
        <div className="space-y-2">
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
      </div>

      {/* 검색 */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors" />
        <Input
          placeholder="장비명 또는 코드 검색..."
          className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-red-500/20 dark:focus:ring-red-500/30 transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 장비 테이블 */}
      <div className="space-y-4">
        <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-red-600 dark:border-red-700 bg-white dark:bg-slate-800">
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
                <TableHead className="w-[80px] sm:w-[160px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  마지막 통신
                </TableHead>
                <TableHead className="w-[50px] sm:w-[80px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  상태
                </TableHead>
                <TableHead className="w-[60px] sm:w-[90px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  경과일
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    데이터를 로드 중입니다...
                  </TableCell>
                </TableRow>
              ) : paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    조회된 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((item, index) => {
                  const isNormal = item.STATUS === "OK";
                  const statusClass = getDeviceStatusBadgeClass(isNormal);
                  const deviceImage = getDeviceImageSrc(item.GB_OBSV);
                  const deviceTypeName = getDeviceTypeName(item.GB_OBSV);
                  const days = calculateDaysSince(item.LastDate);
                  const daysColorClass = getDaysColorClass(days);
                  
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
                          <ChevronUp className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" />
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
                            className="h-6 w-6 mx-auto object-contain"
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
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono px-0.5">
                          {item.LastDate ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold">{dayjs(item.LastDate).format("MM-DD")}</span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400">{dayjs(item.LastDate).format("HH:mm")}</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${statusClass} ${!isNormal ? "animate-pulse" : ""}`}
                        >
                          {isNormal ? "정상" : "점검"}
                        </Badge>
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
                      <TableRow className="bg-slate-50/30 dark:bg-slate-900/30">
                        <TableCell colSpan={7} className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Card className="p-5 space-y-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                              <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
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
                              <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={16} /> 통신 정보
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">최근 통신</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-mono">
                                    {item.LastDate ? dayjs(item.LastDate).format("YYYY-MM-DD HH:mm") : "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">경과일</span>
                                  <Badge
                                    variant="outline"
                                    className={`${daysColorClass} font-black text-[10px] px-2 py-1 rounded-full`}
                                  >
                                    {days !== null ? `${days}일 전` : "-"}
                                  </Badge>
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

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="relative py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6 bg-white dark:bg-slate-900 rounded-b-3xl z-10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                전체 <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span>개 중{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>
                -
                <span className="font-bold text-red-600 dark:text-red-400">
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
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{currentPage}</span>
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

export default ErrorDevicesPage;
