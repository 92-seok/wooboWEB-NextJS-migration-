<template>
  <v-container max-width="960px" fluid>
    <!-- 지역 메뉴 (전국, 전라도, 경상도, 충청도, 강원도, 경기도, 인천/제주도) -->
    <v-sheet class="mx-auto">
      <v-slide-group v-model="model" center-active>
        <v-menu v-for="(menu, index) in menuList" :key="index" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-scale-transition>
              <v-btn class="pa-0" size="large" style="min-width: 50px;" :color="theme_color" v-bind="props">
                {{ menu.name }}</v-btn>
            </v-scale-transition>
          </template>

          <v-list>
            <v-list-item v-for="(item, i) in filterAndSortArea(menu.filter)" :key="i" :value="i">
              <v-list-item-title @click="OnChange_AreaList(item.value)">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-slide-group>

      <!-- 지역 검색 창-->
      <v-autocomplete :items="areaList" label="지역 검색" variant="solo-filled" v-model="areaList_selected"
        @update:model-value="OnChange_AreaList">
        <template #no-data> </template>
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
      </v-autocomplete>
    </v-sheet>

    <v-card flat>
      <!--장비 검색 창 -->
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-list-box-outline"></v-icon> &nbsp;
        <v-btn @click="Process()">
          <span>장비 목록</span>
          <v-icon icon="mdi-refresh"></v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-text-field v-model="search" density="compact" label="장비 검색" prepend-inner-icon="mdi-magnify"
          variant="outlined" flat hide-details>
        </v-text-field>
      </v-card-title>

      <!-- 프로그레스 타이머 -->
      <v-progress-linear :color="theme_color" v-model="process_time" height="5" :max="refresh_time" />

      <v-divider />

      <!-- 장비 현황 카드 -->
      <v-row v-if="areaList_selected != '%'" class="d-flex mt-2 mb-2 ma-1 text-center" style="justify-content: center;">
        <v-col cols="4" class="pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #7986CB, #5C6BC0, #3949AB, #303F9F)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>전체</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{ devices.length }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #81C784, #66BB6A, #43A047, #388E3C)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>정상</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{devices.filter(item => item.ErrorChk > '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>점검필요</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{devices.filter(item => item.ErrorChk == '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider />

      <!-- 데이터 테이블 -->
      <v-data-table class="table-fit pa-0" :mobile-breakpoint="0" density="comfortable" :search="search"
        :filter-keys="['NM_DIST_OBSV']" :headers="headers"
        :header-props="{ align: 'start', style: 'font-weight: bold;' }" :items="devices"
        :cell-props="{ align: 'start' }" item-value="IDX" show-expand v-model:page="page"
        v-model:items-per-page="itemsPerPage" items-per-page-text="페이지당 표시 수" :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]" multi-sort hover fixed-header height="calc(100vh - 50px)" striped="even">

        <template #no-data>
          장비를 찾을 수 없습니다.
        </template>

        <template v-slot:[`item.index`]="{ index }">
          <div>
            {{ index + 1 + (page - 1) * itemsPerPage }}
          </div>
        </template>

        <template v-slot:[`item.SIDO_CD`]="{ item }">
          <span>
            <strong>{{ item.SIDO_CD }}</strong>
          </span>
        </template>

        <template v-slot:[`item.GB_OBSV`]="{ item }">
          <th style="width:10px" />
          <v-card class="my-2" elevation="0">
            <div v-if="item.GB_OBSV === '01'">
              <v-img :src="require('@/assets/rain.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '02'">
              <v-img :src="require('@/assets/water.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '03'">
              <v-img :src="require('@/assets/dplace.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '06'">
              <v-img :src="require('@/assets/snow.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '08'">
              <v-img :src="require('@/assets/tilt.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '15'">
              <v-img :src="require('@/assets/dplace.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '17'">
              <v-img :src="require('@/assets/broad.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '18'">
              <v-img :src="require('@/assets/display.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '20'">
              <v-img :src="require('@/assets/gate.png')" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '21'">
              <v-img :src="require('@/assets/flood.png')" height="25" />
            </div>
          </v-card>
        </template>

        <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
          <!-- activator 슬롯 -->
          <span>
            <strong>{{ item.NM_DIST_OBSV }}</strong>
          </span>
        </template>

        <template v-slot:[`item.LastDate`]="{ item }">
          <v-tooltip v-model="item.tooltip" location="top">
            <!-- activator 슬롯 -->
            <template v-slot:activator="{ props }">
              <div v-bind="props" style="font-size: x-small; cursor: pointer;" @click="showTooltip(item)">
                {{ item.LastDate }}
              </div>
            </template>

            <!-- tooltip 내용 -->
            <span>{{ item.LastDate }}</span>
          </v-tooltip>
        </template>

        <template v-slot:[`item.ErrorChk`]="{ item }">
          <div class="text-center">
            <v-chip class="text-uppercase" :color="item.ErrorChk > '0' ? 'green' : 'red'"
              :text="item.ErrorChk == '0' ? '점검필요' : '정상'" size="x-small" label></v-chip>
          </div>
        </template>

        <template v-slot:expanded-row="{ columns, item }">

          <td :colspan="columns.length">
            <v-card density="compact" outlined>
              <v-container class="text-center">
                <v-row :class="item.ErrorChk > '0' ? 'bg-green' : 'bg-red'" class="rounded text-h5">
                  <v-col cols="12">
                    <strong>{{ item.NM_DIST_OBSV }}</strong>
                  </v-col>
                </v-row>
                <v-row class="bg-surface-light text-subtitle-1">
                  <v-col cols="4"><strong>주소</strong></v-col>
                  <v-col cols="4"><strong>위/경도</strong></v-col>
                  <v-col cols="4"><strong>지도</strong></v-col>
                </v-row>
                <v-row class="text-subtitle-2">
                  <v-col cols="4">{{ item.DTL_ADRES }}</v-col>
                  <v-col cols="4">{{ item.LAT && item.LAT.toFixed(4) }} / {{ item.LON && item.LON.toFixed(4) }}</v-col>
                  <v-col cols="4">
                    <v-btn @click="openGuideDialog(item)" width=50px height="40px">
                      <v-img :src="require('@/assets/nmap.png')" alt="네이버 지도" width="40px" cover></v-img>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="bg-surface-light text-subtitle-1">
                  <v-col cols="4"><strong>통신시간</strong></v-col>
                  <v-col cols="4"><strong>CID</strong></v-col>
                  <v-col cols="4"><strong>IP / PORT</strong></v-col>
                </v-row>
                <v-row class="text-subtitle-2">
                  <v-col cols="4">{{ item.LastDate }}</v-col>
                  <v-col cols="4">{{ item.PHONE ?? '-' }}</v-col>
                  <v-col cols="4">{{ item.IP }} / {{ item.PORT }}</v-col>
                </v-row>
                <v-row class="bg-surface-light">
                  <v-sparkline height="3px"></v-sparkline>
                </v-row>
                <v-row v-if="item.GB_OBSV === '17' || item.GB_OBSV === '18' || item.GB_OBSV === '20'">
                  <v-col cols="12">
                    <v-btn size="large" variant="outlined" :color="item.ErrorChk > '0' ? 'green' : 'red'"
                      @click="openTestDialog(item)">
                      <span>장비 테스트</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </td>
        </template>
      </v-data-table>

      <!-- 지도 -->
      <div class="d-flex flex-column align-center">
        <div id="map" style="width:90vw;height:300px;max-height:60vh;"></div>
      </div>

    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="1000" location="center" color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- 지도 다이얼로그 -->
    <v-dialog v-model="dialog" width="70vw" max-width="500px">
      <v-card prepend-icon="mdi-map-marker" title="길안내를 시작할까요?">
        <v-card-text class="text-center" v-if="selectedItem">
          <div>
            <v-img class="mx-auto" :width="100" :src="require('@/assets/nmap.png')"></v-img>
            <strong>{{ selectedItem.NM_DIST_OBSV }}({{ selectedItem.DTL_ADRES }})</strong>로 <br />길안내를 시작하시겠습니까?
          </div>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">아니오</v-btn>
          <v-btn color="primary" @click="showSnackbar(selectedItem)">네</v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- 장비 테스트 다이얼로그 -->
    <v-dialog v-model="dialog_test" width="70vw" max-width="500px">
      <div v-if="selectedItem.GB_OBSV === '17'">

        <div class="d-none">
          {{ broadTestMessage = selectedItem.NM_DIST_OBSV + ' 방송 시험중 입니다.' }}
        </div>

        <v-card title="방송제어 하시겠습니까?">
          <v-card-text class="text-center pa-0" v-if="selectedItem">
            <v-row class="ma-0 pa-0">

              <v-col class="ma-1 pa-0" cols="3" align="right">
                <v-img :src="require('@/assets/broad.png')" />
              </v-col>
              <v-col class="ma-1 pa-0" cols="8" align="center">
                <v-textarea v-model="broadTestMessage" bg-color="grey-lighten-2" color="cyan"></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog_test = false">취소</v-btn>
            <v-btn color="primary" :loading="loading" @click="sendBrd(selectedItem)">제어</v-btn>
          </template>
        </v-card>
      </div>
      <div v-else-if="selectedItem.GB_OBSV === '20'" class="ga-3">
        <v-card title="제어 하시겠습니까?">
          <v-row justify="center" align="center">
            <v-col cols="12" align="center">
              <v-btn elevation="10" class="gate-btn ma-3" min-height="70px"
                :style="{ background: 'linear-gradient(to bottom, #81C784, #66BB6A, #43A047, #388E3C)', color: '#fff' }"
                @click="sendGate(selectedItem, 'open')">
                <v-img :src="require('@/assets/gate_open.png')" width="50px" heigh="40px" />
                <strong>열기</strong>
              </v-btn>

              <v-btn elevation="10" class="gate-btn ma-3" min-height="70px"
                :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }"
                @click="sendGate(selectedItem, 'close')">
                <v-img :src="require('@/assets/gate_close.png')" width="50px" height="40px" />
                <strong>닫기</strong>
              </v-btn>
            </v-col>
          </v-row>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog_test = false">취소</v-btn>
          </template>
        </v-card>
      </div>
      <div v-else-if="selectedItem.GB_OBSV === '18'" class="ga-3">
        <v-card title="테스트 문구">
          <v-card-text class="text-center" v-if="selectedItem">
            <v-textarea v-model="broadTestMessage" bg-color="grey-lighten-2" color="cyan"
              placeholder="테스트 개발 준비 중입니다."></v-textarea>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog_test = false">취소</v-btn>
            <v-btn color="primary" loading="loading" disabled="loading" @click="sendBrd(selectedItem)">제어</v-btn>
          </template>
        </v-card>
      </div>
    </v-dialog>
  </v-container>
</template>

<script setup>
////////////////////////////////////////
// Import
////////////////////////////////////////
import { onMounted, onUnmounted, inject, ref, reactive } from 'vue'
import { useRoute } from 'vue-router';
import axios from 'axios'
import dayjs from 'dayjs'
import * as libmap from '@/component/KakaoMap.js';

////////////////////////////////////////
// 테마
////////////////////////////////////////
const { theme, OnClick_theme } = inject('theme');
const { theme_color } = inject('theme_color');

////////////////////////////////////////
// 프로세스 타이머
////////////////////////////////////////
let refresh_timer = null; // setInterval 핸들러
const refresh_time = ref(20);
const process_time = ref(refresh_time.value);
////////////////////////////////////////
const model = ref(null);

const areaList = ref([]);
const areaList_selected = ref('%');
const search = ref('');
const devices = ref([]);
const selectedItem = ref(null);
const page = ref(1);
const itemsPerPage = ref('50');
const os = ref(navigator.userAgent);

const dialog = ref(false);
const dialog_test = ref(false);

const broadTestMessage = ref("");
const loading = ref(false);

//////////////////////////////////
// 지도
//////////////////////////////////
let map = null;

// 마커
let markers = [];
var infowindow = null;
var mapCustomOverlay = null
var bounds = null;

