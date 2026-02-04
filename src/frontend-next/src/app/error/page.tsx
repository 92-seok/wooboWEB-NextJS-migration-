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
  AlertCircle,
  Clock
} from "lucide-react";

const ErrorDevicesPage = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("전국");

  const regions = ["전국", "전라도", "경상도", "충청도", "강원도", "경기도", "인천/제주도"];

  const mockData = [
    {
      id: 11, region: "음성군", type: "📡", deviceName: "목골지구", status: "통신오류",
      lastComm: "25-02-04 09시", daysSince: 5,
      address: "음성읍 456", latLon: "36.5555 / 127.1111", phone: "010-1234-5678", ipPort: "192.168.10.11 / 8080"
    },
    // ... 추가 데이터
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* 1. 지역 필터 (SI/SR와 100% 동일 규격) */}
      <div className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1">
        {regions.map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedRegion(region)}
            className={`rounded-md px-3 py-0.5 h-7 text-[14px] font-medium transition-all ${selectedRegion === region ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600'
              }`}
          >
            {region}
          </Button>
        ))}
      </div>

      <div className="bg-white border text-sm p-3 rounded-md shadow-sm">
        <span className="text-slate-400 mr-2">지역 검색</span>
        <span className="font-bold text-slate-700">{selectedRegion}</span>
      </div>

      <div className="flex justify-between items-center gap-4 py-2">
        <Button variant="outline" size="sm" className="h-8 border-orange-200 text-orange-700 font-bold gap-1.5 text-xs">
          <AlertCircle className="h-4 w-4" /> 점검 필요 장비 <span className="text-red-600">28</span> 개소 <RotateCw className="h-3 w-3 ml-1" />
        </Button>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="장비 검색" className="pl-9 h-8 text-xs border-slate-200 focus:ring-orange-500" />
        </div>
      </div>

      {/* 2. 장비 리스트 테이블 (SI/SR와 100% 동일 규격) */}
      <Card className="overflow-hidden border-none shadow-sm rounded-none border-t-2 border-orange-600">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[60px] text-center text-[12px] font-bold text-slate-800">번호</TableHead>
              <TableHead className="w-[100px] text-[12px] font-bold text-slate-800">지역</TableHead>
              <TableHead className="w-[80px] text-[12px] font-bold text-slate-800 text-center">종류</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800">장비명</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800 w-[150px]">마지막 통신</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800 w-[100px]">경과일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  className={`h-9 border-b transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-orange-50/30' : 'hover:bg-slate-50/80'}`}
                  onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                >
                  <TableCell className="text-center p-1">
                    {expandedRow === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </TableCell>
                  <TableCell className="text-center text-xs font-mono text-slate-500 p-1">{item.id}</TableCell>
                  <TableCell className="font-bold text-sm p-1 text-slate-700">{item.region}</TableCell>
                  <TableCell className="text-xl p-1 text-center">{item.type}</TableCell>
                  <TableCell className="font-bold text-center p-1 text-slate-800">{item.deviceName}</TableCell>
                  <TableCell className="text-center text-xs p-1 text-slate-600">{item.lastComm}</TableCell>
                  <TableCell className="text-center p-1">
                    <Badge className="bg-red-100 text-red-700 text-[10px] h-5 border-none px-2 font-medium">
                      {item.daysSince}일 전
                    </Badge>
                  </TableCell>
                </TableRow>

                {/* 상세 확장 영역 (규격 동일) */}
                {expandedRow === item.id && (
                  <TableRow className="bg-slate-50/50 border-t-0">
                    <TableCell colSpan={7} className="p-4 pt-0">
                      <div className="border rounded-lg bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-red-600 text-white text-center py-1.5 text-sm font-bold">{item.deviceName} 상세 정보</div>

                        <div className="grid grid-cols-3 text-sm text-center border-b">
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

                        <div className="grid grid-cols-3 text-sm text-center">
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">마지막 통신</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 text-xs">{item.lastComm}</div>
                          </div>
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">CID</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 text-xs">{item.phone}</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">IP / PORT</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 font-mono text-xs">{item.ipPort}</div>
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

export default ErrorDevicesPage;