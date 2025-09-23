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

const routes = [
  //{ path: "/", component: HomeView },
  //{ path: "/", component: ControlView },
  { path: "/", component: MonitorView },
  { path: "/home", component: HomeView },
  { path: "/monitor", component: MonitorView },
  { path: "/control", component: ControlView },
  { path: "/setting", component: SettingView },
  { path: "/about", component: AboutView },
  { path: "/login", component: LoginView },
];

const router = createRouter({
  //history: createWebHistory('/'),
  history: createMemoryHistory(),
  routes,
});

export default router;
