/* eslint-disable no-unused-vars */
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";

import HomeView from "@/Views/HomeView.vue";
import WeatherSiView from "@/Views/WeatherSIView.vue";
import WeatherSrView from "@/Views/WeatherSRView.vue";
import ControlView from "@/Views/ControlView.vue";
import SettingView from "@/Views/SettingView.vue";
import AboutView from "@/Views/AboutView.vue";
import LoginView from "@/Views/LoginView.vue";
import TestView from "@/Views/TestView.vue";
import MapView from "@/Views/MapView.vue";
import KakaoCallback from "@/Views/KakaoCallback.vue";
import SignupView from "@/Views/SignupView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/home", component: HomeView },
  { path: "/map", component: MapView },
  { path: "/weathersi", component: WeatherSiView },
  { path: "/weathersr", component: WeatherSrView },
  {
    path: "/control",
    component: ControlView,
    computed: () => import('@/Views/ControlView.vue'),
    meta: { requiresAuth: true } // 로그인 필수로하기
  },
  {
    path: "/setting",
    component: SettingView,
    // meta: { requiresAuth: true, requiresAdmin: true } // 로그인 필수로하기 
  },
  { path: "/about", component: AboutView },
  { path: "/login", component: LoginView, meta: { requiresGuest: true } },
  { path: "/kakao-callback", component: KakaoCallback },
  { path: "/test", component: TestView },
  { path: "/signup", component: SignupView, meta: { requiresGuest: true } },
];

const router = createRouter({
  history: createWebHistory(),
  //history: createMemoryHistory(),
  routes,
});

// 라우트 가드 - 인증확인 로직
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('accessToken');
  const userStr = sessionStorage.getItem('user');

  const isLoggedIn = !!token;
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data', error)
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
