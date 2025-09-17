<template>
  <v-card title="SENSOR" flat>
    <template v-slot:text>
      <v-text-field v-model="search" label="센서 검색" density="compact" prepend-inner-icon="mdi-magnify"
        variant="outlined"></v-text-field>
    </template>
    <v-card-text class="pa-0">
      <v-data-table 
        :headers="headers" 
        :header-props="{ align: 'center', sortIcon: null }" 
        :items="devices"
        :search="search" 
        :cell-props="{ align: 'center' }" 
        disable-sort 
        items-per-page-text="페이지당 표시 수"
        density="compact" :mobile-breakpoint="0" class="table-fit pa-0" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const search = ref('')
const devices = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('/api/devices')
    devices.value = response.data.data
  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
})

const headers = [
  //{ key: 'GB_OBSV', title: '종류' },
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
