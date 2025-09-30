<template>
  <div id="map" />
</template>

<script setup>
import { ref, onMounted, toRaw } from "vue";
import axios from "axios";

const map = ref(null);
const markers = ref([]);
const infowindow = ref(null);

const initMap = () => {
  var lat = '35.3';
  var lon = '128.0';
  var zoom_level = 13;
  var zoom_level_max = 14;

  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
    level: zoom_level, // 지도의 확대 레벨
    maxLevel: zoom_level_max, // 최대의 최대 레벨
  };

  map.value = new kakao.maps.Map(mapContainer, mapOption);
  /* 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다*/
  var mapTypeControl = new kakao.maps.MapTypeControl();
  map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
  map.value.setMapTypeId(kakao.maps.MapTypeId.HYBRID);

  /* 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성합니다. */
  var zoomControl = new kakao.maps.ZoomControl();
  map.value.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
};

const changeSize = (size) => {
  const container = document.getElementById("map");
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  toRaw(map.value).relayout();
};

const displayMarker = (markerPositions) => {
  if (markers.value.length > 0) {
    markers.value.forEach((marker) => marker.setMap(null));
  }

  const positions = markerPositions.map(
    (pos) => new kakao.maps.LatLng(pos[0], pos[1])
  );

  if (positions.length > 0) {
    markers.value = positions.map(
      (position) =>
        new kakao.maps.Marker({
          map: toRaw(map.value),
          position,
        })
    );

    const bounds = positions.reduce(
      (bounds, latlng) => bounds.extend(latlng),
      new kakao.maps.LatLngBounds()
    );

    toRaw(map.value).setBounds(bounds);
  }
};

const displayInfoWindow = () => {
  if (infowindow.value && toRaw(infowindow.value).getMap()) {
    toRaw(map.value).setCenter(toRaw(infowindow.value).getPosition());
    return;
  }

  var iwContent = '<div style="padding:5px;">Hello World!</div>',
    iwPosition = new kakao.maps.LatLng(33.450701, 126.570667),
    iwRemoveable = true;

  infowindow.value = new kakao.maps.InfoWindow({
    map: toRaw(map.value),
    position: iwPosition,
    content: iwContent,
    removable: iwRemoveable,
  });

  toRaw(map.value).setCenter(iwPosition);
};


onMounted(async () => {
  console.log("onMounted()");

  if (window.kakao && window.kakao.maps) {
    // console.log('window.kakao == true')
    initMap();
    await loadMapData();
  }
  else {
    /* global kakao */
    const script = document.createElement("script");
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=f4592e97c349ab41d02ff73bd314a201&libraries=services";
    document.head.appendChild(script);
    script.onload = async () => {
      // console.log('script.onload()');
      kakao.maps.load(initMap);
      await loadMapData()
    }

  }

});

const loadMapData = async () => {
  try {
    const response = await axios.get(`/api/devices`)
    const devices = response.data.data
    const positions = devices
      .filter(row => row.LAT && row.LON)   // 값 없는 데이터 제외
      .map(row => [Number(row.LAT), Number(row.LON)]);

    displayMarker(positions);

  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
}
</script>


<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
<!--

<script setup>

import { onMounted, inject } from 'vue';
const { Title } = 'HOME';
onMounted(() => {
    document.title = inject('$title');
});

//스크립트 태그 생성
const script = document.createElement("script");
//스크립트 태그에 src 속성 추가
script.src = '//dapi.kakao.com/v2/maps/sdk.js?autoload=true&appkey=f4592e97c349ab41d02ff73bd314a201&libraries=services"';
//헤더에 해당 스크립트를 추가
document.head.appendChild(script);

script.onload = () => {
    kakao.maps.load(() => {
        var container = document.getElementById('kakaoMap'); //지도를 담을 영역의 DOM 레퍼런스
        var options = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };
        //eslint-disable-next-line no-unused-vars
        var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
    });
}

</script>

<style lang="scss" scoped></style>
-->