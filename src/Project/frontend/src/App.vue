<template>
  <v-app style='background-color :pink'>
    <v-main>
      <button @click="this.$router.push('control')" />
      <Header />
      <Main />
      <Footer />
    </v-main>
  </v-app>
</template>

<script>

import Header from './layouts/Header.vue'
import Main from './layouts/Main.vue'
import Footer from './layouts/Footer.vue'

export default {
  name: 'App',
  components: {
    Header, Main, Footer
  },
  methods: {
    go(path) {
      this.$router.push(path);
    },
  },
  created() {
    console.log(`프로그램 시작! (${this.$title})`);
  },

}
</script>
