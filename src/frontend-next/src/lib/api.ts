import { ApiResponse, ControlPayload, WeatherDevice } from './types';

// 모바일 접속 시에도 백엔드에 접근할 수 있도록 동적 API URL 설정
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // 서버사이드: localhost 사용
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }

  // 클라이언트사이드: 현재 호스트의 IP를 사용
  const host = window.location.hostname;

  // localhost나 127.0.0.1이면 그대로 사용
  if (host === 'localhost' || host === '127.0.0.1') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }

  // 그 외의 경우 (192.168.0.51 등) 같은 호스트의 8080 포트 사용
  return `http://${host}:8080/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Refres Token 관련 변수
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('토큰 갱신 실패');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃 처리
    console.error('Error refreshing access token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// ============================ API 호출 함수 ============================

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // localStorage 토큰 가져오기
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // 401 에러 - 토큰 만료 가능성
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          if (newToken) {
            // 토큰 갱신 성공 - 대기 중인 요청들에게 알림
            onRefreshed(newToken);
            // 원래 요청 재시도
            return fetchApi<T>(endpoint, options);
          } else {
            // 토큰 갱신 실패 - 로그인 페이지로 이동
            window.location.href = '/login';
            throw new Error('인증이 만료 되었습니다. 다시 로그인 해주세요');
          }
        } else {
          // 다른 요청이 토큰 갱신 중 - 대기 후 재시도
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken: string) => {
              fetchApi<T>(endpoint, options).then(resolve).catch(reject);
            });
          });
        }
      }
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const weathersiApi = {
  // getAreas 응답 타입
  getAreas: () => fetchApi<ApiResponse<[]>>('/weathersi/areaList'),

  // getDevices - bdongCd가 '%' 또는 undefined면 전체, 아니면 해당 시도 코드로 검색
  getDevices: (bdongCd?: string) => {
    if (!bdongCd || bdongCd === '%') {
      return fetchApi<ApiResponse<WeatherDevice[]>>('/weathersi/devices');
    }
    return fetchApi<ApiResponse<WeatherDevice[]>>(`/weathersi/devices?BDONG_CD=${bdongCd}`);
  },
  getErrorDevices: (bdongCd?: string) => {
    if (!bdongCd || bdongCd === '%') {
      return fetchApi<ApiResponse<WeatherDevice[]>>('/weathersi/errorDevices');
    }
    return fetchApi<ApiResponse<WeatherDevice[]>>(`/weathersi/errorDevices?BDONG_CD=${bdongCd}`);
  },
  getControlDevices: (bdongCd?: string) => {
    if (!bdongCd || bdongCd === '%') {
      return fetchApi<ApiResponse<WeatherDevice[]>>('/weathersi/control');
    }
    return fetchApi<ApiResponse<WeatherDevice[]>>(`/weathersi/control?BDONG_CD=${bdongCd}`);
  },

  // 제어 API
  sendBroadcast: (data: ControlPayload) =>
    fetchApi<ApiResponse<void>>('/weathersi/sendBrd', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sendDisplay: (data: ControlPayload) =>
    fetchApi<ApiResponse<void>>('/weathersi/sendDisplay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sendGate: (data: ControlPayload) =>
    fetchApi<ApiResponse<void>>('/weathersi/sendGate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const weathersrApi = {
  getAreas: () => fetchApi<ApiResponse<unknown>>('/weathersr/areaList'),
  getDevices: (bdongCd?: string) => {
    if (!bdongCd || bdongCd === '%') {
      return fetchApi<ApiResponse<WeatherDevice[]>>('/weathersr/devices');
    }
    return fetchApi<ApiResponse<WeatherDevice[]>>(`/weathersr/devices?BDONG_CD=${bdongCd}`);
  },
};

// ============================ 로그인 인증 관련 ============================

import { AuthResponse, SignUpRequest, SignInRequest, KakaoLoginRequest, User } from './types';

// 인증 관련 API
export const authApi = {
  // 회원가입
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }

    return response.json();
  },

  // 로그인
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '로그인에 실패했습니다.');
    }

    return response.json();
  },

  // 카카오 로그인
  kakaoLogin: async (data: KakaoLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/kakao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '카카오 로그인에 실패했습니다.');
    }

    return response.json();
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // 토큰 검증 및 사용자 정보 조회
  verify: async (): Promise<{ success: boolean; user: User }> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('토큰이 없습니다.');

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('토큰이 유효하지 않습니다.');
    }

    return response.json();
  },

  // 현재 사용자 정보 조회
  me: async (): Promise<{ success: boolean; user: User }> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }

    return response.json();
  },
};

// ============================ Admin API ============================

import {
  UserListQuery,
  UpdateUserRoleDto,
  UpdateUserPasswordDto,
  UpdateUserStatusDto,
  ControlHistoryQuery,
  ControlHistory,
} from './types';

export const adminApi = {
  // 사용자 관리
  getAllUsers: (query?: UserListQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.role) params.append('role', query.role);
    if (query?.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query?.search) params.append('search', query.search);

    return fetchApi<{ data: User[]; meta: any }>(`/admin/users?${params.toString()}`);
  },

  getUserById: (id: number) => fetchApi<User>(`/admin/users/${id}`),

  updateUserRole: (id: number, data: UpdateUserRoleDto) =>
    fetchApi<{ message: string; user: User }>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateUserPassword: (id: number, data: UpdateUserPasswordDto) =>
    fetchApi<{ message: string; userId: number }>(`/admin/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateUserStatus: (id: number, data: UpdateUserStatusDto) =>
    fetchApi<{ message: string; user: any }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: number) =>
    fetchApi<{ message: string; userId: number }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // 제어 이력 관리
  getAllControlHistory: (query?: ControlHistoryQuery) => {
    const params = new URLSearchParams();
    if (query?.BDONG_CD) params.append('BDONG_CD', query.BDONG_CD);
    if (query?.CD_DIST_OBSV) params.append('CD_DIST_OBSV', query.CD_DIST_OBSV);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.page) params.append('page', query.page.toString());

    return fetchApi<ApiResponse<ControlHistory[]>>(`/admin/control-history?${params.toString()}`);
  },

  getBroadcastHistory: (query?: ControlHistoryQuery) => {
    const params = new URLSearchParams();
    if (query?.BDONG_CD) params.append('BDONG_CD', query.BDONG_CD);
    if (query?.CD_DIST_OBSV) params.append('CD_DIST_OBSV', query.CD_DIST_OBSV);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.page) params.append('page', query.page.toString());

    return fetchApi<ApiResponse<ControlHistory[]>>(
      `/admin/control-history/broadcast?${params.toString()}`,
    );
  },

  getDisplayHistory: (query?: ControlHistoryQuery) => {
    const params = new URLSearchParams();
    if (query?.BDONG_CD) params.append('BDONG_CD', query.BDONG_CD);
    if (query?.CD_DIST_OBSV) params.append('CD_DIST_OBSV', query.CD_DIST_OBSV);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.page) params.append('page', query.page.toString());

    return fetchApi<ApiResponse<ControlHistory[]>>(
      `/admin/control-history/display?${params.toString()}`,
    );
  },

  getGateHistory: (query?: ControlHistoryQuery) => {
    const params = new URLSearchParams();
    if (query?.BDONG_CD) params.append('BDONG_CD', query.BDONG_CD);
    if (query?.CD_DIST_OBSV) params.append('CD_DIST_OBSV', query.CD_DIST_OBSV);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.page) params.append('page', query.page.toString());

    return fetchApi<ApiResponse<ControlHistory[]>>(
      `/admin/control-history/gate?${params.toString()}`,
    );
  },
};
