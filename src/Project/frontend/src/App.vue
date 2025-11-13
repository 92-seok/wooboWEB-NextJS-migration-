<template>
  <v-responsive class="border rounded">
    <v-app class="app" :theme="theme">
      <Header />
      <Main />
      <Footer />
    </v-app>
  </v-responsive>
</template>

<script setup>
////////////////////////////////////////
// Import
////////////////////////////////////////
import { onMounted, onUnmounted, ref, inject, provide } from 'vue'
import { useTheme } from 'vuetify';

// Layouts
import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'

// Theme 전역변수
const theme = ref(useTheme().global.name.value);
const OnClick_theme = (e) => {
  theme.value = (theme.value === 'light') ? 'dark' : 'light'
}
provide('theme', { theme, OnClick_theme });

// Theme Color 전역변수
const theme_color = ref('primary');
const OnClick_theme_color = (e) => {
  theme_color.value = e;
}
provide('theme_color', { theme_color, OnClick_theme_color });

////////////////////////////////////////
// Form 이벤트
////////////////////////////////////////
onMounted(() => {
  console.log(`프로그램 시작(${inject('$title')}) / Theme(${theme.value})`); // 전역변수 Vue3 Style
});

onUnmounted(() => {
  console.log(`프로그램 종료`);
});
</script>

<style lang="scss">
html,
body {
  /* 스크롤 바 감추기 */
  /* IE and Edge */
  -ms-overflow-style: none;
  /* Firefox */
  scrollbar-width: none;

  /* Chrome */
  &::-webkit-scrollbar {
    display: none !important;
  }
}

.app {
  height: 100vh;
  overflow: hidden;
}
</style>