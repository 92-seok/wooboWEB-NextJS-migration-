<template>
  <v-app style="overflow-y: hidden;">
    <Header />
    <Main />
    <Footer />
  </v-app>
</template>

<script>
import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'
import { ref } from 'vue' // Vue3 실시간 상태감시

// Options Style
export default {
  name: 'App',
  components: {
    Header, Main, Footer
  },
  setup() {
    const count = ref(0) // vue3 실시간 상태감시
    return { count }
  },
  // Form 이벤트
  mounted() {
    console.log(`프로그램 시작! (${this.$title})`); // 전역변수 Vue2 Style
  },
}
</script>

<!--
  // Composition Style
  <script setup>
  // Layout
  import Header from './layouts/Header.vue'
  import Main from './layouts/Main.vue'
  import Footer from './layouts/Footer.vue'

  // 전역변수 사용
  import { onMounted, inject } from 'vue'

// Form 이벤트
  onMounted(() => {
    console.log(`프로그램 시작! (${inject('$title')})`); // 전역변수 Vue3 Style
  });
</script>
-->
