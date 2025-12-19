<template>
  <!-- 시스템 바 -->
  <v-system-bar color="indigo-darken-2">
    <!-- 시간 -->
    <span class="text-subtitle-1">{{ time }}</span>
  </v-system-bar>

  <!-- 앱 바 -->
  <v-app-bar :color=theme_color density="compact" class="px-3">

    <!-- 앱 바 네비게이션 아이콘 -->
    <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->

    <!-- 앱 바 타이틀 -->
    <v-app-bar-title>
      <!-- 모바일: 로고 이미지 -->
      <v-btn class="d-sm-none px-2 mobile-logo-btn" @click="router.replace('/')" variant="flat">
        <v-img :src="ciWooboLogo" height="32" width="auto" contain class="mobile-logo" />
      </v-btn>
      <!-- 태블릿 이상: 전체 텍스트 -->
      <v-btn class="text-subtitle-1 d-none d-sm-inline" @click="router.replace('/')" text="우보 온라인 - 운영지원시스템"></v-btn>
    </v-app-bar-title>

    <!-- 테마 버튼 -->
    <v-btn :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="OnClick_theme" size="small"
      class="theme-btn" />

    <!-- 사용자 정보(로그인 상태일 때만 표시) -->
    <div v-if="isLoggedIn" class="d-flex align-center user-info-container">
      <!-- 데스크탑: 아이콘 + 이름 -->
      <v-icon class="mr-1" size="small">mdi-account-circle</v-icon>
      <span class="text-body-2 d-none d-sm-inline">{{ userName }}</span>
    </div>


    <!-- 로그아웃 버튼 (로그인 상태일 때만 표시) -->
    <v-btn v-if="isLoggedIn" prepend-icon="mdi-logout" @click="handleLogout" :loading="loading" variant="tonal"
      size="small" class="logout-btn">
      <!-- 데스크탑: 텍스트 표시 -->
      <span class="logout-text">로그아웃</span>
    </v-btn>

    <!-- 로그인 버튼 (비로그인 상태일 때만 표시) -->
    <v-btn v-else prepend-icon=" mdi-login" color="white" size="small" @click="router.push('/login')" class="login-btn">
      <!-- 데스크탑: 텍스트 표시 -->
      <span class="login-text">로그인</span>
    </v-btn>
  </v-app-bar>

  <v-dialog v-model="logoutDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
        로그아웃 확인
      </v-card-title>
      <v-card-text>
        로그아웃 하시겠습니까?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="logoutDialog = false" :disabled="loading">
          취소
        </v-btn>
        <v-btn color="error" variant="elevated" @click="confirmLogout" :loading="loading">
          로그아웃
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import { onMounted, onUnmounted, inject, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router'
import axios from 'axios'
import dayjs from 'dayjs'
import ciWooboLogo from '@/assets/ci_woobosys.png'

const router = useRouter();

////////////////////////////////////////
// 테마
////////////////////////////////////////
const { theme, OnClick_theme } = inject('theme')
const { theme_color } = inject('theme_color')

////////////////////////////////////////
// 로그아웃 관련
////////////////////////////////////////
const logoutDialog = ref(false);
const loading = ref(false);

// 로그인 상태 확인하기
const isLoggedIn = ref(!!sessionStorage.getItem('accessToken'));

// 사용자 이름
const userName = ref(sessionStorage.getItem('userName') || '사용자');

// 로그인 상태 체크 함수 로직
const checkLoginStatus = () => {
  // console.log('=== Header checkLoginStatus 호출 ===');

  isLoggedIn.value = !!sessionStorage.getItem('accessToken');
  userName.value = sessionStorage.getItem('userName') || '사용자';

  // console.log('sessionStorage userName:', sessionStorage.getItem('userName'));
  // console.log('userName.value:', userName.value);
}

watch(() => router.currentRoute.value, () => {
  checkLoginStatus();
}, { immediate: true });

// 로그아웃 버튼 클릭
const handleLogout = () => {
  logoutDialog.value = true;
};

// 로그아웃 확인
const confirmLogout = async () => {
  loading.value = true;

  try {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const accessToken = sessionStorage.getItem('accessToken');

    // 백엔드 로그아웃 요청하기(refreshToken 무효화)
    if (refreshToken && accessToken) {
      await axios.post('/api/auth/logout',
        { refreshToken },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      // console.log('로그아웃 API 호출 성공')
    }
  } catch (error) {
    console.error('로그아웃 API 실패: ', error);
    console.error('에러 상세: ', error.response?.data);
    // 에러가 발생해도 계속 진행하기 (로컬 데이터는 삭제)
  } finally {
    // 로컬 데이터 정리하기
    clearAuthData()

    // 다이얼로그 닫기
    logoutDialog.value = false;
    loading.value = false;

    // 로그인 페이지로 이동
    router.push('/login');
  }
}

// 인증된 데이터 정리 로직
const clearAuthData = () => {
  // 토큰 삭제하기 로직
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userRole');

  // localStorage 자동로그인 데이터 삭제하기
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // localStorage.removeItem('autoLogin');

  // axios 기본 헤더에서 토큰 제거하기
  delete axios.defaults.headers.common['Authorization'];

  // console.log('인증 데이터 정리 완료');
}

////////////////////////////////////////
// Form 이벤트
////////////////////////////////////////
onMounted(() => {
  // 페이지 로드 시 토큰이 있으면 axios 헤더에 설정해주기
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
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

<style lang="scss" scoped>
.theme-btn {
  margin-right: 4px;
}

.header-logo {
  filter: drop-shadow(0 0 8px rgba(103, 58, 183, 0.4));
  transition: all 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 12px rgba(103, 58, 183, 0.6));
    transform: scale(1.1);
  }
}

.mobile-logo {
  filter: drop-shadow(0 0 8px rgba(103, 58, 183, 0.4));
  transition: all 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 12px rgba(103, 58, 183, 0.6));
    transform: scale(1.1);
  }
}

// 사용자 정보
.user-info-container {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 8px;
}

.user-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

// 로그인/로그아웃 버튼
.logout-btn,
.login-btn {
  font-weight: 500;

  .logout-text,
  .login-text {
    font-size: 0.75rem;
  }

  :deep(.v-btn__prepend) {
    margin-inline-end: 4px;
  }
}

// 태블릿 이상
@media (min-width: 600px) {
  .user-name {
    max-width: 150px;
  }

  .logout-btn,
  .login-btn {

    .logout-text,
    .login-text {
      font-size: 0.875rem;
    }

    :deep(.v-btn__prepend) {
      margin-inline-end: 8px;
    }
  }
}

// 데스크탑
@media (min-width: 960px) {
  .user-name {
    max-width: none;
  }

  .logout-btn,
  .login-btn {

    .logout-text,
    .login-text {
      font-size: 1rem;
    }
  }
}

.header-logo {
  filter: drop-shadow(0 0 8px rgba(103, 58, 183, 0.4));
  transition: all 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 12px rgba(103, 58, 183, 0.6));
    transform: scale(1.1);
  }
}
</style>