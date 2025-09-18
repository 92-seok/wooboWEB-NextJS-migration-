<template>
  <v-container>
    <v-select :items="areaList" :menu-props="{ scrim: true, scrollStrategy: 'close' }" label="지역"
      @update:model-value="OnChange_AreaList"></v-select>
    <!--
      <v-autocomplete :items="areaList" label="지역" chips multiple>
        <template v-slot:subheader="{ props }">
          <v-list-subheader class="font-weight-bold bg-primary">{{ props.title }}</v-list-subheader>
        </template>
</v-autocomplete>
-->
  </v-container>

  <v-card flat>

    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-list-box-outline"></v-icon> &nbsp;
      센서 목록
      <v-spacer></v-spacer>

      <!--
        <v-text-field v-model="search" density="compact" label="센서 검색" prepend-inner-icon="mdi-magnify"></v-text-field>
        -->
      <v-text-field v-model="search" density="compact" label="센서 검색" prepend-inner-icon="mdi-magnify" variant="outlined"
        flat hide-details></v-text-field>
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table v-model:search="search" :filter-keys="['name']" :items="devices" :headers="headers"
      :header-props="{ align: 'center', sortIcon: null, }" :cell-props="{ align: 'center' }" :mobile-breakpoint="0"
      class="table-fit pa-0" items-per-page="25">

      <template v-slot:[`item.GB_OBSV`]="{ item }">
        <th style="width:10px" />
        <v-card class="my-2" elevation="0">
          <div v-if="item.GB_OBSV === '01'">
            <v-img :src="require('@/assets/rain.png')" height="30" />
          </div>
          <div v-if="item.GB_OBSV === '02'">
            <v-img :src="require('@/assets/water.png')" height="30" />
          </div>
          <div v-if="item.GB_OBSV === '03'">
            <v-img :src="require('@/assets/dplace.png')" height="30" />
          </div>
          <div v-if="item.GB_OBSV === '21'">
            <v-img :src="require('@/assets/flood.png')" height="30" />
          </div>
        </v-card>
      </template>

      <template v-slot:[`item.NM_DIST_OBSV`]="{ item }">
        <div class="text-center">
          <strong>{{ item.NM_DIST_OBSV }}</strong>
        </div>
      </template>

      <template v-slot:[`item.rating`]="{ item }">
        <v-rating :model-value="item.rating" color="orange-darken-2" density="compact" size="small" readonly></v-rating>
      </template>

      <template v-slot:[`item.LastStatus`]="{ item }">
        <div class="text-center">
          <v-chip :color="item.LastStatus == 'OK' ? 'green' : 'red'" :text="item.LastStatus == 'OK' ? '정상' : '점검필요'"
            class="text-uppercase" size="small" label></v-chip>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-card title="SENSOR" flat>
    <template v-slot:text>
      <v-text-field v-model="search" label="센서 검색" density="compact" prepend-inner-icon="mdi-magnify"
        variant="outlined"></v-text-field>
    </template>
    <v-card-text class="pa-0">
      <v-data-table :headers="headers" :header-props="{ align: 'center', sortIcon: null }" :items="devices"
        :search="search" :cell-props="{ align: 'center' }" disable-sort items-per-page-text="페이지당 표시 수"
        density="compact" :mobile-breakpoint="0" class="table-fit pa-0" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const areaList = ref([])
const search = ref('')
const devices = ref([])

const OnChange_AreaList = async (e) => {
  const response = await axios.get(`/api/devices?BDONG_CD=${e}`)
  devices.value = response.data.data

  console.log(devices.value);
}

onMounted(async () => {
  try {

    const response_areaList = await axios.get('/api/areaList')

    console.log(
      areaList.value = response_areaList.data.data.map(item => ({
        title: item.RM, value: item.ADMCODE
      })));


    //console.log(areaList.value);

    const response = await axios.get('/api/devices')
    devices.value = response.data.data
  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
})

const headers = [
  { key: 'GB_OBSV', title: '장비 종류', width: '70px' },
  { key: 'NM_DIST_OBSV', title: '장비명' },
  { key: 'LastDate', title: '통신시간' },
  { key: 'LastStatus', title: '통신상태' },
  { key: 'DATA', title: '데이터' },
]
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
