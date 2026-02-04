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
  Settings, Activity, Play, Volume2, Lock, Unlock, AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";


const WeatherSIPage = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [selectedControlItem, setSelectedControlItem] = useState<any>(null);
  const [testMessage, setTestMessage] = useState("");

  // 지역 필터 목록
  const regions = ["전국", "전라도", "경상도", "충청도", "강원도", "경기도", "인천/제주도"];

  const mockData = [
    {
      id: 1, region: "진안군", type: "📡", deviceName: "군상", status: "정상", data: "0",
      address: "군상리 650-1", latLon: "35.7924 / 127.4368", commTime: "2025-11-21 10:20:00",
      cid: "-", ipPort: "192.168.10.2 /"
    },
    {
      id: 2, region: "남동구", type: "📡", deviceName: "남동구청", status: "정상", data: "0.0 mm/day",
      address: "만수동 123", latLon: "37.1234 / 126.5678", commTime: "2025-11-21 10:25:00",
      cid: "1234", ipPort: "192.168.10.5 /"
    },
    {
      id: 11, region: "음성군", type: "📡", deviceName: "목골지구", status: "점검필요", data: "-",
      address: "음성읍 456", latLon: "36.5555 / 127.1111", commTime: "2025-11-21 09:10:00",
      cid: "9999", ipPort: "192.168.10.11 /"
    },
  ];

  // 제어 창 열기 함수
  const handleOpenControl = (item: any) => {
    setSelectedControlItem(item);
    setTestMessage("");
    setControlDialogOpen(true);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 상단 지역 필터 (Purple Chips) */}
      <div className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1">
        {regions.map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedRegion(region)}
            className={`rounded-md px-3 py-0.5 h-7 text-[14px] font-medium transition-all ${selectedRegion === region ? 'bg-indigo-700 text-white' : 'text-slate-600'
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
              <TableHead className="w-[60px] text-center font-bold text-slate-800 text-[12px]">번호</TableHead>
              <TableHead className="w-[100px] font-bold text-slate-800 text-[12px]">지역</TableHead>
              <TableHead className="w-[80px] font-bold text-slate-800 text-[12px]">종류</TableHead>
              <TableHead className="font-bold text-slate-800 text-center text-[12px]">장비명</TableHead>
              <TableHead className="font-bold text-slate-800 text-center w-[120px] text-[12px]">상태</TableHead>
              <TableHead className="font-bold text-slate-800 text-right w-[150px] text-[12px]">데이터</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  className={`h-9 border-b transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'}`}
                  onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                >
                  <TableCell className="text-center p-1">
                    {expandedRow === item.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </TableCell>
                  <TableCell className="text-center text-slate-500 font-mono text-xs p-1">{item.id}</TableCell>
                  <TableCell className="font-bold text-slate-700 text-sm p-1">{item.region}</TableCell>
                  <TableCell className="text-xl p-1">{item.type}</TableCell>
                  <TableCell className="font-bold text-slate-800 text-center p-1">{item.deviceName}</TableCell>
                  <TableCell className="text-center p-1">
                    <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] border-none font-medium ${item.status === '정상' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-600 font-medium p-1">{item.data}</TableCell>
                </TableRow>

                {/* 확장 상세 섹션 (코드는 이전과 동일하나 스타일 유지) */}
                {expandedRow === item.id && (
                  <TableRow className="bg-slate-50/50">
                    <TableCell colSpan={7} className="p-4 pt-0">
                      {/* 상세 정보 카드 렌더링 (이전 답변 코드 참조) */}
                      <div className="border rounded-lg overflow-hidden bg-white shadow-md animate-in fade-in slide-in-from-top-2 duration-300">

                        {/* 장비명 헤더 (이미지와 같은 초록색/빨간색 바) */}
                        <div className={`text-white text-center py-1.5 text-sm font-bold ${item.status === '정상' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                          {item.deviceName}
                        </div>
                        {/* 첫 번째 정보 줄 (주소, 위/경도, 지도) */}
                        <div className="grid grid-cols-3 border-b text-center text-sm">
                          {/* 주소 칸 */}
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">주소</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600">
                              {item.address}
                            </div>
                          </div>

                          {/* 위/경도 칸 */}
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">위/경도</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600 font-mono italic">
                              {item.latLon}
                            </div>
                          </div>

                          {/* 지도 버튼 칸 */}
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">지도</div>
                            <div className="flex items-center justify-center h-10">
                              <Button variant="outline" size="sm" className="h-8 bg-white hover:bg-slate-50 border-slate-200 text-xs py-0">
                                <MapPin className="h-3 w-3 mr-1.5 text-green-600" />
                                네이버 지도
                              </Button>
                            </div>
                          </div>
                        </div>
                        {/* 두 번째 정보 줄 (통신시간, CID, IP/PORT) */}
                        <div className="grid grid-cols-3 text-center text-sm">

                          {/* 통신시간 */}
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">통신시간</div>
                            <div className="flex items-center justify-center h-10 px-2 font-mono text-slate-600">
                              {item.commTime}
                            </div>
                          </div>

                          {/* CID */}
                          <div className="flex flex-col border-r">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">CID</div>
                            <div className="flex items-center justify-center h-10 px-2 text-slate-600">
                              {item.cid}
                            </div>
                          </div>

                          {/* IP/PORT */}
                          <div className="flex flex-col">
                            <div className="bg-slate-100 py-1.5 font-bold border-b text-slate-700 text-[12px]">IP / PORT</div>
                            <div className="py-2.5 px-2 font-mono text-slate-600">{item.ipPort}</div>
                          </div>
                        </div>
                      </div>
                      {/* 상세 카드 하단 버튼 영역 */}
                      <div className="pt-3.5 bg-slate-50/50 border-t flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenControl(item)}
                          className="h-10 px-4 text-sm font-bold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50 gap-2.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          장비 테스트
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
      {/* 제어 다이얼로그 */}
      <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedControlItem?.type}</span>
              <span>{selectedControlItem?.deviceName} 장비 제어</span>
            </DialogTitle>
          </DialogHeader>
          {/* 방송장비(임시 구분) */}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Volume2 className="h-3 w-3" /> 테스트 방송 문구
              </label>
              <Textarea
                placeholder="방송할 내용을 입력하세요."
                className="resize-none h-32 text-sm focus:ring-indigo-500"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-indigo-700 hover:bg-indigo-800" onClick={() => setControlDialogOpen(false)}>
              전송하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeatherSIPage;