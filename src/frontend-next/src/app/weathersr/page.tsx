"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
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
  Waves,
  Cpu,
  Share2,
  MapPin,
  Clock,
  Activity
} from "lucide-react";
import { weathersrApi } from '@/lib/api';

const PROVINCE_GROUPS = [
  { name: "전국", codes: [] },
  { name: "경기도/서울/인천", codes: ["11", "28", "41"] },
  { name: "전라도", codes: ["29", "45", "46"] },
  { name: "경상도", codes: ["26", "27", "31", "47", "48"] },
  { name: "충청도", codes: ["30", "36", "43", "44"] },
  { name: "강원도", codes: ["42", "51"] },
  { name: "제주도", codes: ["50"] },
];

const WeatherSRPage = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState(PROVINCE_GROUPS[0]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await weathersrApi.getDevices();
      if (res && res.success) {
        setDevices(res.data || []);
      }
    } catch (err) {
      console.error("SR 장비 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, searchQuery]);

  const filteredDevices = devices.filter(d => {
    const matchesSearch = (d.NM_DIST_OBSV || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.IDX || "").includes(searchQuery);
    const sidoCode = String(d.BDONG_CD || "").substring(0, 2);
    const matchesProvince = selectedProvince.codes.length === 0 || selectedProvince.codes.includes(sidoCode);
    return matchesSearch && matchesProvince;
  });

  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-32 px-6 sm:px-12 lg:px-16 mt-12">
      {/* 지역 필터 */}
      <div className="space-y-4">
        <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider pl-1">
          <Monitor className="h-3 w-3 text-indigo-600" /> Area Filter
        </label>
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200/60 shadow-sm">
          {PROVINCE_GROUPS.map((prov) => (
            <Button
              key={prov.name}
              variant={selectedProvince.name === prov.name ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedProvince(prov)}
              className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all ${selectedProvince.name === prov.name ? 'bg-indigo-700 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
              {prov.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            수위 관측 리스트
            <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50/30 font-bold rounded-lg px-2">
              {selectedProvince.name}
            </Badge>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium italic">실시간 수위 및 유입량 현황을 모니터링합니다. (총 {totalItems}개)</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold" />
            <input
              placeholder="관측소명 또는 코드 검색"
              className="w-full pl-9 pr-4 h-11 text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-2xl bg-white shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadDevices}
            className="h-11 w-11 shrink-0 border-slate-200 bg-white rounded-2xl"
          >
            <RotateCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 장비 테이블 및 모바일 카드 리스트 */}
      <div className="space-y-4 font-sans">
        {/* 데스크탑 테이블 뷰 */}
        <Card className="overflow-hidden border-none shadow-xl rounded-[2rem] border-t-4 border-indigo-700 bg-white">
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader className="bg-slate-50/50 border-b">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[30px] sm:w-[50px] px-1"></TableHead>
                  <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">번호</TableHead>
                  <TableHead className="w-[40px] sm:w-[120px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">지역</TableHead>
                  <TableHead className="font-bold text-slate-800 text-center text-[9px] sm:text-[12px] px-0.5">관측소명</TableHead>
                  <TableHead className="w-[40px] sm:w-[100px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">상태</TableHead>
                  <TableHead className="w-[50px] sm:w-[140px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">수위</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-60 text-center text-slate-400">데이터를 로드 중입니다...</TableCell></TableRow>
                ) : paginatedDevices.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-60 text-center text-slate-400">조회된 데이터가 없습니다.</TableCell></TableRow>
                ) : paginatedDevices.map((item, index) => (
                  <React.Fragment key={item.IDX}>
                    <TableRow
                      className={`h-14 border-b transition-all cursor-pointer ${expandedRow === item.IDX ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                      onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                    >
                      <TableCell className="text-center px-1">{expandedRow === item.IDX ? <ChevronUp className="h-4 w-4 text-indigo-600 mx-auto" /> : <ChevronDown className="h-4 w-4 text-slate-300 mx-auto" />}</TableCell>
                      <TableCell className="text-center font-mono text-[9px] sm:text-[11px] text-slate-400 px-0.5">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell className="text-center font-bold text-slate-600 text-[9px] sm:text-[12px] px-0.5 truncate max-w-[50px] sm:max-w-none">{item.BDONG_CD?.substring(0, 5)}</TableCell>
                      <TableCell className="font-black text-slate-800 text-center text-[9px] sm:text-[14px] truncate px-0.5 tracking-tighter">{item.NM_DIST_OBSV}</TableCell>
                      <TableCell className="text-center px-0.5">
                        <Badge className={`px-1 py-0.5 text-[8px] sm:text-[10px] font-black border-none justify-center w-full sm:w-auto mx-auto ${item.STATUS === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                          {item.STATUS === 'OK' ? '정상' : '점검'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-indigo-700 font-black text-[9px] sm:text-sm px-0.5">
                        {item.waterLevel || '-'} <span className="text-[8px] text-slate-300 ml-0.5 sm:ml-1 hidden sm:inline">M</span>
                      </TableCell>
                    </TableRow>

                    {expandedRow === item.IDX && (
                      <TableRow className="bg-slate-50/30">
                        <TableCell colSpan={6} className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                            {/* 기본 정보 */}
                            <Card className="p-5 space-y-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> 기본 정보
                              </h4>
                              <div className="space-y-3 text-[12px]">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">주소</span>
                                  <span className="text-slate-800 font-medium">{item.DTL_ADRES || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">좌표</span>
                                  <span className="text-slate-800 font-mono italic">{item.LAT} / {item.LON}</span>
                                </div>
                                <Button variant="outline" className="w-full text-[10px] h-8 rounded-xl border-slate-200 mt-2">
                                  <Activity className="h-3 w-3 mr-2 text-green-500" /> 외부 지도 보기
                                </Button>
                              </div>
                            </Card>

                            {/* 로거 관측 정보 */}
                            <Card className="p-5 space-y-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Cpu className="h-3.5 w-3.5" /> 로거 관측 정보
                              </h4>
                              <div className="space-y-3 text-[12px]">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">최근 통신</span>
                                  <span className="text-slate-800 font-mono italic">{item.LOGGER_TIME || '-'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">GL</p>
                                    <p className="text-sm font-black text-indigo-600">{item.LOGGER_GL || '0.00'}</p>
                                  </div>
                                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">FL</p>
                                    <p className="text-sm font-black text-teal-600">{item.LOGGER_FL || '0.00'}</p>
                                  </div>
                                </div>
                              </div>
                            </Card>

                            {/* NDMI API 연계 */}
                            <Card className="p-5 space-y-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Share2 className="h-3.5 w-3.5" /> NDMI 연계 정보
                              </h4>
                              <div className="space-y-3 text-[12px]">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">상태</span>
                                  <Badge className="bg-blue-500 h-4 text-[9px] px-2 rounded-full font-black">정상 연동</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">수위</p>
                                    <p className="text-[13px] font-black">{item.waterLevel || '0.0'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">유속</p>
                                    <p className="text-[13px] font-black">{item.averageVelocity || '0.0'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Disch</p>
                                    <p className="text-[13px] font-black">{item.totalDischarge || '0.0'}</p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* 모바일 카드 리스트 뷰 */}
        <div className="hidden"> {/* This div is now hidden */}
          {loading ? (
            <div className="p-20 text-center text-slate-400">데이터 로드 중...</div>
          ) : paginatedDevices.map((item, index) => (
            <Card key={item.IDX} className="p-5 rounded-3xl border-none shadow-lg bg-white space-y-4 overflow-hidden relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">{item.NM_DIST_OBSV}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{item.IDX}</p>
                  </div>
                </div>
                <Badge className={`px-2.5 py-1 text-[10px] font-black border-none ${item.STATUS === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.STATUS === 'OK' ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Water Level</p>
                  <p className="text-xl font-black text-indigo-700">{item.waterLevel || '-'}<span className="text-xs ml-1 font-bold">M</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 font-bold mb-1">Last Update</p>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-[11px] font-bold truncate max-w-[80px]">{item.LOGGER_TIME?.split(' ')[1] || '-'}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full h-10 rounded-2xl bg-indigo-50/50 text-indigo-600 text-xs font-black gap-2"
                onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
              >
                상세 정보 보기 {expandedRow === item.IDX ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>

              {expandedRow === item.IDX && (
                <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase pl-1">Address</p>
                    <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium">
                      {item.DTL_ADRES || '정보 없음'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase pl-1">GL/FL Level</p>
                      <div className="p-3 bg-slate-50 rounded-2xl text-[12px] font-black text-blue-600 text-center">
                        {item.LOGGER_GL || '0.0'}/{item.LOGGER_FL || '0.0'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase pl-1">NDMI Sync</p>
                      <div className="p-3 bg-slate-50 rounded-2xl text-[12px] font-black text-teal-600 text-center">
                        {item.totalDischarge || '0.0'} m³/s
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* 페이징 컨트롤 */}
        {totalPages > 0 && (
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Showing <span className="font-bold text-indigo-600">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-indigo-600">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span>
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

export default WeatherSRPage;