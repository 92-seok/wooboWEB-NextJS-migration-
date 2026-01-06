/* eslint-disable no-unused-vars */
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";
import axios from 'axios';

import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'
import WeatherSIView from '../views/WeatherSIView.vue'
import WeatherSRView from '../views/WeatherSRView.vue'
// import ControlView from '../views/ControlView.vue'
import SettingView from '../views/SettingView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import KakaoCallback from '../views/KakaoCallback.vue'
import ErrorView from '../views/ErrorView.vue'

const routes = [
  { path: "/", component: HomeView },
  { path: "/home", component: HomeView },
  { path: "/map", component: MapView },
  { path: "/weathersi", component: WeatherSIView },
  { path: "/weathersr", component: WeatherSRView },
  // {
  //   path: "/control",
  //   component: ControlView,
  //   computed: () => import('@/views/ControlView.vue'),
  //   meta: { requiresAuth: true } // 로그인 필수로하기
  // },
  {
    path: "/setting",
    component: SettingView,
    // meta: { requiresAuth: true, requiresAdmin: true } // 로그인 필수로하기 
  },
  { path: "/admin", component: AdminView },
  { path: "/login", component: LoginView, meta: { requiresGuest: true } },
  { path: "/kakao-callback", component: KakaoCallback },
  { path: "/signup", component: SignupView, meta: { requiresGuest: true } },
  { path: "/error", component: ErrorView },
];

const router = createRouter({
  history: createWebHistory(),
  //history: createMemoryHistory(),
  routes,
});

// 라우트 가드 - 인증확인 로직
router.beforeEach(async (to, from, next) => {
  const token = sessionStorage.getItem('accessToken');
  const userStr = sessionStorage.getItem('user');

  const isLoggedIn = !!token;
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data', error)
  }

  // 로그인 상태이면 최산 권한 정보 동기화
  if (isLoggedIn && token) {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/me');

      if (response.data && response.data.user) {
        const latestUser = response.data.user;

        // sessionStorage 업데이트
        sessionStorage.setItem('user', JSON.stringify(latestUser));
        sessionStorage.setItem('userRole', latestUser.role);
        sessionStorage.setItem('userName', latestUser.name || latestUser.username);

        // user 변수도 업데이트
        user = latestUser;
      }
    } catch (error) {
      console.error('권한 정보 동기화 실패: ', error);
      if (error.response?.status === 401) {
        // 토큰 만료 시 로그인 종료
        sessionStorage.clear();
        next('/login');
        return;
      }
    }
  }

  // 인증이 필요한 페이지인데 토큰 없으면 로그인페이지로 이동
  // 1. 관리자 권한이 필요한 페이지
  if (to.meta.requiresAdmin) {
    if (!isLoggedIn) {
      next({
        path: 'login',
        query: { redirect: to.fullPath }, // 로그인 후에 원래 페이지로 이동하기
      });
      return;
    }

    if (user?.role !== 'admin') {
      // 로그인 했지만 관리자가 아닐때
      alert('관리자만 접근 가능한 페이지 입니다.')
      next('/') // 홈으로 리다이렉트하기
      return;
    }
  }

  // 2. 인증이 필요한 페이지(일반사용자 경우)
  if (to.meta.requiresAuth && !isLoggedIn && to.path !== '/setting') {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 3. 게스트 전용 페이지 (로그인/회원가입)
  if (to.meta.requiresGuest && isLoggedIn) {
    // 이미 로그인 했는데 로그인/회원가입 페이지 접근시 홈으로
    next('/')
    return;
  }

  // 모든 조건 통과시
  next()
});

//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next('/login');
//   } else if ((to.path === '/login' || to.path === '/signup') && isLoggedIn) { 
//     //이미 로그인 했는데 로그인/회원가입 페이지 접근시 홈으로 이동시키기
//     next('/');
//   } else {
//     next();
//   }
// });

export default router;
