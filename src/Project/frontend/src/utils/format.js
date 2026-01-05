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

// 마지막 통신 날짜로부터 몇일 지났는지 확인
export const calculateDaysSince = (dateString) => {
  if (!dateString) return null;
  const targetDate = dayjs(dateString);
  const today = dayjs();
  const days = today.diff(targetDate, 'day');
  return days;
};

// 며칠 지났는지 한글로 표기하기
export const formatDaysSince = (dateString) => {
  const days = calculateDaysSince(dateString);
  if (days === null) return '-';
  if (days === 0) return '오늘';
  if (days === 1) return '1일 전';
  return `${days}일 전`;
};

// 상태에 따른 색상
export const getStatusColor = (status) => {
  if (!status) return 'gray';
  const statusLower = status.toLowerCase();

  if (statusLower === 'error') return 'error';
  if (statusLower === 'fail') return 'warning';
  if (statusLower === 'end') return 'success';
  if (statusLower === 'ing') return 'info';
  return 'gray';
};

// 상태 한글 표기
export const getStatusText = (status) => {
  if (!status) return '-';
  const statusMap = {
    'start': '시작',
    'ing': '진행중',
    'end': '정상',
    'fail': '실패',
    'error': '오류',
  };
  return statusMap[status.toLowerCase()] || status;
}