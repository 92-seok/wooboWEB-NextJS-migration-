import { createApp } from "vue";
import App from "./App.vue";

// vue-router
import router from "@/router/index.js";

// Vuetify
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
});

createApp(App).use(router).use(vuetify).mount("#app");
