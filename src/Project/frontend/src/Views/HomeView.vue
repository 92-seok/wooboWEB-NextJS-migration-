<template>
  <v-row class="ma-0">
    <div class="map_wrap">
      <div id="map"></div>
      <v-row>
        <v-col cols="11">
          <div class="hAddr">
            <v-chip color="indigo" label size="large">
              <v-icon icon="mdi-label" start></v-icon>
              <span id="centerAddr"></span>&nbsp;
              <span>({{ g_lat.toFixed(4) }}, {{ g_lon.toFixed(4) }})</span>
            </v-chip>
          </div>
        </v-col>
        <v-col cols="1">
          <v-btn @click="initPosition()">
            <v-icon icon="mdi-crosshairs-gps" color="green"></v-icon>
            <span> 내 위치 </span>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div id="menu_wrap" class="bg_white">
            <div class="option">
              <div>
                <form onsubmit="searchPlaces(); return false;">
                  키워드 : <input type="text" value="이태원 맛집" id="keyword" size="15">
                  <button type="submit">검색하기</button>
                </form>
              </div>
            </div>
            <hr>
            <ul id="placesList"></ul>
            <div id="pagination"></div>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-row>
</template>

<script setup>
import { ref, onMounted, toRaw } from "vue";
import axios from "axios";

let map = null;
var init_lat = 36.0;
var init_lon = 128.0;
var init_level = 5;
const g_lat = ref(init_lat);
const g_lon = ref(init_lon);

var geocoder = null;

const markers = null;
var infowindow = null;


onMounted(async () => {
  console.log("onMounted()");

  /* global kakao */
  const script = document.createElement("script");
  script.src = "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=f4592e97c349ab41d02ff73bd314a201&libraries=services,clusterer";
  script.onload = async () => {
    console.log('script.onload()');
    kakao.maps.load(() => {

      var lat = '36.3';
      var lon = '128.0';
      var zoom_level = 12;
      var zoom_level_max = 13;

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
        level: zoom_level, // 지도의 확대 레벨
        maxLevel: zoom_level_max, // 최대의 최대 레벨
        mapTypeId: kakao.maps.MapTypeId.ROADMAP
      };

      // 지도를 생성합니다
      map = new kakao.maps.Map(mapContainer, mapOption);

      // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
      var mapTypeControl = new kakao.maps.MapTypeControl();

      // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
      map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

      // 지도에 지형정보를 표시하도록 지도타입을 추가합니다
      //map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);

      // 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성합니다.
      var zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

      // 장소 검색 객체를 생성합니다.
      var ps = new kakao.maps.services.Places();

      // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
      var infowindow = new kakao.maps.InfoWindow({ zindex: 1 }); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

      // 주소-좌표 변환 객체를 생성합니다
      geocoder = new kakao.maps.services.Geocoder();

      // 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
      searchAddrFromCoords(map.getCenter(), displayCenterInfo);

      if (navigator.geolocation) {
        // GeoLocation을 이용해서 접속 위치를 얻어옵니다
        navigator.geolocation.getCurrentPosition(function (position) {

          init_lat = position.coords.latitude; // 위도
          init_lon = position.coords.longitude; // 경도

          var locPosition = new kakao.maps.LatLng(init_lat, init_lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다

          // 지도를 클릭한 위치에 표출할 마커입니다
          var marker = new kakao.maps.Marker({
            // 지도 중심좌표에 마커를 생성합니다
            position: locPosition,
            image: new kakao.maps.MarkerImage("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_drag.png", new kakao.maps.Size(50, 50)),
          });
          // 지도에 마커를 표시합니다
          marker.setMap(map);
        });
      }
      else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

        var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
          message = 'geolocation을 사용할수 없어요..'

        console.log('실패');
      }

      // 지도를 클릭한 위치에 표출할 마커입니다
      var marker = new kakao.maps.Marker({
        // 지도 중심좌표에 마커를 생성합니다
        position: map.getCenter(),
      });
      // 지도에 마커를 표시합니다
      marker.setMap(map);
      // 마커가 드래그 가능하도록 설정합니다
      marker.setDraggable(true);

      // 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다
      kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
        searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
            detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

            var content = '<div class="bAddr">' +
              '<span class="title">법정동 주소정보</span>' +
              detailAddr +
              '</div>' +
              '<div>' +
              `위도: ${mouseEvent.latLng.getLat()}` +

              '</div>' +
              '<div>' +
              `경도: ${mouseEvent.latLng.getLng()}` +
              '</div>';

            // 마커를 클릭한 위치에 표시합니다 
            marker.setPosition(mouseEvent.latLng);
            marker.setMap(map);

            // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
            infowindow.setContent(content);
            infowindow.open(map, marker);
          }
        });
      });

      // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
      kakao.maps.event.addListener(map, 'idle', function () {
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);
        g_lat.value = map.getCenter().getLat();
        g_lon.value = map.getCenter().getLng();
      });
    });
  }
  document.head.appendChild(script);
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

