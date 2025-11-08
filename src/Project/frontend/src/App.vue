<template>
  <v-app :theme="theme">
    <Header />
    <Main />
    <Footer />
  </v-app>
</template>

<script setup>
////////////////////////////////////////
// Import
////////////////////////////////////////

// Layouts
import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'

// 전역변수 사용
import { onMounted, inject, ref, provide } from 'vue'
import { useTheme } from 'vuetify';

// Theme 전역변수
const theme = ref(useTheme().global.name.value);
const OnClick_theme = (e) => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
};
provide('theme', {theme, OnClick_theme});

// Theme Color 전역변수
const theme_color = ref('primary');
const OnClick_theme_color = (e) => {
  console.log(e);
  theme_color.value = e;
};
provide('theme_color', {theme_color, OnClick_theme_color});

// Form 이벤트
onMounted(() => {
  console.log(`프로그램 시작(${inject('$title')}) ${theme.value}`); // 전역변수 Vue3 Style
});


</script>

<!--
<script>
import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'
import { ref } from 'vue' // Vue3 실시간 상태감시
const theme = ref();

  // Options Style
  export default {
    name: 'App',
  components: {
    Header, Main, Footer
  },
  setup() {
    const count = ref(0) // vue3 실시간 상태감시
    return { count }
  },
  // Form 이벤트
  mounted() {
    console.log(`프로그램 시작! (${this.$title})`); // 전역변수 Vue2 Style
  },
  btnEvent(e) {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    console.log(theme.value + e);
  },
}
</script>
-->

<style>
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
</style>