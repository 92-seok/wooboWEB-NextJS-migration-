<template>
  <div class="d-flex flex-column">

    <div id="map" class="w-100 h-screen position-relative" style="z-index:1">
      <div class="position-absolute top-0 left-0" style="z-index:2">
        <v-chip color="indigo">
          <v-icon icon="mdi-label" start></v-icon>
          <span id="centerAddr"></span>&nbsp;
          <span>({{ g_lat.toFixed(4) }}, {{ g_lon.toFixed(4) }})</span>
        </v-chip>

        <v-col>
          <div id="menu_wrap" class="position-absolute bg_white ">
            <div class="option">
              <div>
                <form onsubmit="searchPlaces(); return false;">
                  키워드 : <input type="text" value="우보재난시스템" id="keyword" size="15">
                  <button type="submit">검색하기</button>
                </form>
              </div>
            </div>
            <hr>
            <ul id="placesList"></ul>
            <div id="pagination"></div>
          </div>
        </v-col>
      </div>
      <!--
      <div class="position-absolute bottom-0 right-0" style="z-index:3">
        <v-btn @click="initPosition()">
          <v-icon icon="mdi-crosshairs-gps" color="primary"></v-icon>
          <span> 내 위치 </span>
        </v-btn>
      </div>
      -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import axios from "axios";

// composable IMPORT
import { useKakaoMap } from '@/composables/useKakaoMap';

// config IMPORT
import { MAP_CONFIG } from '@/config/constants';

// 초기값
var init_lat = 36.0;
var init_lon = 128.0;
var init_level = 11;
var init_max_level = 11;
const g_lat = ref(init_lat);
const g_lon = ref(init_lon);

// 지도
let map = null;

// 마커
let marker = null;

// 정보창
let infowindow = null;
let mapCustomOverlay = null;

// 장소 서비스
let place = null;

// 주소 좌표 변환 객체
let geocoder = null;

var rvContainer = null;
var rv = null;
var rvClient = null;
var rvCustomOverlay = null;

onMounted(() => {
  console.log("onMounted()");

  const { loadKakaoMapSDK } = useKakaoMap();



  /* global kakao */
  // const script = document.createElement("script");
  // script.src = "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=f4592e97c349ab41d02ff73bd314a201&libraries=services";
  // script.onload = async () => {
  //   console.log('script.onload()');
  //   kakao.maps.load(() => 
  loadKakaoMapSDK(() => {

    var lat = init_lat;
    var lon = init_lon;
    var zoom_level = init_level;
    var zoom_level_max = init_max_level;

    // 내 위치 기반 init 값 초기화
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
      console.log('GeoLocation(): 사용자 위치 파악 실패');
    }

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
    place = new kakao.maps.services.Places();

    // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
    //infowindow = new kakao.maps.InfoWindow({ zindex: 1 }); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다
    infowindow = new kakao.maps.InfoWindow({}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

    // 커스텀 오버레이를 생성합니다
    //mapCustomOverlay = new kakao.maps.CustomOverlay({ xAnchor: 0.5, yAnchor: 1.1, zIndex: 1 });
    mapCustomOverlay = new kakao.maps.CustomOverlay({ xAnchor: 0.5, yAnchor: 1.1 });

    // 주소-좌표 변환 객체를 생성합니다
    geocoder = new kakao.maps.services.Geocoder();

    // 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);



    // 지도를 클릭한 위치에 표출할 마커입니다
    marker = new kakao.maps.Marker();
    // 지도 중심좌표에 마커를 생성합니다
    //marker.setPosition(map.getCenter());
    // 지도에 마커를 표시합니다
    //marker.setMap(map);
    // 마커가 드래그 가능하도록 설정합니다
    //marker.setDraggable(true);

    // 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'click', function (mouseEvent) {

      var latLon = mouseEvent.latLng;
      var lat = latLon.getLat().toFixed(4);
      var lon = latLon.getLng().toFixed(4);
      var detailRoadAddr = '';
      var detailAddr = '';

      // 마커를 클릭한 위치에 표시합니다
      marker.setPosition(latLon);
      marker.setMap(map);
      map.panTo(latLon);

      searchDetailAddrFromCoords(latLon, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          detailRoadAddr = !!result[0].road_address ? result[0].road_address.address_name : '';
          detailAddr = result[0].address.address_name;
        }
        else {
          detailRoadAddr = detailAddr = '주소정보 없음';
        }

        console.log(detailAddr);

        var content = '<div style="backgournd: red;" class="overlay_info">';
        content += `    <strong>${detailAddr}</strong>`;
        content += `<div class="desc">`;
        content += `위경도: ${lat} / ${lon} <button @click="reserve"><U>복사</U></button>`;
        content += `</div>`;
        content += `<div id="roadview" style="height:200px"></div>`;
        content += `<div>로드뷰 방향전환: 마우스 우클릭</div>`;
        content += '</div>';
        /*
      `<div><string>${detailAddr}</string></div>` +
      `<div>${detailRoadAddr ? `(${detailRoadAddr})` : ''}</div>` +
      `<div class="desc">` +
      `위도: ${lat} <button @click="reserve">복사</button>` +
      `<span style="display:inline-block; width:30px"></span>` +
      `경도: ${lon} <button @click="reserve">복사</button>` +
      `</div>` +
      */
        '</div>'
          ;

        mapCustomOverlay.setPosition(latLon);
        mapCustomOverlay.setContent(content);
        mapCustomOverlay.setMap(map);

        var rvContainer = document.getElementById('roadview'); //로드뷰를 표시할 div
        var rv = new kakao.maps.Roadview(rvContainer); //로드뷰 객체
        var rvClient = new kakao.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체
        // 커스텀 오버레이를 생성합니다
        rvCustomOverlay = new kakao.maps.CustomOverlay({
          xAnchor: 0.5, // 커스텀 오버레이의 x축 위치입니다. 1에 가까울수록 왼쪽에 위치합니다. 기본값은 0.5 입니다
          yAnchor: 0.5 // 커스텀 오버레이의 y축 위치입니다. 1에 가까울수록 위쪽에 위치합니다. 기본값은 0.5 입니다
        });

        //지도의 중심좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
        rvClient.getNearestPanoId(latLon, 100, function (panoId) {
          rv.setPanoId(panoId, latLon); //panoId와 중심좌표를 통해 로드뷰 실행

          //rvCustomOverlay.setAltitude(2); //커스텀 오버레이의 고도값을 설정합니다.(로드뷰 화면 중앙이 0입니다)
          rvCustomOverlay.setMap(rv);

          var projection = rv.getProjection(); // viewpoint(화면좌표)값을 추출할 수 있는 projection 객체를 가져옵니다.

          // 커스텀오버레이의 position과 altitude값을 통해 viewpoint값(화면좌표)를 추출합니다.
          var viewpoint = projection.viewpointFromCoords(rvCustomOverlay.getPosition(), rvCustomOverlay.getAltitude());

          rv.setViewpoint(viewpoint); //커스텀 오버레이를 로드뷰의 가운데에 오도록 로드뷰의 시점을 변화 시킵니다.
        });


        // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
        //infowindow.setContent(content);

        // 인포윈도우를 클릭한 위치표시합니다
        //infowindow.open(map, marker);
      });
    });

    // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'idle', function () {
      searchAddrFromCoords(map.getCenter(), displayCenterInfo);
      g_lat.value = map.getCenter().getLat();
      g_lon.value = map.getCenter().getLng();
    });
  });
  // }

  // document.head.appendChild(script);

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

