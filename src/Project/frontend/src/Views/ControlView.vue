<template>
  <v-container id="main_body">
    <v-sheet class="mx-auto">
      <v-slide-group center-active>
        <v-menu v-for="(menu, index) in menuList" :key="index" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn class="pa-0" color="primary" v-bind="props">{{ menu.name }}</v-btn>
          </template>

          <v-list>
            <v-list-item v-for="(item, i) in filterAndSortArea(menu.filter)" :key="i" :value="i">
              <v-list-item-title @click="OnChange_AreaList(item.value);">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-slide-group>

      <v-autocomplete :items="areaList" label="지역 검색" variant="solo-filled" v-model="areaList_selected"
        @update:model-value="OnChange_AreaList">
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
        <template #no-data> </template>
      </v-autocomplete>
    </v-sheet>

    <v-card flat>
      <!-- 검색창 -->
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-list-box-outline"></v-icon> &nbsp;
        장비 목록
        <v-spacer></v-spacer>

        <v-text-field v-model="search" density="compact" label="장비 검색" prepend-inner-icon="mdi-magnify"
          variant="outlined" flat hide-details />
      </v-card-title>

      <!-- 프로그레스 타이머 -->
      <v-progress-linear color="primary" v-model="process_time" :height="5" max="20" />

      <v-divider />

      <!-- 장비 현황 카드 -->
      <v-row class="d-flex mt-2 mb-2" style="justify-content: center;">
        <v-col cols="4" class="text-center">
          <v-card
            :style="{ background: 'linear-gradient(to bottom, #7986CB, #5C6BC0, #3949AB, #303F9F)', color: '#fff' }">
            <v-card-title>
              <strong>전체</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{ control.length }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="text-center">
          <v-card
            :style="{ background: 'linear-gradient(to bottom, #81C784, #66BB6A, #43A047, #388E3C)', color: '#fff' }">
            <v-card-title>
              <strong>정상</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{control.filter(item => item.ErrorChk !== '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="text-center">
          <v-card
            :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }">
            <v-card-title>
              <strong>점검필요</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{control.filter(item => item.ErrorChk !== '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>



      <v-divider />

      <!-- 데이터 테이블 -->
      <v-data-table :search="search" :filter-keys="['NM_DIST_OBSV']" :items="control" :headers="headers"
        :header-props="{ align: 'center', style: 'font-weight: bold;' }" :cell-props="{ align: 'center' }"
        :mobile-breakpoint="0" density="compact" class="table-fit pa-0" items-per-page="50"
        items-per-page-text="페이지당 표시 수" v-model:page="page" v-model:items-per-page="itemsPerPage">

        <template #no-data>
          장비를 찾을 수 없습니다.
        </template>

        <template v-slot:[`item.index`]="{ index }">
          {{ index + 1 + (page - 1) * itemsPerPage }}
        </template>

        <template v-slot:[`item.GB_OBSV`]="{ item }">
          <th style="width:10px" />
          <v-card class="my-2" elevation="0">
            <div v-if="item.GB_OBSV === '17'">
              <v-img :src="broadImg" height="30" />
            </div>
            <div v-if="item.GB_OBSV === '18'">
              <v-img :src="displayImg" height="30" />
            </div>
            <div v-if="item.GB_OBSV === '20'">
              <v-img :src="gateImg" height="30" />
            </div>
          </v-card>
        </template>

        <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
          <!-- activator 슬롯 -->
          <span>
            <strong>{{ item.NM_DIST_OBSV }}</strong>
          </span>
        </template>

        <template v-slot:[`item.ErrorChk`]="{ item }">
          <div class="text-center">
            <v-chip class="text-uppercase" :color="item.ErrorChk > '0' ? 'green' : 'red'"
              :text="item.ErrorChk > '0' ? '정상' : '점검필요'" size="small" label></v-chip>
          </div>
        </template>

        <!-- 장비 테스트에 권한 추가 -->
        <template v-slot:[`item.sensorTest`]="{ item }">
          <div class="text-center">
            <!-- 로그인 + 관리자 권한 있음 -->
            <v-btn variant="outlined" :color="item.ErrorChk > '0' ? 'green' : 'red'" size="small" label
              @click="openGuideDialog(item)">
              테스트하기
            </v-btn>
          </div>
        </template>
      </v-data-table>
      <!-- <div id="map"></div> -->
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="1000" location="center" color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <!-- 다이얼로그는 v-data-table 바깥에 위치 -->
    <v-dialog v-model="dialog" width="70vw" max-width="500px">
      <div v-if="selectedItem.GB_OBSV === '17'">
        <v-card title="테스트 문구">
          <v-card-text class="text-center" v-if="selectedItem">
            <v-textarea v-model="broadTestMessage" bg-color="grey-lighten-2" color="cyan"
              placeholder="테스트 문구를 입력하세요."></v-textarea>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">취소</v-btn>
            <v-btn color="primary" :loading="loading" @click="sendBrd(selectedItem)">제어</v-btn>
          </template>
        </v-card>
      </div>
      <div v-if="selectedItem.GB_OBSV === '20'" class="ga-3">
        <v-card title="제어 하시겠습니까?">
          <v-row justify="center" align="center">
            <v-col cols="12" align="center">
              <v-btn elevation="10" class="gate-btn ma-3"
                :style="{ background: 'linear-gradient(to bottom, #81C784, #66BB6A, #43A047, #388E3C)', color: '#fff' }"
                @click="sendGate(selectedItem, 'open')">
                <v-img :src="gateOpenImg" width="50px" heigh="40px" />
                <strong>열기</strong>
              </v-btn>

              <v-btn elevation="10" class="gate-btn ma-3"
                :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }"
                @click="sendGate(selectedItem, 'close')">
                <v-img :src="gateCloseImg" width="50px" height="40px" />
                <strong>닫기</strong>
              </v-btn>
            </v-col>
          </v-row>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">취소</v-btn>
          </template>
        </v-card>
      </div>
      <div v-if="selectedItem.GB_OBSV === '18'" class="ga-3">
        <v-card title="테스트 문구">
          <v-card-text class="text-center" v-if="selectedItem">
            <v-textarea v-model="broadTestMessage" bg-color="grey-lighten-2" color="cyan"
              placeholder="테스트 개발 준비 중입니다."></v-textarea>
          </v-card-text>
          <template v-slot:actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">취소</v-btn>
            <v-btn color="primary" loading="loading" disabled="loading" @click="sendBrd(selectedItem)">제어</v-btn>
          </template>
        </v-card>
      </div>
    </v-dialog>

    <!-- <v-dialog v-model="dialog" transition="dialog-bottom-transition" width="auto">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" text="Transition from Bottom" block></v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card width="70vw">


          <div v-if="selectedItem.GB_OBSV === '17'">
            <v-card title="테스트 문구">
              <v-card-text class="text-center" v-if="selectedItem">
                <v-textarea v-model="broadTestMessage" bg-color="grey-lighten-2" color="cyan"
                  placeholder="테스트 문구를 입력하세요."></v-textarea>
              </v-card-text>
              <template v-slot:actions>
                <v-spacer></v-spacer>
              </template>
            </v-card>
          </div>

          <v-card-actions class="justify-end">
            <v-btn @click="dialog = false">취소</v-btn>
            <v-btn color="primary" @click="sendBrd(selectedItem)">제어</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog> -->


  </v-container>




</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import dayjs from 'dayjs'
import broadImg from '@/assets/broad.png'
import displayImg from '@/assets/display.png'
import gateImg from '@/assets/gate.png'
import gateOpenImg from '@/assets/gate_open.png'
import gateCloseImg from '@/assets/gate_close.png'


let refresh_timer; // setInterval 핸들러
const process_time = ref(20);

const areaList = ref([])
const search = ref('')
const control = ref([])
const areaList_selected = ref('%')
const selectedItem = ref(null)
const dialog = ref(false);
const broadTestMessage = ref("");
const loading = ref(false);


const menuList = [
  { name: '전국', filter: ['전국'] },
  { name: '전라도', filter: ['전라', '광주'] },
  { name: '경상도', filter: ['경상', '부산', '울산', '대구'] },
  { name: '충청도', filter: ['충청', '대전', '세종'] },
  { name: '강원도', filter: ['강원'] },
  { name: '경기도', filter: ['경기', '서울'] },
  { name: '인천/제주도', filter: ['인천', '제주'] },
];

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

const page = ref(1)
const itemsPerPage = ref(50)
const os = ref(navigator.userAgent);

onMounted(async () => {
  console.log("✅ onMounted()");

  refresh_timer = setInterval(OnTimer_Refresh, 1000);

  await Process();
})

onUnmounted(() => {
  // console.log("onUnmount()");

  if (refresh_timer) {
    clearInterval(refresh_timer);
  }
})

// 장비 테스트 권한 체크 함수
// const handleDeviceTest = (item) => {
//   console.log('장비 테스트 클릭하기');
//   console.log('현재 권한: ', userRole.value);
//   console.log('관리자 여부: ', isAdmin.value);

//   // 계정 권한 체크하는 로직
//   if (!canAccessDeviceTest.value) {
//     permissionDialog.value = true;
//     return;
//   }

//   // 관리자인 경우 장비 테스트 다이얼로그 열기
//   openGuideDialog(item);
// }

// 

// 테스트 전송
// 방송장비 테스트 제어 함수
const sendBrd = async (item) => {
  // console.log('제어 요청' + item)

  if (loading.value) return; // 이미 로딩 중이면 무시
  if (!item) {
    showSnackbar('문구를 작성해주세요.', 'error');
    return;
  }
  try {
    loading.value = true; // 로딩 시작

    // DB에 전송
    const response = await axios.post('/api/sendBrd', {
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
      showSnackbar("메세지가 성공적으로 전송되었습니다.", 'success');
      broadTestMessage.value = "";
      dialog.value = false;
    } else {
      const msg = response.data?.message || response.statusText || "전송 중 오류가 발생 했습니다.";

      showSnackbar(`전송실패: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "전송 중 오류가 발생했습니다.";
    showSnackbar(msg, 'error');
  } finally {
    loading.value = false; // 로딩 종료
  }
}

// 차단기 테스트 제어 함수
const sendGate = async (item, gate) => {
  if (loading.value) return; // 이미 로딩 중이면 무시
  if (!item) {
    showSnackbar('문구를 작성해주세요.', 'error');
    return;
  }
  try {
    loading.value = true; // 로딩시작

    // DB에 전송
    const response = await axios.post('/api/sendGate', {
      BDONG_CD: item.BDONG_CD,
      CD_DIST_OBSV: item.CD_DIST_OBSV,
      Gate: gate,
      GStatus: 'start',
      Auth: 'online'
    });

    const ok = response.status >= 200 && response.status < 300;
    const serverOk = response.data?.succes !== false && response.data?.result !== 'fail';
    if (ok && serverOk) {
      showSnackbar("장비 제어가 정상적으로 등록 되었습니다.", 'success');
      broadTestMessage.value = "";
      dialog.value = false;
    } else {
      const msg = response.data?.message || response.statusText || "전송 중 오류가 발생 했습니다.";

      showSnackbar(`전송실패: ${msg}`, 'error');
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "전송 중 오류가 발생했습니다.";
    showSnackbar(msg, 'error');
  } finally {
    loading.value = false; // 로딩 종료
  }
  dialog.value = false;
}

// 스낵바
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})


function showSnackbar(message, color = 'success') {
  snackbar.message = message;
  snackbar.show = true;
  snackbar.color = color;
  dialog.value = false;
}

function openGuideDialog(item) {
  console.log(item);
  selectedItem.value = item
  dialog.value = true
}


// function showTooltip(item) {
//     item.tooltip = true
//     setTimeout(() => {
//         item.tooltip = false
//     }, 2000) // 2초 후 자동 닫힘
// }

const OnTimer_Refresh = async () => {
  process_time.value--;
  if (process_time.value == 0) {
    await Process();
    process_time.value = 20;
  }
}

const Process = async () => {
  // console.log("Process()");

  const response_areaList = await axios.get('/api/areaList');

  areaList.value = response_areaList.data.data.map(item => ({
    title: item.RM, value: item.ADMCODE
  }))

  await OnChange_AreaList();
};

const OnChange_AreaList = async (newArea) => {
  if (newArea != null) {
    areaList_selected.value = newArea;
  }

  try {
    const response = await axios.get(`/api/control?BDONG_CD=${areaList_selected.value}`)
    control.value = response.data.data
    //console.log(devices.value);

  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
}

const headers = [
  { key: 'index', title: '', width: '50px', sortable: true },
  { key: 'GB_OBSV', title: '종류', width: '50px', },
  { key: 'NM_DIST_OBSV', title: '장비명', },
  // { key: 'LastDate', title: '통신시간', },
  { key: 'ErrorChk', title: '통신상태', },
  { key: 'sensorTest', title: '장비테스트', },
]

// 카카오 맵 구현

// const map = ref(null);
// const markers = ref([]);
// const infowindow = ref(null);

// const initMap = () => {
//   var lat = '35.3';
//   var lon = '128.0';
//   var zoom_level = 13;
//   var zoom_level_max = 14;

//   const mapContainer = document.getElementById("map");
//   const mapOption = {
//     center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
//     level: zoom_level, // 지도의 확대 레벨
//     maxLevel: zoom_level_max, // 최대의 최대 레벨
//   };

//   map.value = new kakao.maps.Map(mapContainer, mapOption);

//   /* 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다*/
//   var mapTypeControl = new kakao.maps.MapTypeControl();
//   map.value.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
//   map.value.setMapTypeId(kakao.maps.MapTypeId.HYBRID);

//   /* 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성합니다. */
//   var zoomControl = new kakao.maps.ZoomControl();
//   map.value.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
// };

// const changeSize = (size) => {
//   const container = document.getElementById("map");
//   container.style.width = `${size}px`;
//   container.style.height = `${size}px`;
//   toRaw(map.value).relayout();
// };

// const displayMarker = (markerPositions) => {
//   if (markers.value.length > 0) {
//     markers.value.forEach((marker) => marker.setMap(null));
//   }

//   let positions = markerPositions.map(
//     (pos) => new kakao.maps.LatLng(pos[0], pos[1])
//   );

//   if (positions.length > 0) {
//     markers.value = positions.map(
//       (position) =>
//         new kakao.maps.Marker({
//           map: toRaw(map.value),
//           position,
//         })
//     );

//     const bounds = positions.reduce(
//       (bounds, latlng) => bounds.extend(latlng),
//       new kakao.maps.LatLngBounds()
//     );

//     toRaw(map.value).setBounds(bounds);
//   }
// };

// const displayInfoWindow = () => {
//   if (infowindow.value && toRaw(infowindow.value).getMap()) {
//     toRaw(map.value).setCenter(toRaw(infowindow.value).getPosition());
//     return;
//   }

//   var iwContent = '<div style="padding:5px;">Hello World!</div>',
//     iwPosition = new kakao.maps.LatLng(33.450701, 126.570667),
//     iwRemoveable = true;

//   infowindow.value = new kakao.maps.InfoWindow({
//     map: toRaw(map.value),
//     position: iwPosition,
//     content: iwContent,
//     removable: iwRemoveable,
//   });

//   toRaw(map.value).setCenter(iwPosition);
// };


// onMounted(async () => {
//   console.log("onMounted()");

// if (window.kakao && window.kakao.maps) {
//   // console.log('window.kakao == true')
//   initMap();
//   await loadMapData();
// }
// else {
//   /* global kakao */
//   const script = document.createElement("script");
//   script.src = "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=f4592e97c349ab41d02ff73bd314a201&libraries=services";
//   document.head.appendChild(script);
//   script.onload = async () => {
//     // console.log('script.onload()');
//     kakao.maps.load(initMap);
//     await loadMapData()
//   }

// }

// });

// const loadMapData = async () => {
//   try {
//     const response = await axios.get(`/api/devices`)
//     const devices = response.data.data
//     const positions = devices
//       .filter(row => row.LAT && row.LON)   // 값 없는 데이터 제외
//       .map(row => [Number(row.LAT), Number(row.LON)]);

//     displayMarker(positions);

//   } catch (err) {
//     console.log('데이터를 가져오는 중 오류 발생: ', err)
//   }
// }

window.onresize = () => {
  console.log(changeSize())
  // changeSize();
};

</script>

<style lang="scss" scoped>
// scss를 이용하여 커스터마이징
// scss 문법으로 :deep을 주어 해당 태그에 직접 접근하여 css 덮어쓰기

// 카카오맵
#map {
  width: 100vw;
  height: 800px;
}

.gate-btn {
  min-height: 100px;
}

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

.search-box {
  max-width: 250px;
  /* 폭 줄이기 */
  font-size: 0.8rem;
  /* 글자 크기 줄이기 */
}

:deep(.search-box .v-field) {
  min-height: 32px;
  /* 입력창 높이 줄이기 */
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
    font-size: 0.6rem;
  }

  .table-fit th,
  .table-fit td {
    padding: 2px 4px;
  }
}
</style>
