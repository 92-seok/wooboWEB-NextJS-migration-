// * DB와 주고 받는 API 함수 모음 *

import axios from 'axios';
import dayjs from 'dayjs';

// ------------ WeatherSI ------------
// * 지역 목록 조회 API *
export const getAreaList = async () => {
  const response = await axios.get('/api/weathersi/areaList');
  return response.data;
}

// * 장비 목록 조회 API *
export const getDevices = async (bdongCd) => {
  const response = await axios.get(`/api/weathersi/devices?BDONG_CD=${bdongCd}`)
  return response.data
};

// * 방송장비 제어 API *
export const sendBroadcast = async (item, message) => {
  const response = await axios.post('/api/weathersi/sendBrd', {
    BDONG_CD: item.BDONG_CD,
    CD_DIST_OBSV: item.CD_DIST_OBSV,
    RCMD: 'B010',
    Parm1: '00000000',
    Parm2: '1',
    Parm3: message,
    BStatus: 'start',
    RegDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  return response
};

// * 차단기 제어 API *
export const sendGateControl = async (item, gate) => {
  const response = await axios.post('/api/weathersi/sendGate', {
    BDONG_CD: item.BDONG_CD,
    CD_DIST_OBSV: item.CD_DIST_OBSV,
    Gate: gate,
    GStatus: 'start',
  })
  return response
};

// * 차단기 제어 API *
export const sendDisplayControl = async (item) => {
  const response = await axios.post('/api/weathersi/sendDisplay', {
    BDONG_CD: item.BDONG_CD,
    CD_DIST_OBSV: item.CD_DIST_OBSV,
    RCMD: 'S170',
    Parm1: '',
    Parm2: '',
    Parm3: '',
    BStatus: 'start',
  })
  return response
};

// ------------ WeatherSR ------------
// * 지역 목록 조회 API *
export const getAreaListSR = async () => {
  const response = await axios.get('/api/weathersr/areaList');
  return response.data;
}

// * 장비 목록 조회 API *
export const getDevicesSR = async (bdongCd) => {
  const response = await axios.get(`/api/weathersr/devices?BDONG_CD=${bdongCd}`)
  return response.data
};
