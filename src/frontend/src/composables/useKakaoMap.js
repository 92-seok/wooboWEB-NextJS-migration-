import { ref } from 'vue';
import { MAP_CONFIG } from '@/config/constants';

export const useKakaoMap = () => {
  const map = ref(null);
  const isMapLoaded = ref(false);

  // 카카오 지도 SDK 로드
  const loadKakaoMapSDK = (callback) => {
    if (window.kakao && window.kakao.maps) {
      // 이미 로드가 됨
      window.kakao.maps.load(callback);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${MAP_CONFIG.KAKAO_API_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(callback);
    };
    document.head.appendChild(script);
  };

  // 기본 지도 생성
  const createMap = (containerId, options = {}) => {
    const defaultOptions = {
      center: new kakao.maps.LatLng(MAP_CONFIG.INIT_LAT, MAP_CONFIG.INIT_LON),
      level: MAP_CONFIG.INIT_LEVEL,
      maxLevel: MAP_CONFIG.MAX_LEVEL,
      mapTypeId: kakao.maps.MapTypeId.ROADMAP,
      disableDoubleClick: true,
    };

    const mapContainer = document.getElementById(containerId);
    const mapOptions = { ...defaultOptions, ...options };

    map.value = new kakao.maps.Map(mapContainer, mapOptions);
    isMapLoaded.value = true;

    return map.value;
  };

  // 지도 컨트롤 추가 (지도타입, 줌)
  const addMapControls = (mapInstance = map.value) => {
    if (!mapInstance) return;

    // 지도 타입 컨트롤
    const mapTypeControl = new kakao.maps.MapTypeControl();
    mapInstance.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    // 줌 컨트롤
    const zoomControl = new kakao.maps.ZoomControl();
    mapInstance.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  };

  // 마커 생성
  const createMarker = (position, options = {}) => {
    return new kakao.maps.Marker({
      position,
      ...options
    });
  };

  // 중심 좌표 이동
  const setCenter = (lat, lon) => {
    if (!map.value) return;
    const moveLatLon = new kakao.maps.LatLng(lat, lon);
    map.value.setCenter(moveLatLon);
  };

  // 부드럽게 이동
  const panTo = (lat, lon) => {
    if (!map.value) return;
    const moveLatLon = new kakao.maps.LatLng(lat, lon);
    map.value.panTo(moveLatLon);
  };

  return {
    map,
    isMapLoaded,
    loadKakaoMapSDK,
    createMap,
    addMapControls,
    createMarker,
    setCenter,
    panTo,
  };
}
