<template>
  <v-empty-state class="custom-empty-state" title="설치 파일 다운로드">

    <template v-slot:media>
      <v-img :src="require('@/assets/ci_woobosys_bar.png')" height="50"></v-img>
    </template>

    <v-row>
      <v-col cols="12" md="6">
        <v-card href="http://woobo.online/weathersi" prepend-icon="mdi-web" text="http://woobo.online"
          title="웹페이지"></v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card href="http://woobo.online/api/download" prepend-icon="mdi-android" target="_blank"
          text="com.woobo.online.apk" title="안드로이드"></v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card color="grey darken-1" disabled href="http://woobo.online/api/download"
          prepend-icon="mdi-microsoft-windows-classic" target="_blank" text="우보 온라인.exe" title="윈도우즈"></v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card color="grey darken-1" disabled href="http://woobo.online/api/download" prepend-icon="mdi-apple"
          target="_blank" text="com.woobo.online.ipa" title="아이폰"></v-card>
      </v-col>
    </v-row>

  </v-empty-state>
</template>

<script setup>

</script>

<style scoped></style>