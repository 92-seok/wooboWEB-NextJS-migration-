/* eslint-disable no-unused-vars */
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from "vue-router";

import HomeView from "@/Views/HomeView.vue";
import MonitorView from "@/Views/MonitorView.vue";
import ControlView from "@/Views/ControlView.vue";
import SettingView from "@/Views/SettingView.vue";
import AboutView from "@/Views/AboutView.vue";
import LoginView from "@/Views/LoginView.vue";
import DownloadView from "@/Views/DownloadView.vue";
import TestView from "@/Views/TestView.vue";
import MapView from "@/Views/MapView.vue";

const routes = [
  //{ path: "/", component: HomeView },
  //{ path: "/", component: ControlView },
  { path: "/", component: DownloadView },
  // { path: "/home", component: HomeView },
  { path: "/monitor", component: MonitorView },
  { path: "/control", component: ControlView },
  { path: "/setting", component: SettingView },
  { path: "/about", component: AboutView },
  { path: "/login", component: LoginView },
  { path: "/download", component: DownloadView },
  { path: "/test", component: TestView },
  { path: "/map", component: MapView },
];

const router = createRouter({
  history: createWebHistory(),
  //history: createMemoryHistory(),
  routes,
});

export default router;
