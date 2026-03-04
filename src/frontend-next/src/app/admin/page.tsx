"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
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
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { User } from "@/lib/types";
import { useCallback } from "react";
import dayjs from "dayjs";

const AdminPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // 다이얼로그 상태
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 폼 상태
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 권한 체크 (Strict Mode 중복 실행 방지)
  const authChecked = useRef(false);
  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;

    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        setIsAuthorized(true);
      } else {
        toast.error("관리자 권한이 필요합니다.");
        router.push("/");
      }
    } catch (e) {
      console.error("User data parse error:", e);
      router.push("/login");
    }
  }, [router]);

  // 사용자 목록 조회
  const loadUsers = useCallback(async () => {
    if (!isAuthorized) return;

    setLoading(true);
    try {
      const query: any = {
        page: currentPage,
        limit,
      };

      if (roleFilter !== "all") {
        query.role = roleFilter;
      }

      if (search) {
        query.search = search;
      }

      const response = await adminApi.getAllUsers(query);

      setUsers(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("사용자 목록 조회 실패:", error);
      toast.error(error.message || "사용자 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, currentPage, roleFilter, search]);

  useEffect(() => {
    if (isAuthorized) {
      loadUsers();
    }
  }, [isAuthorized, currentPage, roleFilter, loadUsers]);

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  // 수정 다이얼로그 열기
  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.isActive || false);
    setIsEditDialogOpen(true);
  };

  // 비밀번호 변경 다이얼로그 열기
  const handleOpenPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordDialogOpen(true);
  };

  // 삭제 다이얼로그 열기
  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 권한 및 상태 저장
  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      // 권한 변경
      if (editRole !== selectedUser.role) {
        await adminApi.updateUserRole(selectedUser.id, { role: editRole });
      }

      // 상태 변경
      if (editStatus !== selectedUser.isActive) {
        await adminApi.updateUserStatus(selectedUser.id, { isActive: editStatus });
      }

      toast.success("사용자 정보가 변경되었습니다.");
      setIsEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error("사용자 정보 변경 실패:", error);
      toast.error(error.message || "사용자 정보 변경에 실패했습니다.");
    }
  };

  // 비밀번호 변경
  const handleSavePassword = async () => {
    if (!selectedUser) return;

    if (newPassword !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      await adminApi.updateUserPassword(selectedUser.id, { newPassword });
      toast.success("비밀번호가 변경되었습니다.");
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      console.error("비밀번호 변경 실패:", error);
      toast.error(error.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteUser(selectedUser.id);
      toast.success("사용자가 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error("사용자 삭제 실패:", error);
      toast.error(error.message || "사용자 삭제에 실패했습니다.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-black text-[10px] px-2 py-1 rounded-full">관리자</Badge>
        );
      case "user":
        return (
          <Badge variant="outline" className="border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black text-[10px] px-2 py-1 rounded-full">사용자</Badge>
        );
      case "operator":
        return (
          <Badge variant="outline" className="border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-black text-[10px] px-2 py-1 rounded-full">일반</Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] px-2 py-1 rounded-full">
            게스트
          </Badge>
        );
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="page-container max-w-[1440px] mx-auto space-y-6 pb-32 lg:pb-32 px-4 sm:px-8 lg:px-12 mt-8" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
            사용자 관리
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
          onClick={loadUsers}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 필터 및 검색 섹션 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            권한 필터
          </label>
          <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("all")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${roleFilter === "all"
                ? "bg-cyan-600 dark:bg-cyan-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              전체 권한
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("admin")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${roleFilter === "admin"
                ? "bg-cyan-600 dark:bg-cyan-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              관리자
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("user")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${roleFilter === "user"
                ? "bg-cyan-600 dark:bg-cyan-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              사용자
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("operator")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${roleFilter === "operator"
                ? "bg-cyan-600 dark:bg-cyan-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              일반
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("guest")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-colors ${roleFilter === "guest"
                ? "bg-cyan-600 dark:bg-cyan-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              게스트
            </Button>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors" />
        <Input
          placeholder="아이디 또는 이름으로 검색..."
          className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-cyan-500/20 dark:focus:ring-cyan-500/30 transition-colors text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {/* 사용자 테이블 */}
      <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-cyan-600 dark:border-cyan-700 bg-white dark:bg-slate-800">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/80 border-b dark:border-slate-600">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                번호
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center text-[9px] sm:text-[12px] px-0.5">
                사용자 정보
              </TableHead>
              <TableHead className="w-[60px] sm:w-[90px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                권한
              </TableHead>
              <TableHead className="w-[60px] sm:w-[80px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                상태
              </TableHead>
              <TableHead className="hidden md:table-cell w-[120px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                최근 접속
              </TableHead>
              <TableHead className="w-[90px] sm:w-[140px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                관리
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center text-slate-400 dark:text-slate-500">
                  조회된 사용자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={`user-${currentPage}-${index}-${user.id}`}
                  className="h-14 border-b dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <TableCell className="text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-center">
                    {user.isActive ? (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-green-600 dark:text-green-400 text-[10px] sm:text-xs font-bold">
                        <UserCheck className="h-3 w-3" />
                        <span className="hidden sm:inline">활성</span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 text-red-500 dark:text-red-400 text-[10px] sm:text-xs font-bold">
                        <UserMinus className="h-3 w-3" />
                        <span className="hidden sm:inline">비활성</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {user.lastLoginAt ? dayjs(user.lastLoginAt).format("MM-DD HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-0.5 sm:gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30"
                        onClick={() => handleOpenEdit(user)}
                        title="권한 및 상태 수정"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        onClick={() => handleOpenPassword(user)}
                        title="비밀번호 변경"
                      >
                        <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => handleOpenDelete(user)}
                        title="사용자 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="relative py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6 bg-white dark:bg-slate-900 rounded-b-3xl z-10">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              전체 <span className="font-bold text-slate-800 dark:text-slate-200">{total}</span>개 중{" "}
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {(currentPage - 1) * limit + 1}
              </span>
              -
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {Math.min(currentPage * limit, total)}
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
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{currentPage}</span>
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

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px] dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">사용자 정보 수정</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              {selectedUser?.name}({selectedUser?.username})님의 권한 및 계정 상태를 변경합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium dark:text-slate-300">권한 설정</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                  <SelectValue placeholder="권한 선택" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="admin" className="dark:text-slate-200">관리자</SelectItem>
                  <SelectItem value="user" className="dark:text-slate-200">사용자</SelectItem>
                  <SelectItem value="operator" className="dark:text-slate-200">운영자</SelectItem>
                  <SelectItem value="guest" className="dark:text-slate-200">게스트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-md dark:bg-slate-700/50">
              <span className="text-sm font-medium dark:text-slate-300">로그인 허용</span>
              <Button
                size="sm"
                variant={editStatus ? "default" : "outline"}
                className={editStatus ? "dark:bg-blue-700 dark:hover:bg-blue-800" : "dark:border-slate-600 dark:text-slate-300"}
                onClick={() => setEditStatus(!editStatus)}
              >
                {editStatus ? "ON" : "OFF"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="dark:text-slate-300 dark:hover:bg-slate-700">
              취소
            </Button>
            <Button className="bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-700 dark:hover:bg-cyan-800" onClick={handleSaveEdit}>
              저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px] dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">비밀번호 변경</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              {selectedUser?.name}({selectedUser?.username})님의 비밀번호를 변경합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium dark:text-slate-300">새 비밀번호</Label>
              <Input
                type="password"
                placeholder="새 비밀번호 (최소 6자)"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium dark:text-slate-300">비밀번호 확인</Label>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordDialogOpen(false)} className="dark:text-slate-300 dark:hover:bg-slate-700">
              취소
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800" onClick={handleSavePassword}>
              비밀번호 변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">사용자 삭제</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              정말로 {selectedUser?.name}({selectedUser?.username})님을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="dark:text-slate-300 dark:hover:bg-slate-700">
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="dark:bg-red-700 dark:hover:bg-red-800">
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
