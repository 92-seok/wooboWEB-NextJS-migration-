"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  RotateCw,
  Pencil,
  Key,
  Trash2,
  UserCheck,
  UserMinus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

const AdminPage = () => {
  const [search, setSearch] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  // 모의 데이터
  const mockUsers = [
    { id: 1, username: "admin", name: "관리자", role: "admin", isActive: true, lastLoginAt: "2025-02-05 14:20" },
    { id: 2, username: "user1", name: "홍길동", role: "user", isActive: true, lastLoginAt: "2025-02-04 09:15" },
    { id: 3, username: "guest1", name: "임꺽정", role: "guest", isActive: false, lastLoginAt: "2025-02-01 18:30" },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">관리자</Badge>;
      case 'user': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">사용자</Badge>;
      case 'operator': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">일반</Badge>;
      default: return <Badge variant="outline">게스트</Badge>;
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-700" /> 사용자 관리
          </h1>
          <p className="text-xs text-slate-500 mt-1">시스템 접속 권한 및 사용자 계정을 관리합니다.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 text-blue-700 border-blue-200">
          <RotateCw className="h-4 w-4" /> 새로고침
        </Button>
      </div>

      {/* 필터 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">사용자 검색</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="아이디 또는 이름으로 검색"
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">권한 필터</label>
          <Select defaultValue="all">
            <SelectTrigger className="h-10">
              <SelectValue placeholder="전체 권한" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 권한</SelectItem>
              <SelectItem value="admin">관리자</SelectItem>
              <SelectItem value="user">사용자</SelectItem>
              <SelectItem value="operator">일반</SelectItem>
              <SelectItem value="guest">게스트</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 사용자 테이블 */}
      <Card className="overflow-hidden border-none shadow-sm rounded-lg border-t-2 border-blue-700">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-center w-[80px]">번호</TableHead>
              <TableHead className="text-center">사용자 정보</TableHead>
              <TableHead className="text-center w-[120px]">권한</TableHead>
              <TableHead className="text-center w-[120px]">로그인 제어</TableHead>
              <TableHead className="text-center w-[180px]">최근 접속</TableHead>
              <TableHead className="text-center w-[150px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="text-center text-xs font-mono text-slate-500">{index + 1}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-center">
                  {user.isActive ? (
                    <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-medium">
                      <UserCheck className="h-3 w-3" /> 사용가능
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-medium">
                      <UserMinus className="h-3 w-3" /> 사용불가
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center text-xs text-slate-500 font-mono italic">
                  {user.lastLoginAt}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setIsEditDialogOpen(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500">
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {/* 수정 다이얼로그 (간이 구현) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogDescription>권한 및 계정 상태를 변경합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">권한 설정</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                  <SelectItem value="operator">일반</SelectItem>
                  <SelectItem value="guest">게스트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="text-sm font-medium">로그인 허용</span>
              <Button size="sm" variant="outline">ON</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
            <Button className="bg-blue-700 hover:bg-blue-800">저장하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPage;
