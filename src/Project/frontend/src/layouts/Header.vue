<template>
  <!-- 시스템 바 -->
  <v-system-bar color="indigo-darken-2">
    <!-- 시간 -->
    <span class="text-subtitle-1">{{ time }}</span>
  </v-system-bar>

  <!-- 앱 바 -->
  <v-app-bar :color=theme_color density="compact" class="px-3">

    <!-- 앱 바 네비게이션 아이콘 -->
    <!--
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
    -->

    <!-- 앱 바 타이틀 -->
    <v-app-bar-title>
      <v-btn class="text-subtitle-1" @click="router.replace('/')" text="우보 온라인 - 운영지원시스템"></v-btn>
    </v-app-bar-title>

    <!-- 테마 버튼 -->
    <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click=OnClick_theme />
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
import { onMounted, onUnmounted, inject, ref } from 'vue';
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter();

////////////////////////////////////////
// 테마
////////////////////////////////////////
const { theme, OnClick_theme } = inject('theme')
const { theme_color } = inject('theme_color')

////////////////////////////////////////
// Form 이벤트
////////////////////////////////////////
onMounted(() => {
});

onUnmounted(() => {
});

////////////////////////////////////////
// 타이머 이벤트 > 현재 시간 갱신
////////////////////////////////////////
let time = ref('');
setInterval(() => {
  time.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
}, 1000);

</script>

<style lang="scss" scoped></style>