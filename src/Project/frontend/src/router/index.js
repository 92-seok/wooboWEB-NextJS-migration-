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
  { path: "/control", component: ControlView },
  { path: "/setting", component: SettingView },
  { path: "/about", component: AboutView },
  { path: "/login", component: LoginView },
  { path: "/kakao-callback", component: KakaoCallback },
  { path: "/test", component: TestView },
  { path: "/signup", component: SignupView },
];

const router = createRouter({
  history: createWebHistory(),
  //history: createMemoryHistory(),
  routes,
});

// 라우트 가드 - 인증확인 로직
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('accessToken');

  // 인증이 필요한 페이지인데 토큰 없으면 로그인페이지로 이동
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/signup') && token) { 
    //이미 로그인 했는데 로그인/회원가입 페이지 접근시 홈으로 이동시키기
    next('/');
  } else {
    next();
  }
});

export default router;
