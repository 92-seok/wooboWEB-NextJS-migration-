<template v-slot:append>
  <!-- 시스템 바 -->
  <v-system-bar color="indigo-darken-2">
    <!-- 시간 -->
    <span>{{ time }}</span>
  </v-system-bar>

  <!-- 앱 바 -->
  <v-app-bar color="primary" density="compact">

    <!-- 앱 바 네비게이션 아이콘 -->
    <!--
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
    -->

    <!-- 앱 바 타이틀 -->
    <v-app-bar-title>
      <v-btn @click="router.replace('/')"><span>우보 온라인 - 운영지원시스템</span></v-btn>
    </v-app-bar-title>

    <!-- 테마 버튼 -->
    <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="onClick_Theme" />
  </v-app-bar>

  <!-- 사이드 메뉴 -->
  <!--
  <v-navigation-drawer>
      <v-list>
          <v-list-item title="1" />
          <v-list-item title="2" />
          <v-list-item title="3" />
          <v-list-item title="4" />
      </v-list>
  </v-navigation-drawer>
  -->
</template>

<script setup>
////////////////////////////////////////
// Import
////////////////////////////////////////
import { ref, onMounted, defineEmits } from 'vue';
import axios from "axios";
import dayjs from 'dayjs'
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router'
const router = useRouter();

////////////////////////////////////////
// 현재 시간
////////////////////////////////////////
let time = ref('');
setInterval(() => {
  time.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
}, 1000);

////////////////////////////////////////
// 테마
////////////////////////////////////////
const theme = ref(useTheme().global.name.value);
const emit = defineEmits(['click:btnClick'])

function onClick_Theme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  emit('click:btnClick', theme.value);
}

////////////////////////////////////////
// 이벤트
////////////////////////////////////////
onMounted(() => {
  console.log(`Header.vue::onMounted() / Theme=${theme.value}`);
});


////////////////////////////////////////
// 다운로드
////////////////////////////////////////
const onDownload = async () => {
  console.log("다운로드시작");

  try {
    const response = await axios.get("/api/download", {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "우보 온라인.apk");
    document.body.appendChild(link);
    link.click();
  }
  catch (err) {
    console.error(err);
  }
}
</script>

<style lang="scss" scoped></style>