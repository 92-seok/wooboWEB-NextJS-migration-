<template>
  <v-row class="mt-auto">
    <v-col>
      <div class="login-wrapper">
        <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="340" rounded="lg" justify="center">
          <div class="text-subtitle-1 text-medium-emphasis">아이디</div>

          <v-text-field density="compact" placeholder="아이디를 입력해주세요" prepend-inner-icon="mdi-email-outline"
            variant="outlined"></v-text-field>

          <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
            비밀번호
          </div>

          <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
            density="compact" placeholder="비밀번호를 입력해주세요" prepend-inner-icon="mdi-lock-outline" variant="outlined"
            @click:append-inner="visible = !visible"></v-text-field>

          <v-card class="mb-12" color="surface-variant" variant="tonal">
            <v-card-text class="text-medium-emphasis text-caption" align="center">
              운영지원 시스템 로그인 페이지 입니다.
              <v-spacer></v-spacer>
              로그인 후 이용하실 수 있습니다.
            </v-card-text>
          </v-card>
          <v-card-actions class="justify-center">
            <v-btn class="mb-8 pa-0" size="large" variant="tonal">
              <v-img width="auto" :src="require('@/assets/kakao_login.png')" alt="카카오 로그인" cover></v-img>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>
<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
<style scoped></style>