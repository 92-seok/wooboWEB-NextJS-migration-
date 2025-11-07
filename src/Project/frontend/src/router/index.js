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
];

const router = createRouter({
  history: createWebHistory(),
  //history: createMemoryHistory(),
  routes,
});

export default router;
