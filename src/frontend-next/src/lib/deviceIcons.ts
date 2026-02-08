/**
 * 장비 타입(GB_OBSV)별 아이콘 및 이름 매핑
 */

const DEVICE_TYPE_NAMES: Record<string, string> = {
  "01": "강우량계",
  "02": "수위계",
  "03": "변위계",
  "04": "함수비",
  "06": "적설계",
  "08": "경사",
  "15": "침수",
  "17": "예경보",
  "18": "전광판",
  "19": "방송",
  "20": "차단기",
  "21": "통합",
};

const DEVICE_IMAGE_MAP: Record<string, string> = {
  "01": "/rain.png",
  "02": "/water.png",
  "03": "/tilt.png",
  "04": "/tilt.png",
  "06": "/snow.png",
  "08": "/tilt.png",
  "15": "/flood.png",
  "17": "/broad.png",
  "18": "/display.png",
  "19": "/broad.png",
  "20": "/gate.png",
  "21": "/broad.png",
};

/**
 * GB_OBSV 코드에 해당하는 장비 타입 한글명 반환
 */
export const getDeviceTypeName = (gbCode: string | number | null | undefined): string => {
  if (gbCode == null) return "알 수 없음";
  const code = String(gbCode).padStart(2, "0");
  return DEVICE_TYPE_NAMES[code] ?? code;
};

/**
 * GB_OBSV 코드에 해당하는 아이콘 이미지 경로 반환
 */
export const getDeviceImageSrc = (gbCode: string | number | null | undefined): string => {
  if (gbCode == null) return "/rain.png";
  const code = String(gbCode).padStart(2, "0");
  return DEVICE_IMAGE_MAP[code] ?? "/rain.png";
};
