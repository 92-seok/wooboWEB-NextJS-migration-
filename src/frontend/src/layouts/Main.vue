<template>
  <v-main>
    <v-container class="pa-0" fluid>
      <RouterView @vue:updated="SetThemeColor(router.currentRoute.value.fullPath)" />
    </v-container>
  </v-main>
</template>

<script setup>
////////////////////////////////////////
// Import
////////////////////////////////////////
import { onMounted, onUnmounted, inject, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();

////////////////////////////////////////
// 테마
////////////////////////////////////////
const { OnClick_theme_color } = inject('theme_color')


////////////////////////////////////////
// EVENT 생명주기
////////////////////////////////////////
onMounted(async () => {
});

onUnmounted(() => {
});

// function
function SetThemeColor(path) {
  var color;

  switch (path) {
    case '/': color = 'primary'
      break;
    case '/map': color = 'blue-grey'
      break;
    case '/weathersi': color = 'deep-purple'
      break;
    case '/weathersr': color = 'indigo'
      break;
    case '/error': color = 'deep-orange-accent-3'
      break;
    case '/setting': color = 'brown'
      break;
    case '/login': color = 'yellow'
      break;
    default: color = 'primary'
      break;
  }

  OnClick_theme_color(color);
}


</script>

<style lang="scss" scoped></style>