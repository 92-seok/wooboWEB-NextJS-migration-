<template>
  <v-container>
    <!-- 지역 메뉴 (전국, 전라도, 경상도, 충청도, 강원도, 경기도, 인천/제주도) -->
    <v-sheet class="mx-auto">
      <v-slide-group v-model="model" center-active>
        <v-menu v-for="(menu, index) in menuList" :key="index" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-scale-transition>
              <v-btn class="pa-0" style="min-width: 50px;" color="primary" v-bind="props">{{ menu.name }}</v-btn>
            </v-scale-transition>
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

      <!-- 지역 검색 창-->
      <v-autocomplete :items="areaList" label="지역 검색" variant="solo-filled" v-model="areaList_selected"
        @update:model-value="OnChange_AreaList">
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
        <template #no-data> </template>
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
      <v-progress-linear color="primary" v-model="process_time" :height="5" :max="refresh_time" />

      <v-divider />

      <!-- 장비 현황 카드 -->
      <v-row v-if="areaList_selected != '%'" class="d-flex mt-2 mb-2 ma-1" style="justify-content: center;">
        <v-col cols="4" class="text-center pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #7986CB, #5C6BC0, #3949AB, #303F9F)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>전체</strong>
            </v-card-title>
            <v-card-text class="text-h5">
              {{ devices.length }}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="text-center pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #81C784, #66BB6A, #43A047, #388E3C)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>정상</strong>
            </v-card-title>
            <v-card-text class="text-h5">
              {{devices.filter(item => item.ErrorChk > '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4" class="text-center pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>점검필요</strong>
            </v-card-title>
            <v-card-text class="text-h5">
              {{devices.filter(item => item.ErrorChk == '0').length}}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider />

      <!-- 데이터 테이블 -->
      <v-data-table class="table-fit pa-0" :mobile-breakpoint="0" density="compact" :search="search"
        :filter-keys="['NM_DIST_OBSV']" :headers="headers"
        :header-props="{ align: 'center', style: 'font-weight: bold;' }" :items="devices"
        :cell-props="{ align: 'start' }" item-value="IDX" show-expand v-model:page="page"
        v-model:items-per-page="itemsPerPage" items-per-page-text="페이지당 표시 수" :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]" multi-sort hover>

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
              :text="item.ErrorChk == '0' ? '점검필요' : '정상'" size="small" label></v-chip>
          </div>
        </template>

        <template v-slot:expanded-row="{ columns, item }">

          <td :colspan="columns.length">
            <v-card density="compact" outlined>
              <v-container class="text-center">
                <v-row class="bg-surface-light ">
                  <v-col cols="4"><strong>주소</strong></v-col>
                  <v-col cols="3"><strong>위도</strong></v-col>
                  <v-col cols="3"><strong>경도</strong></v-col>
                  <v-col cols="2"><strong>지도</strong></v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">{{ item.DTL_ADRES }}</v-col>
                  <v-col cols="3">{{ item.LAT && item.LAT.toFixed(4) }}</v-col>
                  <v-col cols="3">{{ item.LON && item.LON.toFixed(4) }}</v-col>
                  <v-col cols="2">
                    <v-btn @click="openGuideDialog(item)" min-width="30px" min-height="20px" width=30px height="20px">
                      <v-img :src="require('@/assets/nmap.png')" alt="네이버 지도" width="20px" cover></v-img>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="bg-surface-light">
                  <v-col cols="4"><strong>통신시간</strong></v-col>
                  <v-col cols="3"><strong>CID</strong></v-col>
                  <v-col cols="3"><strong>IP</strong></v-col>
                  <v-col cols="2"><strong>PORT</strong></v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">{{ item.LastDate }}</v-col>
                  <v-col cols="3">{{ item.PHONE ?? '-' }}</v-col>
                  <v-col cols="3">{{ item.IP }}</v-col>
                  <v-col cols="2">{{ item.PORT }}</v-col>
                </v-row>
                <v-row class="bg-surface-light">
                  <v-sparkline height="3px"></v-sparkline>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-btn variant="outlined" :color="item.ErrorChk > '0' ? 'green' : 'red'"
                      :text="item.sensorTest == 'OK' ? '' : ''" @click="openTestDialog(item)">
                      장비 테스트
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="1000" location="center" color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'

////////////////////////////////////////
// 프로세스 타이머
////////////////////////////////////////
let refresh_timer = null; // setInterval 핸들러
const refresh_time = ref(20);
const process_time = ref(refresh_time.value);
////////////////////////////////////////

////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {

  console.log("MonitorView::onMounted()");
  console.log(os.value);

  if (refresh_timer) {
    clearInterval(refresh_timer);
  }

  refresh_timer = setInterval(OnTimer_Refresh, 1000);

  await Process();
})

onUnmounted(() => {
  console.log("MonitorView::onUnmount()");

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
  { key: 'data-table-expand', width: 30, align: 'center', sortable: false },
  { key: 'index', width: '25px', sortable: false },
  { key: 'SIDO_CD', title: '지역', width: '50px', },
  { key: 'NM_DIST_OBSV', title: '장비명', align: 'start' },
  { key: 'ErrorChk', title: '상태' },
  { key: 'DATA', title: '데이터' },
]
////////////////////////////////////////


const Process = async () => {
  console.log("Process()");

  try {
    const response_areaList = await axios.get('/api/areaList');

    areaList.value = response_areaList.data.data.map(item => ({
      title: item.RM, value: item.ADMCODE
    }));

    await OnChange_AreaList();
  }
  catch (ex) { console.log(ex) }

  process_time.value = refresh_time.value;
};

const OnChange_AreaList = async (newArea) => {
  if (newArea != null) {
    areaList_selected.value = newArea;
  }

  try {
    const response = await axios.get(`/api/devices?BDONG_CD=${areaList_selected.value}`)

    devices.value = response.data.data.map(item => ({
      ...item,
      SIDO_CD: areaList.value.find(area => area.value.slice(0, 4) === item.SIDO_CD)?.title.split(' ').slice(-1)[0]
    }));
    console.log(devices.value);
  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
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


</script>

<style lang="scss" scoped></style>