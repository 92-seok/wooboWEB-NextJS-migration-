"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  MapPin,
  Clock,
  Activity,
  Lock,
  LockOpen,
  Navigation,
  Megaphone,
  MonitorPlay,
  Construction,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { weathersiApi } from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { getDeviceImageSrc, getDeviceTypeName } from "@/lib/deviceIcons";
import { isImageUrl, isHtmlContent, getDeviceStatusBadgeClass } from "@/lib/dataDisplay";
import { DisplayRenderer } from "@/components/ui/display-renderer";
import dayjs from "dayjs";

const REGION_MENU = [
  { name: "전국", filter: ["전국"] },
  { name: "경기도", filter: ["경기", "서울"] },
  { name: "전라도", filter: ["전라", "광주"] },
  { name: "경상도", filter: ["경상", "부산", "울산", "대구"] },
  { name: "충청도", filter: ["충청", "대전", "세종"] },
  { name: "강원도", filter: ["강원"] },
  { name: "인천/제주도", filter: ["인천", "제주"] },
];

const DEVICE_TYPES = [
  { name: "전체", codes: [] },
  { name: "강우량계", codes: ["01"] },
  { name: "수위계", codes: ["02"] },
  { name: "변위계", codes: ["03"] },
  { name: "적설계", codes: ["06"] },
  { name: "예경보", codes: ["17"] },
  { name: "전광판", codes: ["18"] },
  { name: "차단기", codes: ["20"] },
];

