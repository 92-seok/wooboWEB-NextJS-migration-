import { ref, watch, computed } from 'vue';
import { getErrorDevices, getErrorDevicesSR, getAreaList, getAreaListSR } from '@/api/weather.api';
import { calculateDaysSince } from '@/utils/format';
import { filterAndSortArea as filterAreaHelper } from '@/utils/helpers';

export const useErrorDevices = (type = 'SI') => {
  const storageKey = `error_${type}`;
  const areaList = ref([]);
  const areaList_selected = ref(localStorage.getItem(`${storageKey}_area`) || '%');
  const devices = ref([]);
  const search = ref(localStorage.getItem(`${storageKey}_search`) || '');
  const page = ref(Number(localStorage.getItem(`${storageKey}_page`) || 1));
  const itemsPerPage = ref(Number(localStorage.getItem(`${storageKey}_itemsPerPage`) || 50));
  const loading = ref(false);

  // API 함수 선택하기
  const getErrorDevicesAPI = type === 'SR' ? getErrorDevicesSR : getErrorDevices;
  const getAreaListAPI = type === 'SR' ? getAreaListSR : getAreaList;

  // 장비 데이터 경과일 추가
  const devicesWithDays = computed(() => {
    return devices.value.map(item => ({
      ...item,
      daysSince: calculateDaysSince(item.LastDate)
    }));
  });

  // 지역 목록 및 에러 장비 데이터 조회
  const fetchData = async () => {
    loading.value = true;
    try {
      const response_areaList = await getAreaListAPI();

      areaList.value = response_areaList.data.map(item => ({
        ...item,
        title: item.RM,
        value: item.ADMCODE,
      }));

      await fetchErrorDevices();
    } catch (ex) {
      console.error('데이터 조회 오류: ', ex);
    } finally {
      loading.value = false;
    }
  };

  // 에러 장비 데이터 조회
  const fetchErrorDevices = async (newArea = null) => {
    if (newArea !== null) {
      areaList_selected.value = newArea;
    }

    loading.value = true;
    try {
      const response = await getErrorDevicesAPI(areaList_selected.value);

      devices.value = response.data.map(item => ({
        ...item,
        SIDO_CD: areaList.value.find(area => area.value.slice(0, 4) === item.SIDO_CD)?.title.split(' ').slice(-1)[0]
      }));
    } catch (ex) {
      console.error('에러 장비 데이터 조회 오류: ', ex);
    } finally {
      loading.value = false;
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
  watch(page, (val) => localStorage.setItem(`${storageKey}_page`, val));
  watch(itemsPerPage, (val) => localStorage.setItem(`${storageKey}_itemsPerPage`, val));

  return {
    // 상태
    areaList,
    areaList_selected,
    devices,
    devicesWithDays,
    search,
    page,
    itemsPerPage,
    loading,

    // 메서드
    fetchData,
    fetchErrorDevices,
    filterAndSortArea,
    openNaverMap,
  }
}