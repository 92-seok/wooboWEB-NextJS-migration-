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
  const ITEMS_PER_PAGE = 50;

  const loadErrorDevices = async () => {
    setLoading(true);
    try {
      const res = await weathersiApi.getErrorDevices();
      if (res && res.success) {
        setDevices(res.data || []);
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
    <div className="max-w-[1440px] mx-auto space-y-8 pb-32 px-6 sm:px-12 lg:px-16 mt-12">
      {/* 긴급 알림 배너 */}
      <div className="bg-red-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-red-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border-b-8 border-red-700">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <ShieldAlert size={320} />
        </div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center animate-pulse border border-white/20">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic">점검 필요 장비 현황</h1>
            <p className="text-red-100 text-sm font-bold mt-2 opacity-90">
              수집 장애 발생 장비를 선제적으로 모니터링합니다. (총 {totalItems}개)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <Button
            onClick={loadErrorDevices}
            className="bg-white text-red-600 hover:bg-red-50 h-14 px-8 rounded-[1.5rem] font-black shadow-2xl shadow-red-900/40 gap-3 active:scale-95 transition-all"
          >
            <RotateCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /> 목록 새로고침
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em] pl-1 font-sans">
            <Monitor className="h-4 w-4 text-red-500" /> 지역 검색 필터
          </label>
          <div className="bg-white p-2 rounded-[1.5rem] flex flex-wrap gap-2 border border-slate-200 shadow-sm overflow-hidden">
            {PROVINCE_GROUPS.map((prov) => (
              <Button
                key={prov.name}
                variant={selectedProvince.name === prov.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedProvince(prov)}
                className={`h-10 px-5 rounded-xl text-[12px] font-black transition-all ${selectedProvince.name === prov.name ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {prov.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
          <Input
            placeholder="장애 장비명 또는 코드 검색..."
            className="h-14 pl-14 rounded-[1.5rem] border-slate-200 bg-white shadow-xl focus:ring-red-500/10 transition-all font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 목록 본문 */}
      <div className="space-y-6">
        <Card className="overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white border-t-8 border-red-500">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-slate-50/50 border-b">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="w-[30px] sm:w-[40px] px-1"></TableHead>
                <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-[9px] sm:text-[11px] text-slate-400 tracking-widest px-0.5">
                  번호
                </TableHead>
                <TableHead className="w-[40px] sm:w-[100px] text-center font-bold text-[9px] sm:text-[11px] text-slate-400 tracking-widest px-0.5">
                  분류
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-[9px] sm:text-[13px] text-center px-0.5">
                  장비명
                </TableHead>
                <TableHead className="w-[50px] sm:w-[120px] text-center font-bold text-[9px] sm:text-[11px] text-slate-400 tracking-widest px-0.5">
                  장애 발생
                </TableHead>
                <TableHead className="w-[50px] sm:w-[90px] text-center font-bold text-[9px] sm:text-[11px] text-slate-400 tracking-widest px-0.5">
                  중요도
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-80 text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-80 text-center text-slate-400 font-black text-lg"
                  >
                    점검이 필요한 장비가 없습니다. ✨
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((item, index) => (
                  <React.Fragment key={item.IDX}>
                    <TableRow
                      className={`h-16 border-b transition-all cursor-pointer ${expandedRow === item.IDX ? "bg-red-50/40" : "hover:bg-slate-50/50"}`}
                      onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                    >
                      <TableCell className="text-center px-1">
                        {expandedRow === item.IDX ? (
                          <ChevronUp className="h-4 w-4 text-red-600 mx-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-[9px] sm:text-[11px] text-slate-400 px-0.5">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-0.5">
                        <div className="inline-flex items-center gap-1 bg-slate-50 sm:bg-slate-100 px-1 sm:px-3 py-1 sm:py-1.5 rounded-sm sm:rounded-xl font-black text-[9px] sm:text-[1px] text-slate-500 uppercase">
                          <span>{getDeviceIcon(item.GB_OBSV)}</span>
                          <span className="hidden sm:inline">{item.GB_OBSV}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-center text-[9px] sm:text-[13px] tracking-tight truncate px-0.5">
                        {item.NM_DIST_OBSV}
                      </TableCell>
                      <TableCell className="text-center font-mono font-black text-red-400 text-[8px] sm:text-xs italic truncate max-w-[50px] sm:max-w-none px-0.5">
                        {item.LastDate || "UNKNOWN"}
                      </TableCell>
                      <TableCell className="text-center px-0.5">
                        <Badge className="bg-red-100 text-red-700 border-none font-black text-[8px] sm:text-[10px] px-1 sm:px-3 py-0.5 sm:py-1 rounded-lg animate-pulse justify-center w-full sm:w-auto">
                          점검
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {expandedRow === item.IDX && (
                      <TableRow className="bg-transparent border-none">
                        <TableCell colSpan={6} className="p-1 sm:p-10 sm:pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <Card className="p-5 sm:p-8 space-y-5 bg-white border-slate-100 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-inner">
                                  <MapPin size={24} />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                  설치 정보
                                </h4>
                              </div>
                              <div className="space-y-4 text-sm font-bold">
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                  <span className="text-slate-400 font-black text-[10px] uppercase">
                                    설치 주소
                                  </span>
                                  <span className="text-slate-800 tracking-tight">
                                    {item.DTL_ADRES || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                  <span className="text-slate-400 font-black text-[10px] uppercase">
                                    GPS 좌표
                                  </span>
                                  <span className="text-slate-800 font-mono italic">
                                    {item.LAT} / {item.LON}
                                  </span>
                                </div>
                              </div>
                            </Card>
                            <Card className="p-5 sm:p-8 space-y-5 bg-white border-slate-100 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shadow-inner">
                                  <Clock size={24} />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                  상태 및 연결
                                </h4>
                              </div>
                              <div className="space-y-4 text-sm font-bold">
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                  <span className="text-slate-400 font-black text-[10px] uppercase">
                                    마지막 수신
                                  </span>
                                  <span className="text-red-500 font-black">
                                    {item.LastDate || "응답 없음"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                  <span className="text-slate-400 font-black text-[10px] uppercase">
                                    노드 주소
                                  </span>
                                  <span className="text-slate-800 font-mono tracking-tighter">
                                    {item.IP || "오프라인"} : {item.PORT || "####"}
                                  </span>
                                </div>
                                <div className="pt-2">
                                  <p className="text-[10px] text-slate-400 mb-2 font-medium text-center">
                                    ※ 원격으로 장비의 로그를 확인하고 재부팅 명령을 전송합니다.
                                  </p>
                                  <Button className="w-full h-14 bg-slate-900 rounded-2xl font-black text-[11px] gap-3 shadow-2xl active:scale-95 transition-all">
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
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {totalPages > 0 && (
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Showing{" "}
              <span className="font-bold text-indigo-600">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-indigo-600">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-1.5 flex items-center gap-1.5">
                <span className="text-xs font-black text-indigo-600">{currentPage}</span>
                <span className="text-[10px] text-slate-300 font-bold italic">of</span>
                <span className="text-xs font-bold text-slate-400">{totalPages}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDevicesPage;
