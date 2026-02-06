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
  Settings,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Filter,
  MapPin,
  Clock,
  Activity,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { weathersiApi } from "@/lib/api";

const PROVINCE_GROUPS = [
  { name: "전국", codes: [] },
  { name: "경기도/서울/인천", codes: ["11", "28", "41"] },
  { name: "전라도", codes: ["29", "45", "46"] },
  { name: "경상도", codes: ["26", "27", "31", "47", "48"] },
  { name: "충청도", codes: ["30", "36", "43", "44"] },
  { name: "강원도", codes: ["42", "51"] },
  { name: "제주도", codes: ["50"] },
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
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState(PROVINCE_GROUPS[0]);
  const [selectedType, setSelectedType] = useState(DEVICE_TYPES[0]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [selectedControlItem, setSelectedControlItem] = useState<any>(null);
  const [testMessage, setTestMessage] = useState("");

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await weathersiApi.getDevices();
      if (res && res.success) {
        setDevices(res.data || []);
      }
    } catch (err) {
      console.error("장비 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, selectedType, searchQuery]);

  const handleOpenControl = (item: any) => {
    setSelectedControlItem(item);
    setTestMessage("");
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
          RCMD: "B010",
          Parm1: "00000000",
          Parm2: "1",
          Parm3: testMessage,
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

      if (res?.success) alert("제어 명령이 전송되었습니다.");
      else alert("전송 실패: " + (res?.message || "알 수 없는 오류"));
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
    const sidoCode = String(d.BDONG_CD || "").substring(0, 2);
    const matchesProvince =
      selectedProvince.codes.length === 0 || selectedProvince.codes.includes(sidoCode);
    const gbCode = String(d.GB_OBSV || "").padStart(2, "0");
    const matchesType = selectedType.codes.length === 0 || selectedType.codes.includes(gbCode);
    return matchesSearch && matchesProvince && matchesType;
  });

  const totalItems = filteredDevices.length;
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
    <div className="max-w-[1440px] mx-auto space-y-8 pb-32 px-6 sm:px-12 lg:px-16 mt-12">
      {/* 지역 필터 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider pl-1">
            <Monitor className="h-3 w-3 text-indigo-600" /> Area Filter
          </label>
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200/60 shadow-sm">
            {PROVINCE_GROUPS.map((prov) => (
              <Button
                key={prov.name}
                variant={selectedProvince.name === prov.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedProvince(prov)}
                className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all font-sans ${selectedProvince.name === prov.name ? "bg-indigo-700 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {prov.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider pl-1 font-sans">
            <Filter className="h-3 w-3 text-indigo-600" /> Category Filter
          </label>
          <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200 shadow-sm">
            {DEVICE_TYPES.map((type) => (
              <Button
                key={type.name}
                variant={selectedType.name === type.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={`h-8 px-3.5 rounded-xl text-[11px] font-bold transition-all font-sans ${selectedType.name === type.name ? "bg-teal-600 text-white shadow-md shadow-teal-100" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {type.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
        <div className="font-sans">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            통합 관측 목록
            <Badge
              variant="outline"
              className="text-indigo-600 border-indigo-100 bg-indigo-50/30 font-bold rounded-lg px-2"
            >
              {selectedProvince.name}
            </Badge>
            <Badge
              variant="outline"
              className="text-teal-600 border-teal-100 bg-teal-50/30 font-bold rounded-lg px-2"
            >
              {selectedType.name}
            </Badge>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium italic">
            전국 각지의 관측소 실시간 상태를 모니터링합니다. (총 {totalItems}개)
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold" />
            <input
              placeholder="장비명 또는 코드 검색"
              className="w-full pl-9 pr-4 h-11 text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-2xl bg-white shadow-sm transition-all font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadDevices}
            className="h-11 w-11 shrink-0 border-slate-200 bg-white rounded-2xl"
          >
            <RotateCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-4 font-sans">
        <Card className="overflow-hidden border-none shadow-xl rounded-[2rem] border-t-4 border-indigo-700 bg-white">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-slate-50/50 border-b">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="w-[30px] sm:w-[40px] px-1"></TableHead>
                <TableHead className="w-[30px] sm:w-[60px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  번호
                </TableHead>
                <TableHead className="w-[40px] sm:w-[100px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  유형
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-center text-[9px] sm:text-[12px] px-0.5">
                  장비명
                </TableHead>
                <TableHead className="w-[50px] sm:w-[90px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  상태
                </TableHead>
                <TableHead className="w-[50px] sm:w-[120px] text-center font-bold text-slate-500 text-[9px] sm:text-[10px] tracking-wider px-0.5">
                  데이터
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400">
                    데이터를 가져오고 있습니다...
                  </TableCell>
                </TableRow>
              ) : paginatedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60 text-center text-slate-400">
                    조회된 장비가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevices.map((item, index) => (
                  <React.Fragment key={item.IDX}>
                    <TableRow
                      className={`h-14 border-b transition-all cursor-pointer ${expandedRow === item.IDX ? "bg-indigo-50/50" : "hover:bg-slate-50/50"}`}
                      onClick={() => setExpandedRow(expandedRow === item.IDX ? null : item.IDX)}
                    >
                      <TableCell className="text-center px-1">
                        {expandedRow === item.IDX ? (
                          <ChevronUp className="h-4 w-4 text-indigo-600 mx-auto" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-[9px] sm:text-[11px] text-slate-400 px-0.5">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-0.5">
                        <div className="flex items-center gap-1 justify-center bg-slate-50 sm:bg-slate-100 py-1 rounded-sm sm:rounded-lg px-1 sm:px-2">
                          <span className="text-[12px] sm:text-[14px]">
                            {getDeviceIcon(item.GB_OBSV)}
                          </span>
                          <span className="hidden sm:inline text-[10px] text-slate-500 font-black whitespace-nowrap">
                            {getDeviceTypeName(item.GB_OBSV)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800 text-center text-[9px] sm:text-[13px] truncate px-0.5 tracking-tighter">
                        {item.NM_DIST_OBSV}
                      </TableCell>
                      <TableCell className="text-center px-0.5">
                        <Badge
                          className={`px-3 py-1 text-[8px] sm:text-[11px] font-black border-none shadow-none justify-center w-full sm:w-auto mx-auto ${Number(item.ErrorChk) === 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 animate-pulse"}`}
                        >
                          {Number(item.ErrorChk) === 5 ? "정상" : "점검"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-indigo-700 font-mono font-black text-[9px] sm:text-xs px-0.5">
                        {item.DATA || "-"}{" "}
                        <span className="text-[8px] text-slate-300 ml-0.5 sm:ml-1 hidden sm:inline">
                          {item.UNIT || ""}
                        </span>
                      </TableCell>
                    </TableRow>
                    {expandedRow === item.IDX && (
                      <TableRow className="bg-slate-50/30">
                        <TableCell colSpan={6} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                            <Card className="p-5 space-y-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin size={12} /> 기본 정보
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">주소</span>
                                  <span className="text-slate-800">{item.DTL_ADRES || "-"}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">좌표</span>
                                  <span className="text-slate-800 font-mono italic">
                                    {item.LAT} / {item.LON}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-bold text-slate-500">접속 정보</span>
                                  <span className="text-slate-800 font-mono">
                                    {item.IP || "-"}:{item.PORT || "-"}
                                  </span>
                                </div>
                              </div>
                            </Card>
                            <Card className="p-5 space-y-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock size={12} /> 통신 상태
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="font-bold text-slate-500">최근 통신</span>
                                  <span className="text-slate-800 font-mono">{item.LastDate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-bold text-slate-500">마지막 상태</span>
                                  <span className="text-slate-800 font-mono font-bold text-slate-800">
                                    {item.LastStatus || "-"}
                                  </span>
                                </div>
                              </div>
                              {["17", "18", "20", "21"].includes(
                                String(item.GB_OBSV || "").padStart(2, "0")
                              ) && (
                                <div className="pt-2">
                                  <Button
                                    className="w-full bg-slate-900 hover:bg-black text-[11px] font-bold h-10 rounded-xl gap-2 shadow-lg transition-transform active:scale-95"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenControl(item);
                                    }}
                                  >
                                    <Settings className="h-4 w-4" /> 원격 제어 테스트
                                  </Button>
                                </div>
                              )}
                            </Card>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {totalPages > 0 && (
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Showing{" "}
              <span className="font-bold text-indigo-600">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-indigo-600">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
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
                className="h-9 w-9 rounded-xl text-slate-500"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden font-sans">
          <div className="bg-slate-900 p-8 text-white relative">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4 text-xl font-black italic tracking-tight">
                <span className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  {getDeviceIcon(selectedControlItem?.GB_OBSV)}
                </span>{" "}
                {selectedControlItem?.NM_DIST_OBSV}
              </DialogTitle>
            </DialogHeader>
            <p className="text-[10px] text-white/40 mt-3 font-mono uppercase tracking-[0.3em] font-black">
              Secure Command Transmission
            </p>
          </div>
          <div className="p-8 space-y-6 bg-white">
            {/* 차단기 (GB_OBSV === '20') - 열기/닫기 버튼 */}
            {String(selectedControlItem?.GB_OBSV || "").padStart(2, "0") === "20" ? (
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider pl-1">
                  <Volume2 size={14} className="text-indigo-600" />
                  Gate Control Command
                </label>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-24 flex flex-col gap-2 bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-[1.5rem] shadow-xl"
                    onClick={() => {
                      setTestMessage("open");
                      handleSendControl();
                    }}
                  >
                    <span className="text-3xl">🔓</span>
                    <span className="text-sm font-bold">OPEN</span>
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-24 flex flex-col gap-2 bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-[1.5rem] shadow-xl"
                    onClick={() => {
                      setTestMessage("close");
                      handleSendControl();
                    }}
                  >
                    <span className="text-3xl">🔒</span>
                    <span className="text-sm font-bold">CLOSE</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* 예경보/전광판 - 텍스트 입력 */
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider pl-1">
                  <Volume2 size={14} className="text-indigo-600" />
                  {(() => {
                    const obsv = String(selectedControlItem?.GB_OBSV || "").padStart(2, "0");
                    if (obsv === "17") return "Broadcast Message";
                    if (obsv === "18") return "Display Message";
                    return "Command Payload";
                  })()}
                </label>
                <Textarea
                  placeholder={(() => {
                    const obsv = String(selectedControlItem?.GB_OBSV || "").padStart(2, "0");
                    if (obsv === "17") return "예시: 홍수 경보 발령, 대피하세요";
                    if (obsv === "18") return "예시: 도로 통제, 우회 바람";
                    return "전송할 내용을 입력하세요";
                  })()}
                  className="resize-none h-32 rounded-[1.5rem] border-slate-100 bg-slate-50 font-bold focus:ring-indigo-600 transition-all"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
                <DialogFooter className="flex-row gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setControlDialogOpen(false)}
                    className="flex-1 rounded-[1.25rem] font-bold text-slate-400"
                  >
                    CANCEL
                  </Button>
                  <Button
                    className="flex-[2] bg-indigo-700 hover:bg-indigo-800 rounded-[1.25rem] font-black shadow-xl shadow-indigo-100"
                    onClick={handleSendControl}
                  >
                    EXECUTE COMMAND
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* 차단기는 버튼에서 바로 전송하므로 Footer 없음 */}
            {String(selectedControlItem?.GB_OBSV || "").padStart(2, "0") === "20" && (
              <DialogFooter className="flex-row gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setControlDialogOpen(false)}
                  className="w-full rounded-[1.25rem] font-bold text-slate-400"
                >
                  CANCEL
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeatherSIPage;
