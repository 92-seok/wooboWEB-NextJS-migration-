<script>
export default {
  name: "App",
  data() {
    return {
      drawer: null,
    };
  },
};
</script>

<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" app>
      탭 안에 있을 UI
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Test Application</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-card class="mx-auto" max-width="344">
        <v-card-text>
          <div>오늘의 단어</div>
          <p class="display-1 text--primary">responsive web design</p>
          <div class="text--primary">
            화면의 크기가 자동으로 변하도록 만든 웹페이지 접근 기법을 말한다.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="deep-purple accent-4"> Learn More </v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>