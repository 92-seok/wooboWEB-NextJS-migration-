import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";

import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

//iconfont 인스턴스화 중에 옵션 추가
export default createVuetify({
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
});

const vuetify = createVuetify({
  components,
  directives,
});

createApp(App).use(router).use(vuetify).mount("#app");
