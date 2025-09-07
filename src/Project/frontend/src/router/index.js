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

const routes = [
  { path: "/", component: HomeView },
  { path: "/home", component: HomeView },
  { path: "/monitor", component: MonitorView },
  { path: "/control", component: ControlView },
  { path: "/setting", component: SettingView },
  { path: "/about", component: AboutView },
];

const router = createRouter({
  //history: createWebHistory('/'),
  history: createMemoryHistory(),
  routes,
});

export default router;
