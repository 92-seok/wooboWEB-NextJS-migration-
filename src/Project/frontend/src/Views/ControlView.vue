<template>
  <v-container>
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

      <v-card height="30">

      </v-card>

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
              <v-img :src="require('@/assets/broad.png')" height="30" />
            </div>
            <div v-if="item.GB_OBSV === '18'">
              <v-img :src="require('@/assets/display.png')" height="30" />
            </div>
            <div v-if="item.GB_OBSV === '20'">
              <v-img :src="require('@/assets/gate.png')" height="30" />
            </div>
          </v-card>
        </template>

        <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
          <!-- activator 슬롯 -->
          <v-btn>
            <strong>{{ item.NM_DIST_OBSV }}</strong>
          </v-btn>


        </template>

        <template v-slot:[`item.LastStatus`]="{ item }">
          <div class="text-center">
            <v-chip class="text-uppercase" :color="item.LastStatus == 'OK' ? 'green' : 'red'"
              :text="item.LastStatus == 'OK' ? '정상' : '점검필요'" size="x-small" label></v-chip>
          </div>
        </template>

        <template v-slot:[`item.sensorTest`]="{ item }">
          <div class="text-center">
            <v-btn variant="outlined" :color="item.LastStatus == 'OK' ? 'green' : 'red'"
              :text="item.sensorTest == 'OK' ? '' : ''" size="x-small" label @click="openGuideDialog(item)">
              테스트하기
            </v-btn>
          </div>
        </template>


      </v-data-table>
    </v-card>
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="2000" location="bottom">
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
            <v-btn color="primary" @click="sendBrd(selectedItem)">제어</v-btn>
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
                <v-img :src="require('@/assets/gate_open.png')" width="50px" heigh="40px" />
                <strong>열기</strong>
              </v-btn>

              <v-btn elevation="10" class="gate-btn ma-3"
                :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }"
                @click="sendGate(selectedItem, 'close')">
                <v-img :src="require('@/assets/gate_close.png')" width="50px" height="40px" />
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
import axios from 'axios'

let refresh_timer; // setInterval 핸들러
const process_time = ref(20);

const areaList = ref([])
const search = ref('')
const control = ref([])
const areaList_selected = ref('%')
const selectedItem = ref(null)

const broadTestMessage = ref('');

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
  console.log("onMounted()");
  console.log(os.value);

  refresh_timer = setInterval(OnTimer_Refresh, 1000);

  await Process();
})

onUnmounted(() => {
  console.log("onUnmount()");

  if (refresh_timer) {
    clearInterval(refresh_timer);
  }
})

const sendBrd = async (item) => {
  console.log('aaaa' + item)
  const response = await axios.post('/api/sendBrd', {
    BDONG_CD: item.BDONG_CD,
    CD_DIST_OBSV: item.CD_DIST_OBSV,
    Message: broadTestMessage.value,
    Auth: 'online'
  });
  dialog.value = false;
  // areaList.value = response_areaList.data.data.map(item => ({
  //   title: item.RM, value: item.ADMCODE
  // }))

  // await OnChange_AreaList();
  // console.log(`${item.NM_DIST_OBSV}`)
  // console.log(broadTestMessage.value)
}

const sendGate = async (item, gate) => {
  console.log('aaaa' + item)
  const response = await axios.post('/api/sendGate', {
    BDONG_CD: item.BDONG_CD,
    CD_DIST_OBSV: item.CD_DIST_OBSV,
    Gate: gate,
    Auth: 'online'
  });
  dialog.value = false;
}


const snackbar = reactive({
  show: false,
  message: ''
})

function openGuideDialog(item) {
  console.log(item);
  selectedItem.value = item
  dialog.value = true

}

function showSnackbar(item) {

  snackbar.message = `${item.NM_DIST_OBSV}`
  snackbar.show = true;
  dialog.value = false;

  const NAVER_MAP_ANDROID_STORE = 'market://details?id=com.nhn.android.nmap'; // 네이버 지도 안드로이드 구글 플레이 링크
  const NAVER_MAP_IOS_STORE = 'https://itunes.apple.com/app/id311867728?mt=8'; // 네이버 지도 iOS 앱 스토어 링크

  let url = "";

  if (os.value.indexOf("Android") > 0) {
    url = `intent://place?lat=${item.LAT}&lng=${item.LON}&zoom=12&name=${encodeURIComponent(item.NM_DIST_OBSV)}&appname=com.woobo.online#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
  }
  else if (os.value.indexOf("iPhone") > 0) {
    url = `itms-apps://itunes.apple.com/app/id311867728/`;
    url = `nmap://place?lat=${item.LAT}&lng=${item.LON}&zoom=12&name=${encodeURIComponent(item.NM_DIST_OBSV)}&appname=com.woobo.online;scheme=nmap;`;
  }
  else {
    url = `https://map.naver.com/directions?lat=${item.LAT}&lng=${item.LNG}`;
    url = `https://map.naver.com/p/search/${item.DTL_ADRES}?c=11.00,0,0,0,dh`;
  }

  window.location.href = url;
}

const dialog = ref(false);

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
  console.log("Process()");

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
  { key: 'LastStatus', title: '통신상태', },
  { key: 'sensorTest', title: '장비테스트', },
]
</script>

<style lang="scss" scoped>
// scss를 이용하여 커스터마이징
// scss 문법으로 :deep을 주어 해당 태그에 직접 접근하여 css 덮어쓰기

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