// 초기값
var init_key = 'f4592e97c349ab41d02ff73bd314a201';
var init_lat = 37.4341;
var init_lon = 127.174;
var init_level = 11;
var init_max_level = 14;

////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {

  console.log("WeatherSIView::onMounted()" + useRoute().params.BDONG_CD);
  console.log(os.value);

  if (refresh_timer) {
    clearInterval(refresh_timer);
  }

  refresh_timer = setInterval(OnTimer_Refresh, 1000);

  /// 지도 초기화
  if (window.kakao === undefined) {
    console.log(`WeatherSIView.vue::scrip() / kakao = ${window.kakao}`);
    const script = document.createElement("script");
    /* global kakao */
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${init_key}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(loadMap);
    document.head.appendChild(script);
  }
  else {
    console.log("WeatherSIView::loadMap()");
    loadMap();
  }

  await Process();
})

onUnmounted(() => {
  console.log("WeatherSIView::onUnmount()");

  if (refresh_timer) {
    clearInterval(refresh_timer);
    refresh_timer = null;
  }
})

////////////////////////////////////////
const menuList = [
  { name: '전국', filter: ['전국'] },
  { name: '전라도', filter: ['전라', '광주'] },
  { name: '경상도', filter: ['경상', '부산', '울산', '대구'] },
  { name: '충청도', filter: ['충청', '대전', '세종'] },
  { name: '강원도', filter: ['강원'] },
  { name: '경기도', filter: ['경기', '서울'] },
  { name: '인천/제주도', filter: ['인천', '제주'] },
];

