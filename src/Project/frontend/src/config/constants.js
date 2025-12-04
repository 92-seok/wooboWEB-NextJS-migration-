// 지도 설정하기
export const MAP_CONFIG = {
  KAKAO_API_KEY: 'f4592e97c349ab41d02ff73bd314a201',
  INIT_LAT: 37.4341,
  INIT_LON: 127.174,
  INIT_LEVEL: 11,
  MAX_LEVEL: 14,
};

// 타이머 설정
export const TIMER_CONFIG = {
  REFRESH_TIME: 20,
};

// 장비 타입 코드
export const DEVICE_TYPE = {
  RAIN: '01',       // 강우
  WATER: '02',      // 수위
  DPLACE: '03',     // 변위
  SNOW: '06',       //적설
  BORADCASE: '17',  // 예경보
  DISPLAY: '18',    // 전광판
  GATE: '20',       // 차단기
  FLOOD: '21',      // 침수
}

// 지역 메뉴 리스트
export const REGION_MENU = [
  { name: '전국', filter: ['전국'], },
  { name: '전라도', filter: ['전라', '광주'], },
  { name: '경상도', filter: ['경상', '부산', '울산', '대구'], },
  { name: '충청도', filter: ['충청', '대전', '세종'], },
  { name: '강원도', filter: ['강원'], },
  { name: '경기도', filter: ['경기', '서울'], },
  { name: '인천/제주', filter: ['인천', '제주'], },
];

// 데이터 테이블 설정
export const TABLE_CONFIG = {
  ITEMS_PER_PAGE_OPTIONS: [
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: 100, title: '100' },
  ]
}