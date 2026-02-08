"use client";

import React, { useState, useEffect } from "react";
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
import { History, RotateCw, Search, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { ControlHistory } from "@/lib/types";
import dayjs from "dayjs";
import { DataSyncIndicator } from "@/components/ui/data-sync-indicator";
import { useCallback } from "react";

const SettingPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [history, setHistory] = useState<ControlHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  // 권한 체크
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("accessToken");
      const userStr = sessionStorage.getItem("user");

      if (!token || !userStr) {
        toast.error("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // admin과 user만 접근 가능
        if (user.role === "admin" || user.role === "user") {
          setIsAuthorized(true);
        } else {
          toast.error("접근 권한이 없습니다.");
          router.push("/");
        }
      } catch (e) {
        console.error("User data parse error:", e);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // 제어 이력 조회
  const loadHistory = useCallback(async () => {
    if (!isAuthorized) return;

    setLoading(true);
    try {
      const query: any = {
        page: currentPage,
        limit,
      };

      console.log("📤 백엔드 요청:", query);

      let response;
      if (typeFilter === "broadcast") {
        response = await adminApi.getBroadcastHistory(query);
      } else if (typeFilter === "display") {
        response = await adminApi.getDisplayHistory(query);
      } else if (typeFilter === "gate") {
        response = await adminApi.getGateHistory(query);
      } else {
        response = await adminApi.getAllControlHistory(query);
      }

      console.log("📥 백엔드 응답:", {
        데이터_개수: response.data?.length,
        메타정보: response.meta,
        전체_응답: response,
      });

      setHistory(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("제어 이력 조회 실패:", error);
      toast.error(error.message || "제어 이력을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, currentPage, limit, typeFilter]);

  useEffect(() => {
    if (isAuthorized) {
      loadHistory();
    }
  }, [isAuthorized, currentPage, typeFilter, limit, loadHistory]);

  // 장비 유형 아이콘
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "broadcast":
        return "📢";
      case "display":
        return "🖼️";
      case "gate":
        return "🚧";
      default:
        return "⚙️";
    }
  };

  // 장비 유형 이름
  const getTypeName = (type: string) => {
    switch (type) {
      case "broadcast":
        return "예경보";
      case "display":
        return "전광판";
      case "gate":
        return "차단기";
      default:
        return "기타";
    }
  };

  // 상태 배지 (Vue와 동일한 로직)
  const getStatusBadge = (item: ControlHistory) => {
    let status: string | undefined;

    // 타입에 따라 상태 컬럼 선택
    if (item.type === "gate") {
      status = item.GStatus;
    } else {
      status = item.BStatus;
    }

    // 상태에 따른 배지 반환 (Vue 로직과 동일)
    if (status === "end" || status === "success") {
      return (
        <Badge className="px-3 py-1 text-[11px] font-black border-none shadow-none bg-green-100 text-green-700">
          {status}
        </Badge>
      );
    } else if (status === "ing" || status === "processing") {
      return (
        <Badge className="px-3 py-1 text-[11px] font-black border-none shadow-none bg-amber-100 text-amber-700">
          {status}
        </Badge>
      );
    } else if (status === "start") {
      return (
        <Badge className="px-3 py-1 text-[11px] font-black border-none shadow-none bg-blue-100 text-blue-700">
          {status}
        </Badge>
      );
    } else if (status === "fail") {
      return (
        <Badge className="px-3 py-1 text-[11px] font-black border-none shadow-none bg-red-100 text-red-700">
          {status}
        </Badge>
      );
    }

    // 기본값
    return (
      <Badge className="px-3 py-1 text-[11px] font-black border-none shadow-none bg-slate-100 text-slate-500">
        {status || "-"}
      </Badge>
    );
  };

  if (!isAuthorized) {
    return null;
  }

  // 검색된 이력 필터링 (클라이언트 사이드)
  const filteredHistory = history.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.NM_DIST_OBSV?.toLowerCase().includes(searchLower) ||
      item.userName?.toLowerCase().includes(searchLower) ||
      item.Auth?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-32 px-4 sm:px-8 lg:px-12 mt-8">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            제어 이력 조회
          </h1>
          <DataSyncIndicator loading={loading} lastUpdated={lastUpdated} variant="indigo" />
        </div>
        <Button
          onClick={loadHistory}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            장비 유형
          </label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue placeholder="전체 장비" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200">전체 장비</SelectItem>
              <SelectItem value="broadcast" className="dark:text-slate-200">예경보</SelectItem>
              <SelectItem value="display" className="dark:text-slate-200">전광판</SelectItem>
              <SelectItem value="gate" className="dark:text-slate-200">차단기</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2 md:col-span-3">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="장비명, 사용자, 조작자 검색..."
              className="h-10 pl-10 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-indigo-600 dark:border-indigo-700 bg-white dark:bg-slate-800">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
            <TableRow className="h-12 hover:bg-transparent">
              <TableHead className="w-[50px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                No
              </TableHead>
              <TableHead className="w-[80px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                유형
              </TableHead>
              <TableHead className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                장비명
              </TableHead>
              <TableHead className="w-[120px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                사용자
              </TableHead>
              <TableHead className="w-[140px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                제어 시간
              </TableHead>
              <TableHead className="w-[80px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                상태
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <DataSyncIndicator loading={loading} lastUpdated={null} variant="indigo" />
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-slate-400 dark:text-slate-500 text-sm">
                  조회된 제어 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item, index) => (
                <TableRow
                  key={item.uniqueId || `${item.type}-${item.IDX}-${index}`}
                  className="h-12 border-b dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all"
                >
                  <TableCell className="text-center text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-base">{getTypeIcon(item.type)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                        {getTypeName(item.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {item.NM_DIST_OBSV || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <User className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                      {item.userName || item.Auth || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {item.dtmCreate ? dayjs(item.dtmCreate).format("YYYY-MM-DD HH:mm:ss") : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(item)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              전체 <span className="font-bold text-slate-800 dark:text-slate-200">{total}</span>개 중{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(currentPage - 1) * limit + 1}
              </span>
              -
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
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
              <div className="px-3 py-1.5 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{currentPage}</span>
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
  );
};

export default SettingPage;
