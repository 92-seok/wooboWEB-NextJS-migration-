<template>
    <v-card title="센서" flat>
        <template v-slot:text>
            <v-text-field v-model="search" label="센서 검색" prepend-inner-icon="mdi-magnify" variant="outlined" ></v-text-field>
        </template>

        <!-- <v-data-table :headers="headers" :items="desserts" :search="search"></v-data-table> -->
        <v-data-table :items="devices" :search="search"></v-data-table>        
    </v-card>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios';


  const search = ref([]);
  const devices = ref();
  onMounted(async () => {
    try {
      const response = await axios.get('/api/devices');
      devices.value = response.data;
      console.log(`${response.data}`)
    } catch(err) {
      console.log('데이터를 가져오는 중 오류 발생: ', err)
    }
  })
  // const headers = [
  //   {
  //     align: 'start',
  //     key: 'name',
  //     sortable: false,
  //     title: '장비명',
  //   },
  //   { key: 'calories', title: '종류' },
  //   { key: 'fat', title: '상태' },
  //   { key: 'carbs', title: '통신시간' },
  //   { key: 'protein', title: '주소' },
  //   { key: 'iron', title: '수치' },
  // ]
  // const desserts = [
  //   {
  //     name: 'Frozen Yogurt',
  //     calories: 159,
  //     fat: 6,
  //     carbs: 24,
  //     protein: 4,
  //     iron: 1,
  //   },
  //   {
  //     name: 'Ice cream sandwich',
  //     calories: 237,
  //     fat: 9,
  //     carbs: 37,
  //     protein: 4.3,
  //     iron: 1,
  //   },
  //   {
  //     name: 'Eclair',
  //     calories: 262,
  //     fat: 16,
  //     carbs: 23,
  //     protein: 6,
  //     iron: 7,
  //   },
  //   {
  //     name: 'Cupcake',
  //     calories: 305,
  //     fat: 3.7,
  //     carbs: 67,
  //     protein: 4.3,
  //     iron: 8,
  //   },
  //   {
  //     name: 'Gingerbread',
  //     calories: 356,
  //     fat: 16,
  //     carbs: 49,
  //     protein: 3.9,
  //     iron: 16,
  //   },
  //   {
  //     name: 'Jelly bean',
  //     calories: 375,
  //     fat: 0,
  //     carbs: 94,
  //     protein: 0,
  //     iron: 0,
  //   },
  //   {
  //     name: 'Lollipop',
  //     calories: 392,
  //     fat: 0.2,
  //     carbs: 98,
  //     protein: 0,
  //     iron: 2,
  //   },
  //   {
  //     name: 'Honeycomb',
  //     calories: 408,
  //     fat: 3.2,
  //     carbs: 87,
  //     protein: 6.5,
  //     iron: 45,
  //   },
  //   {
  //     name: 'Donut',
  //     calories: 452,
  //     fat: 25,
  //     carbs: 51,
  //     protein: 4.9,
  //     iron: 22,
  //   },
  //   {
  //     name: 'KitKat',
  //     calories: 518,
  //     fat: 26,
  //     carbs: 65,
  //     protein: 7,
  //     iron: 6,
  //   },
  // ]
</script>

<style lang="scss" scoped></style>