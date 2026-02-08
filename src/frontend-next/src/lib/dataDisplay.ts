/**
 * 데이터 표시 관련 유틸리티 함수 모음
 */

/**
 * URL이 이미지 파일인지 확인
 * @param url 확인할 URL 문자열
 * @returns 이미지 URL이면 true
 */
export const isImageUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
  const lowerUrl = url.toLowerCase();

  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

/**
 * 문자열이 HTML 콘텐츠인지 확인
 * @param content 확인할 문자열
 * @returns HTML 태그를 포함하면 true
 */
export const isHtmlContent = (content: string): boolean => {
  if (!content || typeof content !== "string") return false;

  // HTML 태그 패턴 확인
  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(content);
};

/**
 * 장비 상태에 따른 배지 클래스 반환
 * @param isNormal 정상 상태 여부
 * @returns Tailwind CSS 클래스 문자열
 */
export const getDeviceStatusBadgeClass = (isNormal: boolean): string => {
  if (isNormal) {
    return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 font-black text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm";
  } else {
    return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-black text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm";
  }
};

/**
 * 마지막 날짜로부터 경과 일수 계산
 * @param lastDate 마지막 날짜 문자열
 * @returns 경과 일수 (null이면 날짜 없음)
 */
export const calculateDaysSince = (lastDate: string | null | undefined): number | null => {
  if (!lastDate) return null;

  try {
    const last = new Date(lastDate);
    const now = new Date();

    // 유효한 날짜인지 확인
    if (isNaN(last.getTime())) return null;

    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error("날짜 계산 오류:", error);
    return null;
  }
};

/**
 * 경과 일수에 따른 배지 색상 클래스 반환
 * 0일: 파란색, 1~60일: 노란색, 61~365일: 빨간색, 366일 이상/null: 회색
 * @param days 경과 일수 (null 가능)
 * @returns Tailwind CSS 클래스 문자열
 */
export const getDaysColorClass = (days: number | null): string => {
  if (days === null || days > 365) {
    return "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600";
  }

  // 0일: 파란색
  if (days === 0) {
    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  }

  // 1~60일: 노란색 (amber)
  if (days <= 60) {
    return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }

  // 61~365일: 빨간색
  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
};
