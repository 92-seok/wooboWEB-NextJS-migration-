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

const SettingPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [history, setHistory] = useState<ControlHistory[]>([]);
  const [loading, setLoading] = useState(true);
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
  // loadHistory 함수 내부
  const loadHistory = async () => {
    if (!isAuthorized) return;

    setLoading(true);
    try {
      const query: any = {
        page: currentPage,
        limit,
      };

      // 🔍 요청 파라미터 로그
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

      // 🔍 백엔드 응답 로그
      console.log("📥 백엔드 응답:", {
        데이터_개수: response.data?.length,
        메타정보: response.meta,
        전체_응답: response,
      });

      setHistory(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error: any) {
      console.error("제어 이력 조회 실패:", error);
      toast.error(error.message || "제어 이력을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadHistory();
    }
  }, [isAuthorized, currentPage, typeFilter, limit]);

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
    <div className="max-w-[1440px] mx-auto space-y-8 pb-32 px-6 sm:px-12 lg:px-16 mt-12">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-700" /> 제어 이력 조회
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            장비 제어 및 테스트 수행 기록을 확인합니다. (총 {total}건)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 text-indigo-700 border-indigo-200"
          onClick={loadHistory}
          disabled={loading}
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> 새로고침
        </Button>
      </div>

      {/* 필터 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">장비 유형</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="전체 장비" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 장비</SelectItem>
              <SelectItem value="broadcast">예경보</SelectItem>
              <SelectItem value="display">전광판</SelectItem>
              <SelectItem value="gate">차단기</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 ml-1">사용자 검색</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="장비명 또는 사용자 검색"
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5 flex flex-col items-end">
          <label className="text-[12px] font-bold text-slate-500 ml-1 text-right block mr-1">
            조회 개수
          </label>
          <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val))}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="50개씩 보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개씩 보기</SelectItem>
              <SelectItem value="20">20개씩 보기</SelectItem>
              <SelectItem value="30">30개씩 보기</SelectItem>
              <SelectItem value="50">50개씩 보기</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <Card className="overflow-hidden border-none shadow-xl rounded-[2rem] border-t-4 border-indigo-700 bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="w-[60px] text-center text-[10px] font-bold text-slate-500 tracking-wider">
                번호
              </TableHead>
              <TableHead className="w-[100px] text-center text-[10px] font-bold text-slate-500 tracking-wider">
                유형
              </TableHead>
              <TableHead className="text-center text-[12px] font-bold text-slate-800">
                장비명
              </TableHead>
              <TableHead className="w-[150px] text-center text-[10px] font-bold text-slate-500 tracking-wider">
                제어 사용자
              </TableHead>
              <TableHead className="w-[180px] text-center text-[10px] font-bold text-slate-500 tracking-wider">
                제어 시간
              </TableHead>
              <TableHead className="w-[100px] text-center text-[10px] font-bold text-slate-500 tracking-wider">
                상태
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center text-slate-400">
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center text-slate-400">
                  조회된 제어 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item, index) => (
                <TableRow
                  key={item.uniqueId || `${item.type}-${item.IDX}-${index}`}
                  className="h-14 border-b hover:bg-slate-50/50 transition-all"
                >
                  <TableCell className="text-center text-[11px] font-mono text-slate-400">
                    {(currentPage - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="text-center text-[13px] font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <span>{getTypeIcon(item.type)}</span>
                      <span className="hidden sm:inline text-[10px] text-slate-500 font-bold">
                        {getTypeName(item.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-800 text-[13px] tracking-tighter">
                    {item.NM_DIST_OBSV || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                      <User className="h-3 w-3 text-indigo-500" />
                      {item.userName || item.Auth || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-500">
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

        {/* 페이징 */}
        {totalPages > 0 && (
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Showing{" "}
              <span className="font-bold text-indigo-600">{(currentPage - 1) * limit + 1}</span> to{" "}
              <span className="font-bold text-indigo-600">
                {Math.min(currentPage * limit, total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{total}</span>
            </p>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
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
                className="h-9 w-9 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
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