const headers = [
  { key: 'data-table-expand', width: '35px', sortable: false },
  { key: 'index', width: '25px', sortable: false },
  { key: 'SIDO_CD', title: '지역', width: '50px' },
  { key: 'GB_OBSV', title: '종류', width: '50px' },
  { key: 'NM_DIST_OBSV', title: '장비명' },
  { key: 'ErrorChk', title: '상태', width: '50px' },
  { key: 'DATA', title: '데이터' },
]
////////////////////////////////////////

const filterAndSortArea = (filterTerms) => {
  return areaList.value
    .filter(area => {
      // 필터가 배열인 경우 OR 조건으로 처리
      if (Array.isArray(filterTerms)) {
        return filterTerms.some(term => area.title.includes(term));
      }
      // 단일 필터인 경우
      return area.title.includes(filterTerms);
    })
    .toSorted((a, b) => a.title.localeCompare(b.title));
};

const snackbar = reactive({
  show: false,
  message: ''
})

const snackbar_test = reactive({
  show: false,
  message: '',
  color: 'success',
})


function openGuideDialog(item) {
  console.log(item);
  selectedItem.value = item
  dialog.value = true
}

function openTestDialog(item) {
  console.log(item);
  selectedItem.value = item
  dialog_test.value = true
}

function showSnackbar(item) {
  snackbar.message = `${item.NM_DIST_OBSV}`
  snackbar.show = true;
  dialog.value = false;

  let url = "";

  if (os.value.indexOf("Android") > 0) {
    url = `intent://place?lat=${item.LAT}&lng=${item.LON}&zoom=12&name=${encodeURIComponent(item.NM_DIST_OBSV)}&appname=com.woobo.online#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
    window.location.href = url;
  }
  else if (os.value.indexOf("iPhone") > 0) {
    url = `https://map.naver.com/p/search/${item.DTL_ADRES}?c=11.00,0,0,0,dh`;
    window.open(url, '_blank')
  }
  else {
    url = `https://map.naver.com/p/search/${item.DTL_ADRES}?c=11.00,0,0,0,dh`;
    url = `https://map.naver.com/directions?lat=${item.LAT}&lng=${item.LNG}`;
    window.open(url, '_blank')
  }
}

function showSnackbar_test(message, color = 'success') {
  snackbar_test.message = message;
  snackbar_test.show = true;
  snackbar_test.color = color;
  dialog_test.value = false;
}

function onExpended(items) {
  console.log("onExpended()", items);
}

function showTooltip(item) {
  item.tooltip = true
  setTimeout(() => {
    item.tooltip = false
  }, 2000) // 2초 후 자동 닫힘
}

const OnTimer_Refresh = async () => {
  process_time.value--;
  if (process_time.value == 0) {
    await Process();
  }
}

const Process = async () => {
  console.log("Process()");

  try {
    const response_areaList = await axios.get('/api/weathersi/areaList');

    areaList.value = response_areaList.data.data.map(item => ({
      title: item.RM, value: item.ADMCODE
    }));

    await OnChange_AreaList();
  }
  catch (ex) { console.log(ex) }

  process_time.value = refresh_time.value;
};

const OnChange_AreaList = async (newArea) => {
  var isBound = false;
  if (newArea != null) {
    areaList_selected.value = newArea;
    bounds = null;
  }

  search.value = '';
  console.log("111" + bounds);
  if (bounds == null) {
    isBound = true;
  }

  try {
    const response = await axios.get(`/api/weathersi/devices?BDONG_CD=${areaList_selected.value}`)

    devices.value = response.data.data.map(item => ({
      ...item,
      SIDO_CD: areaList.value.find(area => area.value.slice(0, 4) === item.SIDO_CD)?.title.split(' ').slice(-1)[0]
    }));

    await getMarker();

  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }

  console.log(isBound);
  if (isBound == true) {
    map.setBounds(bounds, 10, 10, 10, 10);
    isBound = false;
  }
}


