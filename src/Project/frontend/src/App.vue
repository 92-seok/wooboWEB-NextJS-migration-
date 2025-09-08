<template>
  <v-app style='background-color :pink'>
    <v-main>
      <Header />
      <Main />
      <Footer />
    </v-main>
  </v-app>
</template>

<!--
  <script>
  
  import Header from './layouts/Header.vue'
  import Main from './layouts/Main.vue'
  import Footer from './layouts/Footer.vue'
  
  export default {
    name: 'App',
    components: {
      Header, Main, Footer
    },
    created() {
      console.log(`프로그램 시작! (${this.$title})`);
    },
  }
</script>
-->

<script setup>
import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'

onMounted(() => {
  console.log(`프로그램 시작! (${this.$title})`);
});
</script>