function setCenter(lat, lon) {
  // 이동할 위도 경도 위치를 생성합니다
  var moveLatLon = new kakao.maps.LatLng(lat, lon);

  // 지도 중심을 이동 시킵니다
  map.setCenter(moveLatLon);
}

function panTo(lat, lon) {
  // 이동할 위도 경도 위치를 생성합니다
  var moveLatLon = new kakao.maps.LatLng(lat, lon);

  // 지도 중심을 부드럽게 이동시킵니다
  // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
  map.panTo(moveLatLon);
}

function zoomIn() {
  // 현재 지도의 레벨을 얻어옵니다
  var level = map.getLevel();

  // 지도를 1레벨 내립니다 (지도가 확대됩니다)
  map.setLevel(level - 1);
}

function zoomOut() {
  // 현재 지도의 레벨을 얻어옵니다
  var level = map.getLevel();

  // 지도를 1레벨 올립니다 (지도가 축소됩니다)
  map.setLevel(level + 1);
}

// 버튼 클릭에 따라 지도 이동 기능을 막거나 풀고 싶은 경우에는 map.setDraggable 함수를 사용합니다
function setDraggable(draggable) {
  // 마우스 드래그로 지도 이동 가능여부를 설정합니다
  map.setDraggable(draggable);
}

// 버튼 클릭에 따라 지도 확대, 축소 기능을 막거나 풀고 싶은 경우에는 map.setZoomable 함수를 사용합니다
function setZoomable(zoomable) {
  // 마우스 휠로 지도 확대,축소 가능여부를 설정합니다
  map.setZoomable(zoomable);
}

function setBounds(bounds) {
  // LatLngBounds 객체에 추가된 좌표들을 기준으로 지도의 범위를 재설정합니다
  // 이때 지도의 중심좌표와 레벨이 변경될 수 있습니다
  map.setBounds(bounds);
}

function initPosition() {
  map.setLevel(init_level);
  panTo(init_lat, init_lon);
}

function searchAddrFromCoords(coords, callback) {
  // 좌표로 행정동 주소 정보를 요청합니다
  geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function searchDetailAddrFromCoords(coords, callback) {
  // 좌표로 법정동 상세 주소 정보를 요청합니다
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
function displayCenterInfo(result, status) {
  if (status === kakao.maps.services.Status.OK) {
    var infoDiv = document.getElementById('centerAddr');

    for (var i = 0; i < result.length; i++) {
      // 행정동의 region_type 값은 'H' 이므로
      if (result[i].region_type === 'H') {
        infoDiv.innerHTML = result[i].address_name;
        break;
      }
    }
  }
}

window.onresize = function () {
  //alert("onresize" + g_lat.value + g_lon.value);

  // 빠르게 이동
  map.setCenter(new kakao.maps.LatLng(g_lat.value, g_lon.value));

  // 부드럽게 이동
  map.panTo(new kakao.maps.LatLng(g_lat.value, g_lon.value));
};
</script>


<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}

.map_wrap {
  position: relative;
  width: 100%;
  height: 350px;
}

.title {
  font-weight: bold;
  display: block;
}

.hAddr {
  position: absolute;
  left: 10px;
  top: 10px;
  border-radius: 2px;
  background: #fff;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
  padding: 5px;
}

#centerAddr {
  display: block;
  margin-top: 2px;
  font-weight: normal;
}

.bAddr {
  padding: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

#menu_wrap {
  position: absolute;
  top: 50px;
  left: 0;
  bottom: 0;
  width: 250px;
  margin: 10px 0 30px 10px;
  padding: 5px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
  font-size: 14px;
  border-radius: 10px;
}

.bg_white {
  background: #fff;
}

#menu_wrap hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 2px solid #5F5F5F;
  margin: 3px 0;
}

#menu_wrap .option {
  text-align: center;
}

#menu_wrap .option p {
  margin: 10px 0;
}

#menu_wrap .option button {
  margin-left: 5px;
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