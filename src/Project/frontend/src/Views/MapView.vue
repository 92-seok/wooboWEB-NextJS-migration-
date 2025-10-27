<template>
  <div id="map" class="w-100 h-screen position-relative">

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";


// 초기값
var init_key = 'f4592e97c349ab41d02ff73bd314a201';
var init_lat = 36.0;
var init_lon = 128.0;
var init_level = 11;
var init_max_level = 11;
const g_lat = ref(init_lat);
const g_lon = ref(init_lon);

// 지도
let map = null;

onMounted(() => {
  console.log(`MapView.vue::onMounted() / ${window.kakao}`);

  if (window.kakao === undefined)
  {
    console.log("MapView.vue::scrip()");
    const script = document.createElement("script");
    /* global kakao */
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${init_key}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(loadMap);
    document.head.appendChild(script);
  }
  else
  {
    console.log("MapView.vue::loadMap()");
    loadMap();
  }

})

function loadMap()
{
  var lat = init_lat;
  var lon = init_lon;
  var zoom_level = init_level;
  var zoom_level_max = init_max_level;

  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
    level: zoom_level, // 지도의 확대 레벨
    maxLevel: zoom_level_max, // 최대의 최대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
    disableDoubleClick: true,
  };

  // 지도를 생성합니다
  map = new kakao.maps.Map(mapContainer, mapOption);
}

</script>

<style lang="scss" scoped>

</style>