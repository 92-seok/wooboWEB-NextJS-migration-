export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface WeatherDevice {
  IDX: string;
  NM_DIST_OBSV: string;
  BDONG_CD?: string;
  STATUS?: string;

  // 수위 관련
  waterLevel?: string | number;
  averageVelocity?: string | number;
  totalDischarge?: string | number;

  // 위치 정보
  DTL_ADRES?: string;
  LAT?: string | number;
  LON?: string | number;

  // 로거 정보
  LOGGER_TIME?: string;
  LOGGER_GL?: string | number;
  LOGGER_FL?: string | number;

  // 에러 장비 관련
  CD_DIST_OBSV?: string;
  GB_OBSV?: string; // 장비 구분 코드
  LastDate?: string; // 마지막 수신 시간
  IP?: string;
  PORT?: string;
  ErrorChk?: string | number; // 상태 코드
}

// 제어 명령 페이로드 타입 (필요한 필드를 추가해서 확장 가능)
export interface ControlPayload {
  targetId?: string;
  command?: string;
  value?: string | number;
  [key: string]: unknown; // 추가 필드 허용
}

// 인증 관련 타입
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpRequest {
  username: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface KakaoLoginRequest {
  code: string;
  domain: string;
}

// Admin 관련 타입 추가
export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UpdateUserRoleDto {
  role: string;
}

export interface UpdateUserPasswordDto {
  newPassword: string;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
}

// 제어 이력 관련 타입
export interface ControlHistory {
  IDX: number;
  uniqueId?: string;
  BDONG_CD: string;
  CD_DIST_OBSV: string;
  NM_DIST_OBSV?: string;
  Auth: string;
  userName?: string;
  type: "broadcast" | "display" | "gate";
  dtmCreate: string;
  dtmUpdate?: string;
  RegDate?: string;
  // broadcast 관련
  RCMD?: string;
  Parm1?: string;
  Parm2?: string;
  Parm3?: string;
  Parm4?: string;
  BStatus?: string;
  RetData?: string;
  RetDate?: string;
  // gate 관련
  Gate?: string;
  Light?: string;
  Sound?: string;
  GStatus?: string;
}

export interface ControlHistoryQuery {
  BDONG_CD?: string;
  CD_DIST_OBSV?: string;
  limit?: number;
  page?: number;
}
