// Vue3
import { createApp } from "vue";
import App from "./App.vue";

// Vue-router
import router from "@/router";

// Vuetify
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// Vuetify Lab
import { VPie } from "vuetify/labs/VPie";

const vuetify = createVuetify({
  components,
  directives,
  VPie,
  // 아이콘 셋 사용 mdi
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
  // 테마 사용 system
  theme: {
    defaultTheme: "light", // light, dark, system
  },
});

// 프로그램 생성
const app = createApp(App);

/*// 에러 핸들링
app.config.errorHandler = (err) => {
  console.log("errorHandler" + err);
};
//*/

/*// 경고 핸들링
app.config.warnHandler = (err) => {
  console.log("warnHandler:" + err);
};
//*/

// 전역변수 설정
app.provide("$title", "운영지원시스템"); // Vue3 방식
app.config.globalProperties.$title = "운영지원시스템"; // Vue2 방식

// 프로그램 마운트(실행)
app.use(router).use(vuetify).mount("#app");