// 테스트 전송
// 방송장비 테스트 제어 함수
const sendBrd = async (item) => {
  // console.log('제어 요청' + item)

  if (loading.value) {
    showSnackbar_test('테스트중 입니다.', 'error');
    return; // 이미 로딩 중이면 무시
  }

  if (!item) {
    showSnackbar_test('문구를 작성해주세요.', 'error');
    return;
  }
  try {
    loading.value = true; // 로딩 시작

    // DB에 전송
    const response = await axios.post('/api/weathersi/sendBrd', {
      BDONG_CD: item.BDONG_CD,
      CD_DIST_OBSV: item.CD_DIST_OBSV,
      RCMD: 'B010',
      Parm1: '00000000',
      Parm2: '1',
      Parm3: broadTestMessage.value,
      BStatus: 'start',
      RegDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      Auth: 'online'
    });

    const ok = response.status >= 200 && response.status < 300;
    const serverOk = response.data?.succes !== false && response.data?.result !== 'fail';
    if (ok && serverOk) {
      showSnackbar_test("메세지가 성공적으로 전송되었습니다.", 'success');
      broadTestMessage.value = "";
      dialog_test.value = false;
    } else {
      const msg = response.data?.message || response.statusText || "전송 중 오류가 발생 했습니다.";

      showSnackbar_test(`전송실패: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "전송 중 오류가 발생했습니다.";
    showSnackbar_test(msg, 'error');
  } finally {
    loading.value = false; // 로딩 종료
  }
}

function loadMap() {

  var lat = init_lat;
  var lon = init_lon;
  var zoom_level = init_level;
  var zoom_level_max = init_max_level;
  var mapCenter = new kakao.maps.LatLng(lat, lon);

  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
    level: zoom_level, // 지도의 확대 레벨
    maxLevel: zoom_level_max, // 최대의 최대 레벨
    mapTypeId: kakao.maps.MapTypeId.HYBRID, // 지도종류
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

  // 지도를 클릭한 위치에 표출할 마커입니다
  var marker = new kakao.maps.Marker({
    // 지도 중심좌표에 마커를 생성합니다
    position: mapCenter,
    image: new kakao.maps.MarkerImage("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_drag.png", new kakao.maps.Size(50, 50)),
  });
  // 지도 중심좌표에 마커를 생성합니다
  marker.setPosition(map.getCenter());
  // 지도에 마커를 표시합니다
  marker.setMap(map);

  infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

  // 커스텀 오버레이를 생성합니다
  mapCustomOverlay = new kakao.maps.CustomOverlay({
    xAnchor: -0.2, // 커스텀 오버레이의 x축 위치입니다. 1에 가까울수록 왼쪽에 위치합니다. 기본값은 0.5 입니다
    yAnchor: 0.5, // 커스텀 오버레이의 y축 위치입니다. 1에 가까울수록 위쪽에 위치합니다. 기본값은 0.5 입니다
  });
}

async function getMarker() {
  console.log("getMarker()");
  const positions = devices.value
    .filter(row => row.LAT && row.LON)   // 값 없는 데이터 제외
    ;

  markers.forEach(marker => marker.setMap(null));

  bounds = new kakao.maps.LatLngBounds();

  positions.forEach(pos => {
    var image;
    switch (pos.GB_OBSV) {
      case "01": image = new kakao.maps.MarkerImage(require(`@/assets/rain_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "02": image = new kakao.maps.MarkerImage(require(`@/assets/water_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "03": image = new kakao.maps.MarkerImage(require(`@/assets/dplace_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "06": image = new kakao.maps.MarkerImage(require(`@/assets/snow_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "08": image = new kakao.maps.MarkerImage(require(`@/assets/tilt_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "17": image = new kakao.maps.MarkerImage(require(`@/assets/broad_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "18": image = new kakao.maps.MarkerImage(require(`@/assets/display_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "20": image = new kakao.maps.MarkerImage(require(`@/assets/gate_marker.png`), new kakao.maps.Size(20, 30));
        break;
      case "21": image = new kakao.maps.MarkerImage(require(`@/assets/flood_marker.png`), new kakao.maps.Size(20, 30));
        break;
      default: image = null;
        return;
    }
    // 지도를 클릭한 위치에 표출할 마커입니다
    let marker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(Number(pos.LAT), Number(pos.LON)),
      title: pos.NM_DIST_OBSV,
      image: image
    });


    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      //infowindow.setContent(libmap.newInfoWindow(pos));// `<div><span style="font-size:12px;">${pos.NM_DIST_OBSV}</span><div>`
      //infowindow.open(map, marker);
      console.log(marker);
      mapCustomOverlay.setPosition(marker.getPosition());
      mapCustomOverlay.setContent(libmap.newInfoWindow(pos));
      mapCustomOverlay.setMap(map);
    });

    // 바운드를 추가합니다.
    bounds.extend(marker.getPosition());

    // 지도에 마커를 표시합니다
    markers.push(marker);
  });
}

// 커스텀 오버레이를 닫기 위해 호출되는 함수입니다 
function closeOverlay() {
  mapCustomOverlay.setMap(null);
}

// 차단기 테스트 제어 함수
const sendGate = async (item, gate) => {
  if (loading.value) return; // 이미 로딩 중이면 무시
  if (!item) {
    showSnackbar_test('문구를 작성해주세요.', 'error');
    return;
  }
  try {
    loading.value = true; // 로딩시작

    // DB에 전송
    const response = await axios.post('/api/weathersi/sendGate', {
      BDONG_CD: item.BDONG_CD,
      CD_DIST_OBSV: item.CD_DIST_OBSV,
      Gate: gate,
      GStatus: 'start',
      Auth: 'online'
    });

    const ok = response.status >= 200 && response.status < 300;
    const serverOk = response.data?.succes !== false && response.data?.result !== 'fail';
    if (ok && serverOk) {
      showSnackbar_test("장비 제어가 정상적으로 등록 되었습니다.", 'success');
      broadTestMessage.value = "";
      dialog_test.value = false;
    } else {
      const msg = response.data?.message || response.statusText || "전송 중 오류가 발생 했습니다.";

      showSnackbar_test(`전송실패: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "전송 중 오류가 발생했습니다.";
    showSnackbar_test(msg, 'error');
  } finally {
    loading.value = false; // 로딩 종료
  }
  dialog_test.value = false;
}
</script>

<style lang="scss" scoped>
// scss를 이용하여 커스터마이징
// scss 문법으로 :deep을 주어 해당 태그에 직접 접근하여 css 덮어쓰기
.table-fit {
  font-size: 0.8rem;

  :deep(table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(.v-table__wrapper) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  :deep(.v-data-table__th),
  :deep(.v-data-table__td) {
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 !important;
  }

  :deep(.v-data-table-footer__items-per-page > .v-select) {
    color: red;
  }
}

:deep(.v-card-text) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 열 개수에 따라 자동 균등 분배 */


/* 반응형 크기 조절 */
@media (max-width: 768px) {
  .table-fit {
    font-size: 1rem;
  }

  .table-fit th,
  .table-fit td {
    padding: 4px 6px;
  }
}

@media (max-width: 480px) {
  .table-fit {
    font-size: 0.8rem;
  }

  .table-fit th,
  .table-fit td {
    padding: 0px 0px;
  }
}

.v-field__field input {
  cursor: pointer;
}


.wrap {
  position: absolute;
  left: 0;
  bottom: 40px;
  width: 100px;
  height: 132px;
  margin-left: -144px;
  text-align: left;
  overflow: hidden;
  font-size: 12px;
  font-family: 'Malgun Gothic', dotum, '돋움', sans-serif;
  line-height: 1.5;
}

.wrap * {
  padding: 0;
  margin: 0;
}

.wrap .info {
  width: 286px;
  height: 120px;
  border-radius: 5px;
  border-bottom: 2px solid #ccc;
  border-right: 1px solid #ccc;
  overflow: hidden;
  background: #fff;
}

.wrap .info:nth-child(1) {
  border: 0;
  box-shadow: 0px 1px 2px #888;
}

.info .title {
  padding: 5px 0 0 10px;
  height: 30px;
  background: #eee;
  border-bottom: 1px solid #ddd;
  font-size: 18px;
  font-weight: bold;
}

.info .close {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #888;
  width: 17px;
  height: 17px;
  background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png');
}

.info .close:hover {
  cursor: pointer;
}

.info .body {
  position: relative;
  overflow: hidden;
}

.info .desc {
  position: relative;
  margin: 13px 0 0 90px;
  height: 75px;
}

.desc .ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc .jibun {
  font-size: 11px;
  color: #888;
  margin-top: -2px;
}

.info .img {
  position: absolute;
  top: 6px;
  left: 5px;
  width: 73px;
  height: 71px;
  border: 1px solid #ddd;
  color: #888;
  overflow: hidden;
}

.info:after {
  content: '';
  position: absolute;
  margin-left: -12px;
  left: 50%;
  bottom: 0;
  width: 22px;
  height: 12px;
  background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png')
}

.info .link {
  color: #5085BB;
}
</style>
