<template>
  <v-card title="SENSOR" flat>
    <template v-slot:text>
      <v-text-field v-model="search" label="센서 검색" prepend-inner-icon="mdi-magnify" variant="outlined"></v-text-field>
    </template>

    <v-data-table 
    :headers="headers" 
    :header-props="{ align: 'center', sortIcon: null }" 
    :items="devices"
    :search="search" :cell-props="{ align: 'center' }" 
    disable-sort 
    items-per-page-text="페이지당 표시 수"
    >
      
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';


const search = ref('');
const devices = ref();
onMounted(async () => {
  try {
    const response = await axios.get('/api/devices');
    devices.value = response.data.data;
    console.log(`${response.data.data}`)
  } catch (err) {
    console.log('데이터를 가져오는 중 오류 발생: ', err)
  }
})

const headers = [
  {
    align: 'start',
    key: 'CD_DIST_OBSV',
    sortable: false,
    title: '순서',
  },
  { key: 'GB_OBSV', title: '종류' },
  { key: 'NM_DIST_OBSV', title: '장비명' },
  { key: 'DTL_ADRES', title: '주소' },
  { key: 'LastStatus', title: '통신상태' },
  { key: 'LastDate', title: '통신시간' },
  { key: 'DATA', title: '데이터' },
];



</script>

<style lang="scss" scoped></style>