<template>
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
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import axios from 'axios'

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


////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {

  console.log("SRiverView::onMounted()");

  if (refresh_timer) {
    clearInterval(refresh_timer);
  }

  refresh_timer = setInterval(OnTimer_Refresh, 1000);

  await Process();
})

onUnmounted(() => {
  console.log("SRiverView::onUnmount()");

  if (refresh_timer) {
    clearInterval(refresh_timer);
    refresh_timer = null;
  }
})

const OnTimer_Refresh = async () => {
  process_time.value--;
  if (process_time.value == 0) {
    await Process();
  }
}

const Process = async () => {
  console.log("Process()");

  try {
    const response_areaList = await axios.get('/api/weathersr/areaList');
    console.log(response_areaList.data);
    areaList.value = response_areaList.data.data.map(item => ({
      title: item.RM, value: item.ADMCODE
    }));

    await OnChange_AreaList();
  }
  catch (ex) { console.log(ex) }

  process_time.value = refresh_time.value;
}

const OnChange_AreaList = async (newArea) => {
  if (newArea != null) {
    areaList_selected.value = newArea;
  }

  try {
    const response = await axios.get(`/api/weathersr/devices?BDONG_CD=${areaList_selected.value}`)

    devices.value = response.data.data.map(item => ({
      ...item,
      SIDO_CD: areaList.value.find(area => area.value.slice(0, 4) === item.SIDO_CD)?.title.split(' ').slice(-1)[0]
    }));
    console.log(devices.value);
  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
}

</script>

<style lang="scss" scoped></style>