const WeatherSIPage = () => {
  const { canShowTestButton, canExecuteTest } = usePermission();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [areaList, setAreaList] = useState<{ title: string; value: string; }[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("%");
  const [selectedRegionMenu, setSelectedRegionMenu] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(DEVICE_TYPES[0]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusCards, setShowStatusCards] = useState(false);
  const ITEMS_PER_PAGE = 50;

  // 지역 필터링 함수
  const filterAndSortArea = (filterTerms: string[]) => {
    return areaList
      .filter((area) =>
        filterTerms.some((term) => (area.title || "").includes(term))
      )
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  };

  // 초기 로드 = 지역 + 장비
  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, devicesRes] = await Promise.all([
        weathersiApi.getAreas(),
        weathersiApi.getDevices(selectedArea === "%" ? undefined : selectedArea),
      ]);
      if (areasRes?.success && areasRes?.data) {
        const list = (areasRes.data as { RM?: string; ADMCODE?: string; title?: string; value?: string }[]).map(
          (item) => ({
            title: item.RM || item.title || "",
            value: item.ADMCODE || item.value || "",
          })
        );
        setAreaList(list);
      }
      if (devicesRes?.success && devicesRes?.data) {
        setDevices(devicesRes.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("데이터 로드 실패: ", err);
    } finally {
      setLoading(false);
    }
  };

  // 제어 후 로딩 표시 없이 장비 데이터만 갱신 (확장 행 유지)
  const refreshDevices = async () => {
    try {
      const res = await weathersiApi.getDevices(selectedArea === "%" ? undefined : selectedArea);
      if (res?.success) {
        setDevices(res.data || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("장비 갱신 실패:", err);
    }
  };

  // 시군구 선택 시 장비만 다시 로드
  const handleAreaChange = async (adcode: string, menuName?: string | null) => {
    setSelectedArea(adcode);
    setSelectedRegionMenu(menuName ?? null);
    setLoading(true);
    try {
      const res = await weathersiApi.getDevices(adcode === "%" ? undefined : adcode);
      if (res?.success) setDevices(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("장비 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // HTML에서 이미지 URL 추출 함수
  const extractImageFromHtml = (htmlString: string): string | null => {
    if (!htmlString) return null;

    // <img src="..."> 형식 추출
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = htmlString.match(imgRegex);

    if (match && match[1]) {
      return match[1];
    }

    // src="..." 만 있는 경우도 추출
    const srcRegex = /src=["']([^"']+)["']/i;
    const srcMatch = htmlString.match(srcRegex);

    return srcMatch ? srcMatch[1] : null;
  };

  // HTML에서 텍스트만 추출하는 함수
  const extractTextFromHtml = (htmlString: string): string => {
    if (!htmlString) return "";
    // HTML 태그 제거
    return htmlString.replace(/<[^>]*>/g, '').trim();
  };

  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedControlItem, setSelectedControlItem] = useState<any>(null);
  const [testMessage, setTestMessage] = useState("");


  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedArea, selectedType, searchQuery]);

  const handleOpenControl = (item: any) => {
    if (!canExecuteTest) {
      setPermissionDialogOpen(true);
      return;
    }

    setSelectedControlItem(item);

    const gb = String(item.GB_OBSV || "").padStart(2, "0");

    // 예경보(GB 17)의 경우 기본 메시지 설정
    if (gb === "17") {
      setTestMessage(`${item.NM_DIST_OBSV || "해당 지역"} 방송 테스트 중입니다.`);
    } else {
      setTestMessage("");
    }

    setControlDialogOpen(true);
  };

  const handleSendControl = async () => {
    if (!selectedControlItem) return;
    try {
      let res;
      const gb = String(selectedControlItem.GB_OBSV || "").padStart(2, "0");

      // 예경보 (17)
      if (gb === "17") {
        const payload = {
          BDONG_CD: selectedControlItem.BDONG_CD,
          CD_DIST_OBSV: selectedControlItem.CD_DIST_OBSV,
          RCMD: "B010",
          Parm1: "00000000",
          Parm2: "1",
          Parm3: "testMessage",
          BStatus: "start",
        };
        res = await weathersiApi.sendBroadcast(payload);
      }
      // 전광판 (코드 18)
      else if (gb === "18") {
        const payload = {
          BDONG_CD: selectedControlItem.BDONG_CD,
          CD_DIST_OBSV: selectedControlItem.CD_DIST_OBSV,
          RCMD: "S170",
          Parm1: "",
          Parm2: "",
          Parm3: "",
          BStatus: "start",
        };
        res = await weathersiApi.sendDisplay(payload);
      }
      // 차단기 (코드 20)
      else if (gb === "20") {
        const payload = {
          BDONG_CD: selectedControlItem.BDONG_CD,
          CD_DIST_OBSV: selectedControlItem.CD_DIST_OBSV,
          Gate: testMessage || "open", // 'open' 또는 'close'
          GStatus: "start",
        };
        res = await weathersiApi.sendGate(payload);
      }

      if (res?.success) {
        alert("제어 명령이 전송되었습니다.");
        await refreshDevices();
      } else {
        alert("전송 실패: " + (res?.message || "알 수 없는 오류"));
      }
    } catch (err) {
      console.error("API 오류 상세:", err);
      alert(`API 오류 발생: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setControlDialogOpen(false);
    }
  };

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      (d.NM_DIST_OBSV || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.CD_DIST_OBSV || "").includes(searchQuery);
    const gbCode = String(d.GB_OBSV || "").padStart(2, "0");
    const matchesType = selectedType.codes.length === 0 || selectedType.codes.includes(gbCode);
    return matchesSearch && matchesType;
  });

  const totalItems = filteredDevices.length;
  const normalCount = filteredDevices.filter((d) => (d.ErrorChk || 0) > 0).length;
  const errorCount = filteredDevices.filter((d) => (d.ErrorChk || 0) === 0).length;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDeviceTypeName = (gb: any) => {
    const code = String(gb || "").padStart(2, "0");
    switch (code) {
      case "01":
        return "강우량계";
      case "02":
        return "수위계";
      case "03":
      case "04":
        return "변위계";
      case "06":
        return "적설계";
      case "20":
        return "차단기";
      case "17":
        return "예경보";
      case "18":
        return "전광판";
      default:
        return "기타";
    }
  };

  const getDeviceIcon = (gb: any) => {
    const code = String(gb || "").padStart(2, "0");
    switch (code) {
      case "01":
        return "📡";
      case "02":
        return "💧";
      case "03":
      case "04":
        return "📐";
      case "06":
        return "❄️";
      case "17":
        return "📢";
      case "18":
        return "🖼️";
      case "20":
        return "🚧";
      default:
        return "⚙️";
    }
  };

  const getControlInfo = (gb: any) => {
    const code = String(gb || "").padStart(2, "0");
    switch (code) {
      case "17": // 예경보
        return {
          label: "Broadcast Message",
          placeholder: "방송 내용을 입력하세요",
          description: "예경보 방송: 방송할 내용을 입력하세요.",
          icon: "📢",
        };
      case "18": // 전광판
        return {
          label: "Display Message",
          placeholder: "전광판 내용을 입력하세요",
          description: "전광판 표시: 전광판에 표시할 텍스트를 입력하세요.",
          icon: "🖼️",
        };
      case "20": // 차단기
        return {
          label: "Gate Control Command",
          placeholder: "OPEN, CLOSE",
          description: "차단기 제어: OPEN(열기), CLOSE(닫기)",
          icon: "🚧",
        };
      default:
        return {
          label: "Command Payload",
          placeholder: "전송할 내용을 입력하세요.",
          description: "",
          icon: "⚙️",
        };
    }
  };

  return (
    <div className="page-container max-w-[1440px] mx-auto space-y-6 pb-32 lg:pb-32 px-4 sm:px-8 lg:px-12 mt-8 overflow-x-hidden" style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}>
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            통합 관측 목록
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
          onClick={loadData}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 h-11 px-6 rounded-xl font-bold shadow-md gap-2"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 통계 토글 버튼 */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStatusCards(!showStatusCards)}
          className="h-9 px-4 text-xs gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
        >
          <Activity className="h-4 w-4" />
          {showStatusCards ? "통계 숨김" : "통계 표시"}
        </Button>
      </div>

      {/* 상태 요약 박스 - 필터 버튼 클릭 시에만 표시 */}
      {showStatusCards && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
            <div className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">전체</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{totalItems}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
            <div className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 mb-1">정상</div>
            <div className="text-2xl sm:text-3xl font-black text-green-700 dark:text-green-300">{normalCount}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 text-center">
            <div className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mb-1">점검필요</div>
            <div className="text-2xl sm:text-3xl font-black text-red-700 dark:text-red-300">{errorCount}</div>
          </div>
        </div>
      )}

      {/* 필터 섹션 */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 지역 필터 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              지역 필터
            </label>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
              {REGION_MENU.map((menu) => (
                <DropdownMenu key={menu.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={selectedRegionMenu === menu.name ? "default" : "ghost"}
                      size="sm"
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${selectedRegionMenu === menu.name
                        ? "bg-purple-600 dark:bg-purple-700 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {menu.name}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto" collisionPadding={16}>
                    {menu.name === "전국" ? (
                      <DropdownMenuItem onClick={() => handleAreaChange("%", menu.name)}>
                        전국
                      </DropdownMenuItem>
                    ) : (
                      filterAndSortArea(menu.filter).map((item) => (
                        <DropdownMenuItem
                          key={item.value}
                          onClick={() => handleAreaChange(item.value, menu.name)}
                        >
                          {item.title}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>

          {/* 유형 필터 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              유형 필터
            </label>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 shadow-sm">
              {DEVICE_TYPES.map((type) => (
                <Button
                  key={type.name}
                  variant={selectedType.name === type.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${selectedType.name === type.name
                    ? "bg-purple-600 dark:bg-purple-700 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
        <Input
          placeholder="장비명 또는 코드 검색..."
          className="h-12 pl-11 rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 bg-white shadow-sm focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30 transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 테이블 */}
      <div className="space-y-4">
        <Card className="overflow-hidden border-none shadow-xl rounded-3xl border-t-4 border-purple-600 dark:border-purple-700 bg-white dark:bg-slate-800">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/80 border-b dark:border-slate-600">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="w-[30px] sm:w-[40px] px-1"></TableHead>
                <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  번호
                </TableHead>
                <TableHead className="w-[40px] sm:w-[70px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  유형
                </TableHead>
                <TableHead className="font-bold text-slate-800 dark:text-slate-200 text-center text-[9px] sm:text-[12px] px-0.5">
                  장비명
                </TableHead>
                <TableHead className="w-[50px] sm:w-[80px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  상태
                </TableHead>
                <TableHead className="w-[120px] sm:w-[280px] text-center font-bold text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  데이터
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    데이터를 가져오고 있습니다...
                  </TableCell>
                </TableRow>
              ) : paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400 dark:text-slate-500">
                    조회된 장비가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((item, index) => {
                  const deviceImage = getDeviceImageSrc(item.GB_OBSV);
                  const deviceTypeName = getDeviceTypeName(item.GB_OBSV);
                  const isNormal = (item.ErrorChk || 0) > 0;
                  const statusClass = getDeviceStatusBadgeClass(isNormal);
                  const gb = String(item.GB_OBSV || "").padStart(2, "0");

                  return (
                    <React.Fragment key={item.IDX}>
                      <TableRow
                        className={`h-14 border-b dark:border-slate-700 transition-all cursor-pointer ${expandedRow === item.IDX
                          ? "bg-purple-50/50 dark:bg-purple-900/10"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-700/30"
                          }`}
                        onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                      >
                        <TableCell className="text-center px-2">
                          {expandedRow === item.IDX ? (
                            <ChevronUp className="h-4 w-4 text-purple-500 dark:text-purple-400 mx-auto" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono text-slate-600 dark:text-slate-400">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={deviceImage}
                              alt={deviceTypeName}
                              className="h-6 w-6 object-contain"
                            />
                            <span className="text-[9px] text-slate-500 dark:text-slate-400">
                              {deviceTypeName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate px-2">
                            {item.NM_DIST_OBSV || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${statusClass} ${!isNormal ? 'animate-pulse' : ''}`}
                          >
                            {isNormal ? "정상" : "점검"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-mono px-2">
                            {/* 전광판(18)인 경우 특별 처리 */}
                            {gb === "18" && item.DATA ? (
                              (() => {
                                // 1. 이미지 URL인 경우
                                if (isImageUrl(item.DATA)) {
                                  return (
                                    <img
                                      src={item.DATA}
                                      alt="전광판"
                                      className="h-8 w-auto max-w-full mx-auto object-contain"
                                    />
                                  );
                                }

                                // 2. HTML 컨텐츠인 경우 - 이미지로 변환하여 작게 표시
                                if (isHtmlContent(item.DATA)) {
                                  return (
                                    <DisplayRenderer
                                      htmlContent={item.DATA}
                                      size="small"
                                    />
                                  );
                                }

                                // 3. 기본 텍스트 표시
                                return (
                                  <span className="block truncate max-w-[180px] mx-auto text-[10px]">
                                    {item.DATA}
                                  </span>
                                );
                              })()
                            ) : item.DATA && isImageUrl(item.DATA) ? (
                              <img
                                src={item.DATA}
                                alt="data"
                                className="h-8 w-auto max-w-full mx-auto object-contain"
                              />
                            ) : item.DATA && isHtmlContent(item.DATA) ? (
                              (() => {
                                const imageUrl = extractImageFromHtml(item.DATA);
                                if (imageUrl) {
                                  return (
                                    <img
                                      src={imageUrl}
                                      alt="data"
                                      className="h-8 w-auto max-w-full mx-auto object-contain"
                                    />
                                  );
                                }
                                const textContent = extractTextFromHtml(item.DATA);
                                if (textContent) {
                                  return (
                                    <span className="block truncate max-w-[180px] mx-auto text-[10px]" title={textContent}>
                                      {textContent}
                                    </span>
                                  );
                                }
                                return (
                                  <div className="text-[10px] bg-slate-900 dark:bg-slate-700 text-green-400 px-2 py-1 rounded font-mono inline-block">
                                    LED
                                  </div>
                                );
                              })()
                            ) : (
                              <span className="block truncate max-w-[180px] mx-auto" title={item.DATA || ""}>
                                {item.DATA || "-"}
                              </span>
                            )}
                          </div>
                          {item.UNIT && (
                            <div className="text-[9px] text-slate-400 dark:text-slate-500">{item.UNIT}</div>
                          )}
                        </TableCell>
                      </TableRow>

                      {expandedRow === item.IDX && (
                        <TableRow className="bg-slate-50/30 dark:bg-slate-900/30">
                          <TableCell colSpan={6} className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              {/* 기본 정보 - 공통 */}
                              <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                  <MapPin size={16} /> 기본 정보
                                </h4>
                                <div className="space-y-2 text-sm flex-1">
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">주소</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-medium text-right">
                                      {item.DTL_ADRES || "-"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">법정동코드</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono">{item.BDONG_CD || "-"}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">좌표</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-mono">
                                      {item.LAT} / {item.LON}
                                    </span>
                                  </div>
                                </div>
                                {item.LAT && item.LON && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(
                                        `https://map.naver.com/p/directions/-/${item.LON},${item.LAT},${encodeURIComponent(item.NM_DIST_OBSV || "장비 위치")}/-/car`,
                                        "_blank"
                                      );
                                    }}
                                    className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold h-11 rounded-xl gap-2 mt-4"
                                  >
                                    <Navigation size={16} />
                                    네이버지도 길안내
                                  </Button>
                                )}
                              </Card>

                              {/* 강우량계 (01) - 실시간 강우 데이터 */}
                              {gb === "01" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 실시간 강우 데이터
                                  </h4>
                                  <div className="space-y-2 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">수신 시간</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800 mt-3">
                                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2">현재 강우량</p>
                                      <p className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                        {item.DATA || "0"} <span className="text-base font-bold">{item.UNIT || "mm"}</span>
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              {/* 수위계 (02) - 실시간 수위 데이터 */}
                              {gb === "02" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 실시간 수위 데이터
                                  </h4>
                                  <div className="space-y-2 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">수신 시간</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">부팅 시간</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_UPTIME ? dayjs(item.LOGGER_UPTIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-center border border-purple-100 dark:border-purple-800">
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">GL</p>
                                        <p className="text-lg font-black text-purple-700 dark:text-purple-300">
                                          {item.LOGGER_GL || "0.00"} M
                                        </p>
                                      </div>
                                      <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-center border border-teal-100 dark:border-teal-800">
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mb-1">FL</p>
                                        <p className="text-lg font-black text-teal-700 dark:text-teal-300">
                                          {item.LOGGER_FL || "0.00"} M
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              {/* 변위계 (03) - 실시간 변위 데이터 */}
                              {(gb === "03" || gb === "04") && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 실시간 변위 데이터
                                  </h4>
                                  <div className="space-y-2 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">수신 시간</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-100 dark:border-orange-800 mt-3">
                                      <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-2">현재 변위량</p>
                                      <p className="text-3xl font-black text-orange-700 dark:text-orange-300">
                                        {item.DATA || "0"} <span className="text-base font-bold">{item.UNIT || "mm"}</span>
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              {/* 적설계 (06) - 실시간 적설 데이터 */}
                              {gb === "06" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 실시간 적설 데이터
                                  </h4>
                                  <div className="space-y-2 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">수신 시간</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl text-center border border-cyan-100 dark:border-cyan-800 mt-3">
                                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mb-2">현재 적설량</p>
                                      <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">
                                        {item.DATA || "0"} <span className="text-base font-bold">{item.UNIT || "cm"}</span>
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              )}

                              {/* 예경보 (17) - 마지막 표출 데이터 + 장비 테스트 */}
                              {gb === "17" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 예경보 현황
                                  </h4>
                                  <div className="space-y-3 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">마지막 수신</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-2">마지막 표출 데이터</p>
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                                        {item.DATA || "-"}
                                      </p>
                                    </div>
                                  </div>
                                  {canShowTestButton && (
                                    <Button
                                      onClick={(e) => { e.stopPropagation(); handleOpenControl(item); }}
                                      className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold h-12 rounded-xl gap-2 mt-4"
                                    >
                                      <Megaphone size={18} /> 방송 테스트
                                    </Button>
                                  )}
                                </Card>
                              )}

                              {/* 전광판 (18) - 현재 표출 이미지 + 장비 테스트 */}
                              {gb === "18" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 전광판 현황
                                  </h4>
                                  <div className="space-y-3 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">마지막 수신</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl flex items-center justify-center min-h-[120px] border border-slate-700">
                                      {item.DATA && isImageUrl(item.DATA) ? (
                                        <img src={item.DATA} alt="전광판 표출 이미지" className="w-full object-contain" />
                                      ) : item.DATA && isHtmlContent(item.DATA) ? (
                                        <DisplayRenderer htmlContent={item.DATA} size="large" />
                                      ) : item.DATA ? (
                                        <span className="text-green-400 text-sm font-mono font-bold">{item.DATA}</span>
                                      ) : (
                                        <span className="text-slate-400 text-xs">표출 데이터 없음</span>
                                      )}
                                    </div>
                                  </div>
                                  {canShowTestButton && (
                                    <Button
                                      onClick={(e) => { e.stopPropagation(); handleOpenControl(item); }}
                                      className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold h-12 rounded-xl gap-2 mt-4"
                                    >
                                      <MonitorPlay size={18} /> 전광판 테스트
                                    </Button>
                                  )}
                                </Card>
                              )}

                              {/* 차단기 (20) - 현재 상태 + 장비 테스트 */}
                              {gb === "20" && (
                                <Card className="p-5 flex flex-col bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                                  <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                                    <Activity size={16} /> 차단기 현황
                                  </h4>
                                  <div className="space-y-3 text-sm flex-1">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">마지막 수신</span>
                                      <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                                        {item.LOGGER_TIME ? dayjs(item.LOGGER_TIME).format("YYYY-MM-DD HH:mm:ss") : "-"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-center py-4">
                                      {(() => {
                                        const gateData = String(item.DATA || "").toLowerCase();
                                        return gateData.includes("close") || gateData.includes("닫힘");
                                      })() ? (
                                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-xl border border-red-200 dark:border-red-800">
                                          <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                                          <span className="text-lg font-black text-red-700 dark:text-red-300">닫힘</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-xl border border-green-200 dark:border-green-800">
                                          <LockOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                                          <span className="text-lg font-black text-green-700 dark:text-green-300">열림</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {canShowTestButton && (
                                    <Button
                                      onClick={(e) => { e.stopPropagation(); handleOpenControl(item); }}
                                      className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold h-12 rounded-xl gap-2 mt-4"
                                    >
                                      <Construction size={18} /> 차단기 제어
                                    </Button>
                                  )}
                                </Card>
                              )}
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
            <div className="relative py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6 bg-white dark:bg-slate-900 rounded-b-3xl z-10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                전체 <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span>개 중{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>
                -
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
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
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{currentPage}</span>
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

          {/* 제어 Dialog */}
          <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
            <DialogContent className="max-w-md dark:bg-slate-800 dark:border-slate-700 p-0 overflow-hidden">

              {/* 예경보 (17) - 텍스트 입력 */}
              {selectedControlItem?.GB_OBSV === "17" && (
                <>
                  <div className="bg-gradient-to-br from-slate-600 via-slate-500 to-slate-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 text-white shadow-xl border-b-4 border-slate-400 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 dark:bg-white/10 p-3 rounded-xl shadow-lg backdrop-blur-sm">
                        <img
                          src="/broad.png"
                          alt="예경보"
                          className="h-10 w-10 object-contain drop-shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight drop-shadow-md">예경보 방송 제어</h3>
                        <p className="text-sm opacity-90 mt-1 font-medium">
                          {selectedControlItem?.NM_DIST_OBSV || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        방송 메시지
                      </label>
                      <Textarea
                        placeholder="방송 내용 입력..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        className="min-h-[120px] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setControlDialogOpen(false)}
                        className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleSendControl}
                        className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold"
                      >
                        방송 전송
                      </Button>
                    </DialogFooter>
                  </div>
                </>
              )}

              {/* 차단기 (20) - 열림/닫힘 버튼 */}
              {selectedControlItem?.GB_OBSV === "20" && (
                <>
                  <div className="bg-gradient-to-br from-slate-600 via-slate-500 to-slate-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 text-white shadow-xl border-b-4 border-slate-400 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 dark:bg-white/10 p-3 rounded-xl shadow-lg backdrop-blur-sm">
                        <img
                          src="/gate.png"
                          alt="차단기"
                          className="h-10 w-10 object-contain drop-shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight drop-shadow-md">차단기 제어</h3>
                        <p className="text-sm opacity-90 mt-1 font-medium">
                          {selectedControlItem?.NM_DIST_OBSV || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      차단기를 제어하시겠습니까?
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={async () => {
                          try {
                            const payload = {
                              BDONG_CD: selectedControlItem.BDONG_CD,
                              CD_DIST_OBSV: selectedControlItem.CD_DIST_OBSV,
                              Gate: "open",
                              GStatus: "start",
                            };
                            await weathersiApi.sendGate(payload);
                            setControlDialogOpen(false);
                            alert("차단기 열림 명령을 전송했습니다.");
                            await refreshDevices();
                          } catch (err: any) {
                            alert(err.message || "차단기 제어 실패");
                          }
                        }}
                        className="h-24 flex-col gap-2 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white text-lg font-bold"
                      >
                        <LockOpen className="h-8 w-8" />
                        열기
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            const payload = {
                              BDONG_CD: selectedControlItem.BDONG_CD,
                              CD_DIST_OBSV: selectedControlItem.CD_DIST_OBSV,
                              Gate: "close",
                              GStatus: "start",
                            };
                            await weathersiApi.sendGate(payload);
                            setControlDialogOpen(false);
                            alert("차단기 닫힘 명령을 전송했습니다.");
                            await refreshDevices();
                          } catch (err: any) {
                            alert(err.message || "차단기 제어 실패");
                          }
                        }}
                        className="h-24 flex-col gap-2 bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white text-lg font-bold"
                      >
                        <Lock className="h-8 w-8" />
                        닫기
                      </Button>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setControlDialogOpen(false)}
                        className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        취소
                      </Button>
                    </DialogFooter>
                  </div>
                </>
              )}

              {/* 전광판 (18) - 테스트 이미지 전송 */}
              {selectedControlItem?.GB_OBSV === "18" && (
                <>
                  <div className="bg-gradient-to-br from-slate-600 via-slate-500 to-slate-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 text-white shadow-xl border-b-4 border-slate-400 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 dark:bg-white/10 p-3 rounded-xl shadow-lg backdrop-blur-sm">
                        <img
                          src="/display.png"
                          alt="전광판"
                          className="h-10 w-10 object-contain drop-shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight drop-shadow-md">전광판 테스트</h3>
                        <p className="text-sm opacity-90 mt-1 font-medium">
                          {selectedControlItem?.NM_DIST_OBSV || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        테스트 이미지
                      </label>
                      <div className="flex justify-center p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                        <img
                          src="/display_test.png"
                          alt="테스트 이미지"
                          className="max-h-32 object-contain"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setControlDialogOpen(false)}
                        className="dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleSendControl}
                        className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-bold"
                      >
                        테스트 이미지 전송
                      </Button>
                    </DialogFooter>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* 권한 없음 Dialog */}
          <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
            <DialogContent className="max-w-sm dark:bg-slate-800 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="dark:text-slate-100">접근 권한이 없습니다</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                원격 제어 기능은 관리자 권한이 필요합니다.<br />
                시스템사업부로 문의하세요.
              </p>
              <DialogFooter>
                <Button
                  onClick={() => setPermissionDialogOpen(false)}
                  className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800"
                >
                  확인
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      );
};

      export default WeatherSIPage;
