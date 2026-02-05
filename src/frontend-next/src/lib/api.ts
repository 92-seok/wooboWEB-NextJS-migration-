export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export const weathersiApi = {
  getAreas: () => fetchApi('/weathersi/areaList'),
  getDevices: (bdongCd?: string) => {
    const url = bdongCd ? `/weathersi/devices?BDONG_CD=${bdongCd}` : '/weathersi/devices';
    return fetchApi(url);
  },
  getErrorDevices: (bdongCd?: string) => {
    const url = bdongCd ? `/weathersi/errorDevices?BDONG_CD=${bdongCd}` : '/weathersi/errorDevices';
    return fetchApi(url);
  },
  getControlDevices: (bdongCd?: string) => {
    const url = bdongCd ? `/weathersi/control?BDONG_CD=${bdongCd}` : '/weathersi/control';
    return fetchApi(url);
  },
  
  // 제어 API
  sendBroadcast: (data: any) => fetchApi('/weathersi/sendBrd', { method: 'POST', body: JSON.stringify(data) }),
  sendDisplay: (data: any) => fetchApi('/weathersi/sendDisplay', { method: 'POST', body: JSON.stringify(data) }),
  sendGate: (data: any) => fetchApi('/weathersi/sendGate', { method: 'POST', body: JSON.stringify(data) }),
};

export const weathersrApi = {
  getAreas: () => fetchApi('/weathersr/areaList'),
  getDevices: (bdongCd?: string) => {
    const url = bdongCd ? `/weathersr/devices?BDONG_CD=${bdongCd}` : '/weathersr/devices';
    return fetchApi(url);
  },
};
