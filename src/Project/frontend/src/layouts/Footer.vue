<template>
  <v-footer>
    <v-bottom-navigation v-model="menu_idx" :bg-color="color" density="compact">
      <v-btn @click="GoMenu('/map')">
        <v-icon>mdi-map</v-icon>
        <span>지도</span>
      </v-btn>

      <v-btn @click="GoMenu('/monitor')">
        <v-icon>mdi-television-play</v-icon>
        <span>모니터링</span>
      </v-btn>

      <v-btn @click="GoMenu('/control')">
        <v-icon>mdi-tools</v-icon>
        <span>제어</span>
      </v-btn>

      <v-btn @click="GoMenu('/setting')">
        <v-icon>mdi-book</v-icon>
        <span>관리</span>
      </v-btn>

      <v-btn @click="GoMenu('/login')">
        <v-icon>mdi-account</v-icon>
        <span>로그인</span>
      </v-btn>
    </v-bottom-navigation>
  </v-footer>
</template>

<script setup>

// import
import { ref, defineModel } from 'vue'
import { useRouter } from 'vue-router'

// reactive status
const menu_idx = defineModel()
const color = ref('primary');

// router
const router = useRouter();

// function
function GoMenu(path) {

  if (router.currentRoute.value.fullPath == path) {
    return;
  }

  switch (menu_idx.value) {
    case 0: color.value = 'blue-grey'
      break;
    case 1: color.value = 'teal'
      break;
    case 2: color.value = 'indigo'
      break;
    case 3: color.value = 'brown'
      break;
    case 4: color.value = 'yellow'
      break;
    default: color.value = 'primary'
      break;
  }

  router.push(path);
}

</script>

<style lang="scss" scoped>

/* v-bottom-navigation 버튼 간격 */
.v-bottom-navigation .v-bottom-navigation__content .v-btn{
    margin: 0px;
    padding: 0px;
    min-width: 70px;
}

</style>