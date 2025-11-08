<template>
  <v-footer>
    <v-bottom-navigation v-model="menu_idx" :bg-color=theme_color density="comfortable">
      <v-btn @click="GoMenu('/map')">
        <v-icon>mdi-map</v-icon>
        <span class="text-subtitle-2">지도</span>
      </v-btn>

      <v-btn @click="GoMenu('/weathersi')">
        <v-icon>mdi-television-play</v-icon>
        <span class="text-subtitle-2">통합관측</span>
      </v-btn>

      <v-btn @click="GoMenu('/weathersr')">
        <v-icon>mdi-waves-arrow-up</v-icon>
        <span class="text-subtitle-2">소하천</span>
      </v-btn>

      <v-btn @click="GoMenu('/setting')">
        <v-icon>mdi-book</v-icon>
        <span class="text-subtitle-2">관리</span>
      </v-btn>

      <v-btn @click="GoMenu('/login')">
        <v-icon>mdi-account</v-icon>
        <span class="text-subtitle-2">로그인</span>
      </v-btn>
    </v-bottom-navigation>
  </v-footer>
</template>

<script setup>

// import
import { defineModel, defineEmits, inject , onMounted} from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['click:btnClick'])
const {theme_color, OnClick_theme_color} = inject('theme_color')

// reactive status
const menu_idx = defineModel()

// router
const router = useRouter();
////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {
  GoMenu(router.currentRoute.value.fullPath);
});

// function
function GoMenu(path) {
  let color;

  if (router.currentRoute.value.fullPath == path) {
    //return;
  }

  switch (path) {
    case '/map': color = 'blue-grey'
      break;
    case '/weathersi': color = 'deep-purple'
      break;
    case '/weathersr': color = 'indigo'
      break;
    case '/setting': color = 'brown'
      break;
    case '/login': color = 'yellow'
      break;
    default: color = 'primary'
      break;
  }
  
  OnClick_theme_color(color);
  router.push(path);
}

</script>

<style lang="scss" scoped>
  /* v-bottom-navigation 버튼 간격 */
  .v-bottom-navigation .v-bottom-navigation__content .v-btn {
    margin: 0px;
    padding: 0px;
    min-width: 60px;
  }
  
</style>