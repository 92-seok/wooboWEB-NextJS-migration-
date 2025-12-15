import dayjs from 'dayjs';

// 날짜 포맷팅하기
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

// 좌표 포맷팅(소수점 4자리)
export const formatCoordinate = (value) => {
  if (!value) return '-';
  return Number(value).toFixed(4);
};

// 숫자에 콤마 추가 하기
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
};

// 한국어 형식 날짜 포맷팅
export const formatDateKorean = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('ko-KR');
};