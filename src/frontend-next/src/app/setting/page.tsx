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
import { History, RotateCw, Search, User, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { ControlHistory } from "@/lib/types";
import dayjs from "dayjs";
import { useCallback } from "react";

const SettingPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [history, setHistory] = useState<ControlHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  // 권한 체크
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        toast.error("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // ADMIN만 접근 가능 (소문자로 비교)
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

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 장비 유형 이미지
  const getTypeImage = (type: string) => {
    switch (type) {
      case "broadcast":
        return "/broad.png";
      case "display":
        return "/display.png";
      case "gate":
        return "/gate.png";
      default:
        return "/gate.png";
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
        <Badge variant="outline" className="border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-black text-[10px] px-2 py-1 rounded-full">
          {status}
        </Badge>
      );
    } else if (status === "ing" || status === "processing") {
      return (
        <Badge variant="outline" className="border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-black text-[10px] px-2 py-1 rounded-full">
          {status}
        </Badge>
      );
    } else if (status === "start") {
      return (
        <Badge variant="outline" className="border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black text-[10px] px-2 py-1 rounded-full">
          {status}
        </Badge>
      );
    } else if (status === "fail") {
      return (
        <Badge variant="outline" className="border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-black text-[10px] px-2 py-1 rounded-full">
          {status}
        </Badge>
      );
    }

    // 기본값
    return (
      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] px-2 py-1 rounded-full">
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
    <div className="page-container max-w-[1440px] mx-auto space-y-6 pb-32 lg:pb-32 px-4 sm:px-8 lg:px-12 mt-8" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            제어 이력 조회
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
          onClick={loadHistory}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 필터 및 검색 섹션 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
            장비 유형
          </label>
          <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Button
              variant={typeFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${typeFilter === "all"
                ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              전체 장비
            </Button>
            <Button
              variant={typeFilter === "broadcast" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter("broadcast")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${typeFilter === "broadcast"
                ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              예경보
            </Button>
            <Button
              variant={typeFilter === "display" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter("display")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${typeFilter === "display"
                ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              전광판
            </Button>
            <Button
              variant={typeFilter === "gate" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter("gate")}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${typeFilter === "gate"
                ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              차단기
            </Button>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
        <Input
          placeholder="장비명, 사용자, 조작자 검색..."
          className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-emerald-500/20 dark:focus:ring-emerald-500/30 transition-all text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 테이블 */}
      <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-emerald-600 dark:border-emerald-700 bg-white dark:bg-slate-800">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/80 border-b dark:border-slate-600">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="w-[30px] sm:w-[40px] px-1"></TableHead>
              <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                번호
              </TableHead>
              <TableHead className="w-[60px] sm:w-[90px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                유형
              </TableHead>
              <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center text-[9px] sm:text-[12px] px-0.5">
                장비명
              </TableHead>
              <TableHead className="w-[80px] sm:w-[120px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                사용자
              </TableHead>
              <TableHead className="w-[80px] sm:w-[140px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                제어 시간
              </TableHead>
              <TableHead className="w-[60px] sm:w-[80px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                상태
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
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-60 text-center text-slate-400 dark:text-slate-500">
                  조회된 제어 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item, index) => {
                const uniqueKey = item.uniqueId || `${item.type}-${item.IDX}-${index}`;
                return (
                  <React.Fragment key={uniqueKey}>
                    <TableRow
                      className={`h-14 border-b dark:border-slate-700 transition-all cursor-pointer ${expandedRow === uniqueKey
                        ? "bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                        }`}
                      onClick={() => setExpandedRow(expandedRow === uniqueKey ? null : uniqueKey)}
                    >
                      <TableCell className="text-center px-2">
                        {expandedRow === uniqueKey ? (
                          <ChevronUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <img
                            src={getTypeImage(item.type)}
                            alt={getTypeName(item.type)}
                            className="h-6 w-6 object-contain"
                          />
                          <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">
                            {getTypeName(item.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate px-2">
                          {item.NM_DIST_OBSV || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs text-slate-600 dark:text-slate-400 truncate px-1">
                          {item.userName || item.Auth || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 px-0.5">
                          {item.dtmCreate ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold">{dayjs(item.dtmCreate).format("MM-DD")}</span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400">{dayjs(item.dtmCreate).format("HH:mm")}</span>
                            </div>
                          ) : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item)}</TableCell>
                    </TableRow>

                    {expandedRow === uniqueKey && (
                      <TableRow className="bg-slate-50/30 dark:bg-slate-900/30">
                        <TableCell colSpan={7} className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Card className="p-5 space-y-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin size={16} /> 장비 정보
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">장비명</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                                    {item.NM_DIST_OBSV || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">유형</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                                    {getTypeName(item.type)}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">제어 시간</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-mono">
                                    {item.dtmCreate ? dayjs(item.dtmCreate).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                  </span>
                                </div>
                              </div>
                            </Card>

                            <Card className="p-5 space-y-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                <User size={16} /> 제어자 정보
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">이름</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                                    {item.userName || item.Auth || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">아이디</span>
                                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                                    {item.Auth || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">상태</span>
                                  {getStatusBadge(item)}
                                </div>
                              </div>
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              전체 <span className="font-bold text-slate-800 dark:text-slate-200">{total}</span>개 중{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {(currentPage - 1) * limit + 1}
              </span>
              -
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{currentPage}</span>
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