function reserve() {
  console.writeline("reserve()");
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
  map.setLevel(5);
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
        infoDiv.innerHTML = result[i].address_name ? `${result[i].address_name}` : '';
        break;
      }
    }
  }
}

window.onresize = function () {
  //alert("onresize" + g_lat.value + g_lon.value);

  if (kakao == null)
    return;

  if (g_lat.value == null || g_lon.value == null)
    return;

  // 빠르게 이동
  map.setCenter(new kakao.maps.LatLng(g_lat.value, g_lon.value));

  // 부드럽게 이동
  map.panTo(new kakao.maps.LatLng(g_lat.value, g_lon.value));
};
</script>

<style>
.overlay_info {
  border-radius: 6px;
  margin-bottom: 12px;
  float: left;
  position: relative;
  border: 1px solid #ccc;
  border-bottom: 2px solid #ddd;
  background-color: #fff;
}

.overlay_info:nth-of-type(n) {
  border: 0;
  box-shadow: 0px 1px 2px #888;
}

.overlay_info a {
  display: block;
  background: #d95050;
  background: #d95050 url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png) no-repeat right 14px center;
  text-decoration: none;
  color: #fff;
  padding: 12px 36px 12px 14px;
  font-size: 14px;
  border-radius: 6px 6px 0 0
}

.overlay_info a strong {
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/place_icon.png) no-repeat;
  padding-left: 27px;
}

.overlay_info .desc {
  padding: 14px;
  position: relative;
  min-width: 190px;
  height: 56px
}

.overlay_info img {
  vertical-align: top;
}

.overlay_info .address {
  font-size: 12px;
  color: #333;
  position: absolute;
  left: 80px;
  right: 14px;
  top: 24px;
  white-space: normal
}

.overlay_info:after {
  content: '';
  position: absolute;
  margin-left: -11px;
  left: 50%;
  bottom: -12px;
  width: 22px;
  height: 12px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png) no-repeat 0 bottom;
}
</style>

<style scoped>
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
  left: 10px;
  right: 10px;
  top: 10px;
  border-radius: 2px;
  background: #fff;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;

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
  top: 80px;
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

</script>

<style lang="scss" scoped></style>
-->