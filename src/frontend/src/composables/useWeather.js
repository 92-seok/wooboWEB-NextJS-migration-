// 데이터 공통로직 관리
import { ref, watch } from 'vue';
import { getAreaList, getDevices, getAreaListSR, getDevicesSR } from '@/api/weather.api';
import { filterAndSortArea as filterAreaHelper } from '@/utils/helpers';

export const useWeather = (type = 'SI') => {
  // 상태 관리
  const storageKey = `weather_${type}`;
  const areaList = ref([]);
  const areaList_selected = ref(localStorage.getItem(`${storageKey}_area`) || '%');
  const devices = ref([]);
  const search = ref(localStorage.getItem(`${storageKey}_search`) || '');
  const page = ref(Number(localStorage.getItem(`${storageKey}_page`)) || 1);
  const itemsPerPage = ref(Number(localStorage.getItem(`${storageKey}_itemsPerPage`)) || 50);

  // API 함수 선택 (SI or SR)
  const getAreaListAPI = type === 'SR' ? getAreaListSR : getAreaList;
  const getDevicesAPI = type === 'SR' ? getDevicesSR : getDevices;

  // 지역 목록 및 장비 데이터 조회
  const fetchData = async () => {
    try {
      const response_areaList = await getAreaListAPI();

      areaList.value = response_areaList.data.map(item => ({
        ...item,
        title: item.RM,
        value: item.ADMCODE,
      }));

      await fetchDevices();
    } catch (ex) {
      console.error('데이터 조회 오류: ', ex);
    }
  };

  // 장비 데이터 조회
  const fetchDevices = async (newArea = null) => {
    if (newArea !== null) {
      areaList_selected.value = newArea;
    }

    try {
      const response = await getDevicesAPI(areaList_selected.value);

      devices.value = response.data.map(item => ({
        ...item,
        SIDO_CD: areaList.value.find(area => area.value.slice(0, 4) === item.SIDO_CD)?.title.split(' ').slice(-1)[0]
      }));
    } catch (err) {
      console.error('장비 데이터 조회 오류:', err);
    }
  };


  // 지역 필터링 및 정렬하기
  const filterAndSortArea = (filterTerms) => {
    return filterAreaHelper(areaList.value, filterTerms);
  };

  // 네이버 지도 열기 (공통 로직)
  const openNaverMap = (item, os) => {
    let url = "";

    if (os.indexOf("Android") > 0) {
      url = `intent://place?lat=${item.LAT}&lng=${item.LON}&zoom=12&name=${encodeURIComponent(item.NM_DIST_OBSV)}&appname=com.woobo.online#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
      window.location.href = url;
    } else if (os.indexOf("iPhone") > 0) {
      url = `https://map.naver.com/p/search/${item.DTL_ADRES}?c=11.00,0,0,0,dh`;
      window.open(url, '_blank');
    } else {
      url = `http://map.naver.com/index.nhn?elng=${item.LON}&elat=${item.LAT}&pathType=0&showMap=true&etext=${item.NM_DIST_OBSV}& menu=route`;
      window.open(url, '_blank');
    }
  };

  // localStorage 자동 저장
  watch(areaList_selected, (val) => localStorage.setItem(`${storageKey}_area`, val));
  watch(search, (val) => localStorage.setItem(`${storageKey}_search`, val));
  watch(page, (val) => localStorage.setItem(`${storageKey}page`, val));
  watch(itemsPerPage, (val) => localStorage.setItem(`${storageKey}itemsPerPage`, val));


  return {
    // 상태
    areaList,
    areaList_selected,
    devices,
    search,
    page,
    itemsPerPage,

    // 메서드
    fetchData,
    fetchDevices,
    filterAndSortArea,
    openNaverMap,
  }
};