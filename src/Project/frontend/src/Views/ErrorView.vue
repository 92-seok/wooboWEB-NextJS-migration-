<template>
  <v-container max-width="1200px" fluid class="pa-mobile">
    <!-- 지역 메뉴 (WeatherSIView 동일) -->
    <v-sheet class="mx-auto">
      <v-slide-group v-model="model" center-active>
        <v-menu v-for="(menu, index) in menuList" :key="index" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-scale-transition>
              <v-btn class="pa-0" size="large" style="min-width: 50px;" color="deep-orange-accent-3" v-bind="props">
                {{ menu.name }}
              </v-btn>
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
        <template #no-data></template>
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
      </v-autocomplete>
    </v-sheet>

    <v-card flat>
      <!--  장비 검색 창 (제목만 수정)  -->
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-alert-circle"></v-icon> &nbsp;
        <v-btn @click="handleRefresh">
          <span>점검 필요 장비 <strong class="text-red">{{ devicesWithDays.length }}</strong> 개소</span>
          <v-icon icon="mdi-refresh"></v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-text-field v-model="search" density="compact" label="장비 검색" prepend-inner-icon="mdi-magnify"
          variant="outlined" flat hide-details>
        </v-text-field>
      </v-card-title>

      <!-- 프로그레스 타이머 -->
      <v-progress-linear color="error" v-model="processTime" height="5" :max="refreshTime" />

      <v-divider />

      <!--  장비 현황 카드 (점검필요만 표시)  -->
      <v-row v-if="areaList_selected != '%'" class="d-flex mt-2 mb-2 ma-1 text-center" style="justify-content: center;">
        <v-col cols="12" class="pa-1">
          <v-card density="compact"
            :style="{ background: 'linear-gradient(to bottom, #E57373, #E53935, #D32F2F, #C62828)', color: '#fff' }">
            <v-card-title class="text-subtitle-1">
              <strong>점검필요</strong>
            </v-card-title>
            <v-card-text class="text-h4">
              {{ devicesWithDays.length }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider />

      <!--  데이터 테이블 (ErrorView 내용)  -->
      <v-data-table class="table-fit pa-0" :mobile-breakpoint="0" density="compact" :search="search"
        :filter-keys="['NM_DIST_OBSV']" :headers="headers"
        :header-props="{ align: 'center', style: 'font-weight: bold;' }" :items="devicesWithDays"
        :cell-props="{ align: 'start' }" item-value="IDX" show-expand v-model:page="page"
        v-model:items-per-page="itemsPerPage" items-per-page-text="페이지당 표시 수" :items-per-page-options="[
          { value: 10, title: '10' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]" multi-sort hover fixed-header striped="even">

        <template #no-data>
          점검이 필요한 장비가 없습니다.
        </template>

        <!-- 인덱스 -->
        <template v-slot:[`item.index`]="{ index }">
          <div>
            {{ index + 1 + (page - 1) * itemsPerPage }}
          </div>
        </template>

        <!-- 지역 -->
        <template v-slot:[`item.SIDO_CD`]="{ item }">
          <span>
            <strong>{{ item.SIDO_CD }}</strong>
          </span>
        </template>

        <!-- 장비명 -->
        <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
          <span>
            <strong>{{ item.NM_DIST_OBSV }}</strong>
          </span>
        </template>

        <!-- 장비 구분 -->
        <template v-slot:[`item.GB_OBSV`]="{ item }">
          <th style="width:px" />
          <v-card class="my-2" elevation="0">
            <div v-if="item.GB_OBSV === '01'">
              <v-img :src="rainImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '02'">
              <v-img :src="waterImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '03'">
              <v-img :src="dplaceImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '06'">
              <v-img :src="snowImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '08'">
              <v-img :src="tiltImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '15'">
              <v-img :src="dplaceImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '17'">
              <v-img :src="broadImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '18'">
              <v-img :src="displayImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '20'">
              <v-img :src="gateImg" height="25" />
            </div>
            <div v-else-if="item.GB_OBSV === '21'">
              <v-img :src="floodImg" height="25" />
            </div>
          </v-card>
        </template>

        <!-- 상태 -->
        <template v-slot:[`item.LastStatus`]="{ item }">
          <div class="text-center">
            <v-chip class="text-uppercase" color="red" text="통신오류" size="x-small" label>
            </v-chip>
          </div>
        </template>

        <!-- 최종 수신 시간 -->
        <template v-slot:[`item.LastDate`]="{ item }">
          <div style="font-size: small;">
            {{ formatDate(item.LastDate, 'YY-MM-DD HH시') }}
          </div>
        </template>

        <!-- 경과일 -->
        <template v-slot:[`item.daysSince`]="{ item }">
          <div class="text-center">
            <v-chip :color="getDaysColor(item.daysSince)" size="x-small" label>
              {{ item.daysSince !== null ? `${item.daysSince}일 전` : '-' }}
            </v-chip>
          </div>
        </template>

        <!-- 확장 행 -->
        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-card density="compact" outlined>
              <v-container class="text-center">
                <v-row class="bg-red rounded text-h5">
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
                  <v-col cols="4">{{ formatCoordinate(item.LAT) }} / {{ formatCoordinate(item.LON) }}</v-col>
                  <v-col cols="4">
                    <v-btn @click="openGuideDialog(item)" width="50px" height="40px">
                      <v-img :src="nmapImg" alt="네이버 지도" width="40px" cover></v-img>
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
              </v-container>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <!-- ========== 지도 다이얼로그 ========== -->
    <v-dialog v-model="dialog" width="70vw" max-width="500px">
      <v-card prepend-icon="mdi-map-marker" title="길안내를 시작할까요?">
        <v-card-text class="text-center" v-if="selectedItem">
          <div>
            <v-img class="mx-auto" :width="100" :src="nmapImg"></v-img>
            <strong>{{ selectedItem.NM_DIST_OBSV }}({{ selectedItem.DTL_ADRES }})</strong>로 <br />길안내를 시작하시겠습니 까?
          </div>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">아니오</v-btn>
          <v-btn color="primary" @click="openNaverMapConfirm(selectedItem)">네</v-btn>
        </template>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import { useErrorDevices } from '@/composables/useErrorDevices';
import { formatDate, formatCoordinate } from '@/utils/format';
import { useTimer } from '@/composables/useTimer';
import { REGION_MENU, TIMER_CONFIG } from '@/config/constants';

// 이미지 import
import rainImg from '@/assets/rain.png'
import waterImg from '@/assets/water.png'
import dplaceImg from '@/assets/dplace.png'
import snowImg from '@/assets/snow.png'
import tiltImg from '@/assets/tilt.png'
import broadImg from '@/assets/broad.png'
import displayImg from '@/assets/display.png'
import gateImg from '@/assets/gate.png'
import floodImg from '@/assets/flood.png'
import nmapImg from '@/assets/nmap.png'

// Composable 불러오기
const {
  areaList,
  areaList_selected,
  devices,
  devicesWithDays,
  search,
  page,
  itemsPerPage,
  loading,
  fetchData,
  fetchErrorDevices,
  filterAndSortArea,
  openNaverMap,
} = useErrorDevices('SI');

// 메뉴 및 다이얼로그
const menuList = REGION_MENU;
const model = ref(null);
const dialog = ref(false);
const selectedItem = ref(null);

// 타이머 설정
const refreshTime = ref(TIMER_CONFIG.REFRESH_TIME);

// 테이블 헤더
const headers = [
  { key: 'data-table-expand', width: '35px', sortable: false },
  { key: 'index', width: '15px', sortable: false },
  { key: 'SIDO_CD', title: '지역', width: '50px' },
  { key: 'GB_OBSV', title: '종류', width: '65px' },
  { key: 'NM_DIST_OBSV', title: '장비명', align: 'center' },
  { key: 'LastDate', title: '마지막 통신' },
  { key: 'daysSince', title: '경과일', width: '60px' },
];

// 장비 구분 이름
const getDeviceTypeName = (code) => {
  const devicesTypes = {
    '01': '강우',
    '02': '수위',
    '03': '변위',
    '04': '함수비',
    '06': '적설',
    '08': '경사',
    '15': '침수',
    '17': '예경보',
    '18': '방송',
    '19': '전광판',
    '20': '차단기',
    '21': '통합',
  };
  return devicesTypes[code] || code;
};

// 경과일에 따른 색상
const getDaysColor = (days) => {
  let color = 'gray';

  if (days === 0) color = 'primary';
  else if (days <= 7) color = 'orange';
  else if (days <= 31) color = 'red';
  else if (days <= 365) color = 'gray';

  return color;
};


// 지역 변경
const OnChange_AreaList = async (newArea) => {
  if (newArea != null) {
    areaList_selected.value = newArea;
  }
  await fetchErrorDevices(newArea);
  resetTimer();
};

// 지도 다이얼로그 열기
function openGuideDialog(item) {
  selectedItem.value = item;
  dialog.value = true;
}

// 네이버 지도 열기 확인
function openNaverMapConfirm(item) {
  dialog.value = false;
  const userAgent = navigator.userAgent;
  openNaverMap(item, userAgent);
}

// 새로고침
const handleRefresh = async () => {
  await fetchErrorDevices();
  resetTimer();
};

// 타이머
const { processTime, startTimer, stopTimer, resetTimer } = useTimer(
  refreshTime.value,
  async () => {
    await fetchErrorDevices();
  }
);

// 생명주기
onMounted(() => {
  fetchData();
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style lang="scss" scoped>
// WeatherSIView.vue의 table-fit 스타일
.table-fit {
  font-size: 0.8rem;

  :deep(table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(.v-table__wrapper) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow-x: auto !important; // 가로 스크롤 추가
  }

  :deep(.v-data-table__th),
  :deep(.v-data-table__td) {
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 !important;
  }
}

:deep(.v-card-text) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 반응형 크기 조절 */
@media (max-width: 768px) {
  .table-fit {
    font-size: 1rem;

    :deep(.v-table__wrapper) {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch; // iOS 부드러운 스크롤
    }
  }

  .table-fit th,
  .table-fit td {
    padding: 2px 4px; // 패딩 조정
  }
}

@media (max-width: 480px) {
  .table-fit {
    font-size: 0.6rem;

    :deep(.v-table__wrapper) {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
  }

  .table-fit th,
  .table-fit td {
    padding: 0px 2px; // 패딩 최소화
  }
}

// 컨테이너 여백 조정 (선택사항)
:deep(.v-container) {
  padding: 16px;

  @media (max-width: 768px) {
    padding: 8px;
  }

  @media (max-width: 480px) {
    padding: 4px;
  }
}
</style>