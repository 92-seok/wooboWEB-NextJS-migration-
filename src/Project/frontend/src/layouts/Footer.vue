<template>
  <v-bottom-navigation v-model="menu_idx" :bg-color=theme_color density="comfortable" grow>
    <v-btn @click="router.push('/map')">
      <v-icon>mdi-map</v-icon>
      <span class="text-subtitle-2">지도</span>
    </v-btn>

    <v-btn @click="router.push('/weathersi')">
      <v-icon>mdi-television-play</v-icon>
      <span class="text-subtitle-2">통합관측</span>
    </v-btn>

    <v-btn @click="router.push('/weathersr')">
      <v-icon>mdi-waves-arrow-up</v-icon>
      <span class="text-subtitle-2">소하천</span>
    </v-btn>

    <!-- 관리자 전용: 사용자 관리 페이지 -->
    <!-- <v-btn v-if="isAdmin" @click="router.push('/admin')">
      <v-icon>mdi-account-cog</v-icon>
      <span class="text-subtitle-2">관리자</span>
    </v-btn> -->

    <!-- 관리자 전용: 제어 이력 페이지 -->
    <v-btn v-if="isAdmin" @click="router.push('/setting')">
      <v-icon>mdi-history</v-icon>
      <span class="text-subtitle-2">관리</span>
    </v-btn>

    <!-- 로그인 상태일 때 : 로그아웃 버튼 -->
    <v-btn v-if="isLoggedIn" @click="isAdmin ? router.push('/admin') : handleLogout()">
      <v-icon>mdi-account</v-icon>
      <span class="text-subtitle-2">{{ userName }}님</span>
    </v-btn>

    <!-- 로그아웃 상태일 때 : 로그인 버튼 -->
    <v-btn v-else @click="router.push('/login')">
      <v-icon>mdi-account</v-icon>
      <span class="text-subtitle-2">로그인</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>

////////////////////////////////////////
// Import
////////////////////////////////////////
import { onMounted, onUnmounted, inject, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios';

const router = useRouter();

////////////////////////////////////////
// 테마
////////////////////////////////////////
const { theme_color } = inject('theme_color');

// reactive status
const menu_idx = ref(-1);

////////////////////////////////////////
// 로그인 상태 관리
////////////////////////////////////////
const isLoggedIn = ref(!!sessionStorage.getItem('accessToken'));
const logoutDialog = ref(false);
const loading = ref(false);

const userName = ref(sessionStorage.getItem('userName') || '사용자');

// 관리자 권한 체크
const isAdmin = ref(false);

// 로그인 상태 체크 함수 로직
const checkLoginStatus = () => {
  isLoggedIn.value = !!sessionStorage.getItem('accessToken');
  userName.value = sessionStorage.getItem('userName') || '사용자';

  try {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    isAdmin.value = user?.role === 'admin';
  } catch (error) {
    console.error('Failed to parse user data', error);
    isAdmin.value = false;
  }
}
// 라우터 변경 시 로그인 상태 체크하는 로직
watch(() => router.currentRoute.value, () => {
  checkLoginStatus();
}, { immediate: true });

////////////////////////////////////////
// 로그아웃 상태 관련 로직
////////////////////////////////////////

// 로그아웃 버튼 클릭
const handleLogout = async () => {
  await confirmLogout();
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
      console.log('로그아웃 API 호출 성공')
    }
  } catch (error) {
    console.error('로그아웃 API 실패: ', error);
    // 에러가 발생해도 계속 진행하기 (로컬 데이터는 삭제)
  } finally {

    // 다이얼로그 닫기
    logoutDialog.value = false;
    isLoggedIn.value = false;
    isAdmin.value = false;
    loading.value = false;

    // 로컬 데이터 정리하기
    clearAuthData()

    // 로그인 페이지로 이동
    router.push('/login');
  }
}

// 인증 데이터 정리
const clearAuthData = () => {
  // 토큰 삭제하기 로직
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userRole');

  // axios 기본 헤더에서 토큰 제거하기
  delete axios.defaults.headers.common['Authorizaion'];

  console.log('인증 데이터 정리 완료');
}

////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {
  // 초기 로그인 상태 체크하기
  checkLoginStatus();
});

onUnmounted(() => {
});

</script>

<style lang="scss" scoped>
/* v-bottom-navigation v-btn */
.v-bottom-navigation .v-bottom-navigation__content .v-btn {
  margin: 0px;
  padding: 0px;
  min-width: 60px;
}
</style>