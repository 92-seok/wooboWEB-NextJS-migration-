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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  History,
  RotateCw,
  Search,
  Filter,
  User,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SettingPage = () => {
  const [search, setSearch] = useState("");

  const mockHistory = [
    { id: 1, type: "📢 예경보", deviceName: "진안방송", user: "관리자(admin)", date: "2025-02-04 15:20:01", status: "제어성공" },
    { id: 2, type: "🚧 차단기", deviceName: "남동차단기", user: "관리자(admin)", date: "2025-02-04 14:55:12", status: "제어성공" },
    { id: 3, type: "📢 예경보", deviceName: "군상", user: "부관리자(user1)", date: "2025-02-04 13:10:05", status: "진행중" },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-700" /> 제어 이력 조회
          </h1>
          <p className="text-xs text-slate-500 mt-1">장비 제어 및 테스트 수행 기록을 확인합니다.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 text-indigo-700 border-indigo-200">
          <RotateCw className="h-4 w-4" /> 새로고침
        </Button>
      </div>

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">장비 유형</label>
          <Select>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="전체 장비" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 장비</SelectItem>
              <SelectItem value="broad">예경보</SelectItem>
              <SelectItem value="gate">차단기</SelectItem>
              <SelectItem value="gate">전광판</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">사용자 검색</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="사용자 ID 또는 이름" className="pl-9 h-9 text-xs" />
          </div>
        </div>
        <div className="space-y-1.5 flex flex-col items-end">
          <label className="text-[12px] font-bold text-slate-500 ml-1 text-right block mr-1">조회 개수</label>
          <Select defaultValue="10">
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="10개씩 보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개씩 보기</SelectItem>
              <SelectItem value="50">50개씩 보기</SelectItem>
              <SelectItem value="100">100개씩 보기</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <Card className="overflow-hidden border-none shadow-sm rounded-none border-t-2 border-indigo-700">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow className="h-9 hover:bg-transparent">
              <TableHead className="w-[60px] text-center text-[12px] font-bold text-slate-800">번호</TableHead>
              <TableHead className="w-[100px] text-center text-[12px] font-bold text-slate-800">유형</TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800">장비명</TableHead>
              <TableHead className="w-[150px] text-center text-[12px] font-bold text-slate-800">제어 사용자</TableHead>
              <TableHead className="w-[180px] text-center text-[12px] font-bold text-slate-800">제어 시간</TableHead>
              <TableHead className="w-[100px] text-center text-[12px] font-bold text-slate-800">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((item) => (
              <TableRow key={item.id} className="h-9 border-b hover:bg-slate-50/80 transition-colors">
                <TableCell className="text-center text-xs font-mono text-slate-500 p-1">{item.id}</TableCell>
                <TableCell className="text-center text-[11px] font-medium p-1">{item.type}</TableCell>
                <TableCell className="text-center font-bold text-slate-800 text-sm p-1">{item.deviceName}</TableCell>
                <TableCell className="text-center p-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                    <User className="h-3 w-3 text-indigo-500" /> {item.user}
                  </div>
                </TableCell>
                <TableCell className="text-center p-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500">
                    <Clock className="h-3 w-3" /> {item.date}
                  </div>
                </TableCell>
                <TableCell className="text-center p-1">
                  <Badge variant="outline" className={`px-2 py-0 h-5 text-[10px] border-none font-medium ${item.status === '제어성공' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SettingPage;