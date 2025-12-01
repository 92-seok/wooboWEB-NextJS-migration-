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
import axios from 'axios';

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
const syncUserPermissions = async () => {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return

  try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await axios.get('/api/auth/me');

    if (response.data && response.data.user) {
      const user = response.data.user;

      // sessionStorage 업데이트 (최신 권한 반영)
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userName', user.name || user.username);

      // console.log('권한 정보 동기화 완료: ', user.role);
    }
  } catch (error) {
    console.error('사용자 정보 동기화 실패: ', error);
    // 토큰이 만료되었으면 로그아웃 처리하기
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }
}

let syncInterval = null;

onMounted(async () => {
  // console.log(`프로그램 시작(${inject('$title')}) / Theme(${theme.value})`); // 전역변수 Vue3 Style
  // 최초 권한 동기화
  await syncUserPermissions();

  // 30초 마다 권한 자동 동기화
  syncInterval = setInterval(async () => {
    await syncUserPermissions();
  }, 30000)
});

onUnmounted(() => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  // console.log(`프로그램 종료`);
});


</script>

<style lang="scss">
// .app {
//   height: 100vh;
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
// }

// :deep(.v-main) {
//   flex: 1;
//   overflow-y: auto;
// }

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