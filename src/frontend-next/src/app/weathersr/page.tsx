"use client";

import React, { useState } from 'react';
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
  MapPin,
  Search,
  RotateCw,
  LayoutList,
  Waves,
  Cpu,
  Share2
} from "lucide-react";

const WeatherSRPage = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("전국");

  const regions = ["전국", "전라도", "경상도", "충청도", "강원도", "경기도", "인천/제주도"];

  const mockData = [
    {
      id: 1, region: "진안군", deviceName: "군상", status: "정상", data: "1.25 M",
      address: "군상리 650-1", latLon: "35.7924 / 127.4368",
      loggerTime: "2025-11-21 10:20:00",
      loggerUptime: "2025-10-01 09:00:00",
      gl: "1.25 M", fl: "1.10 M",
      apiStatus: "OK", waterLevel: "1.22", velocity: "0.45", discharge: "12.5"
    },
    {
      id: 2, region: "남동구", deviceName: "남동", status: "정상", data: "1.25 M",
      address: "남동구 111-1", latLon: "35.7924 / 127.4368",
      loggerTime: "2025-11-21 10:20:00",
      loggerUptime: "2025-10-01 09:00:00",
      gl: "1.25 M", fl: "1.10 M",
      apiStatus: "OK", waterLevel: "1.22", velocity: "0.45", discharge: "12.5"
    },
    {
      id: 3, region: "철원군", deviceName: "철원", status: "정상", data: "1.25 M",
      address: "철원군 1111-1", latLon: "35.7924 / 127.4368",
      loggerTime: "2025-11-21 10:20:00",
      loggerUptime: "2025-10-01 09:00:00",
      gl: "1.25 M", fl: "1.10 M",
      apiStatus: "OK", waterLevel: "1.22", velocity: "0.45", discharge: "12.5"
    },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* 지역 필터 */}
      <div className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1">
        {regions.map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedRegion(region)}
            className={`rounded-md px-3 py-0.5 h-7 text-[14px] font-medium transition-all ${selectedRegion === region ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-600'
              }`}
          >
            {region}
          </Button>
        ))}
      </div>

      {/* 지역 검색 표시줄 (이미지 상단 텍스트 영역) */}
      <div className="bg-white border text-sm p-3 rounded-md shadow-sm">
        <span className="text-slate-400 mr-2">지역 검색</span>
        <span className="font-bold text-slate-700">{selectedRegion}</span>
      </div>

      {/* 컨트롤 바 (장비 목록 버튼 & 검색창) */}
      <div className="flex justify-between items-center gap-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-indigo-200 text-indigo-700 font-bold gap-1.5">
            <LayoutList className="h-4 w-4" />
            장비 목록
            <RotateCw className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="장비 검색"
            className="pl-9 h-8 text-xs border-slate-200 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 장비 리스트 테이블 */}
      <Card className="overflow-hidden border-none shadow-sm rounded-none border-t-2 border-indigo-700">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[60px] text-center text-[12px] font-bold text-slate-800">번호</TableHead>
              <TableHead className="w-[100px] text-[12px] font-bold text-slate-800">지역</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800">장비명</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800 w-[120px]">상태</TableHead>
              <TableHead className="text-right text-[12px] font-bold text-slate-800 w-[150px]">수위(GL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  className={`h-9 border-b transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}
                  onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                >
                  <TableCell className="text-center p-1">
                    {expandedRow === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </TableCell>
                  <TableCell className="text-center text-slate-500 font-mono text-xs p-1">{item.id}</TableCell>
                  <TableCell className="font-bold text-sm p-1 text-slate-700">{item.region}</TableCell>
                  <TableCell className="font-bold text-center p-1 text-slate-800">{item.deviceName}</TableCell>
                  <TableCell className="text-center p-1">
                    <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] border-none font-medium ${item.status === '정상' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600 p-1">{item.data}</TableCell>
                </TableRow>

                {/* 3. 상세 확장 영역 (SI와 동일 규격 적용) */}
                {expandedRow === item.id && (
                  <TableRow className="bg-slate-50/50 border-t-0">
                    <TableCell colSpan={6} className="p-4 pt-0">
                      <div className="border rounded-lg bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* 상세 헤더 */}
                        <div className="bg-blue-600 text-white text-center py-1.5 text-sm font-bold flex items-center justify-center gap-2">
                          <Waves className="h-4 w-4" /> {item.deviceName} 상세 정보
                        </div>

                        {/* 기본 정보 */}
                        <div className="grid grid-cols-3 text-sm border-b text-center">
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">주소</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 text-xs">{item.address}</div>
                          </div>
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">위/경도</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 font-mono italic text-xs">{item.latLon}</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">지도</div>
                            <div className="flex items-center justify-center h-10">
                              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 px-3 border-slate-200">
                                <MapPin className="h-3 w-3 text-green-600" />네이버 지도
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* 로거 정보 */}
                        <div className="bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 flex items-center gap-1 border-b">
                          <Cpu className="h-3.5 w-3.5" /> 로거 정보
                        </div>
                        <div className="grid grid-cols-3 text-sm border-b text-center">
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">로거시간</div>
                            <div className="flex items-center justify-center h-10 px-2 font-mono text-slate-600 text-xs">{item.loggerTime}</div>
                          </div>
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">부팅시간</div>
                            <div className="flex items-center justify-center h-10 px-2 font-mono text-slate-600 text-xs">{item.loggerUptime}</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">수위 (GL/FL)</div>
                            <div className="flex items-center justify-center h-10 px-2 font-bold text-blue-600 text-xs">{item.gl} / {item.fl}</div>
                          </div>
                        </div>

                        {/* API 연계 */}
                        <div className="bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700 flex items-center gap-1 border-b">
                          <Share2 className="h-3.5 w-3.5" /> NDMI API 연계 현황
                        </div>
                        <div className="grid grid-cols-4 text-sm text-center">
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">연계상태</div>
                            <div className="flex items-center justify-center h-10"><Badge className="bg-green-500 h-4 text-[9px] px-1.5">{item.apiStatus}</Badge></div>
                          </div>
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">수위</div>
                            <div className="flex items-center justify-center h-10 text-slate-600 text-xs">{item.waterLevel}</div>
                          </div>
                          <div className="border-r flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">유속</div>
                            <div className="flex items-center justify-center h-10 text-slate-600 text-xs">{item.velocity}</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">유량</div>
                            <div className="flex items-center justify-center h-10 text-slate-600 text-xs">{item.discharge}</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WeatherSRPage;