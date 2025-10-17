<template>
  <v-container class="login-stage pa-0" fluid>
    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="340" rounded="lg">
      <div class="text-subtitle-1 text-medium-emphasis">아이디</div>

      <v-text-field density="compact" placeholder="아이디를 입력해주세요" prepend-inner-icon="mdi-email-outline"
        variant="outlined" class="placeholder-small"></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        비밀번호
      </div>

      <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
        density="compact" placeholder="비밀번호를 입력해주세요" prepend-inner-icon="mdi-lock-outline" variant="outlined"
        @click:append-inner="visible = !visible" class="placeholder-small"></v-text-field>

      <v-card class="mb-12" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption" align="center">
          운영지원 시스템 로그인 페이지 입니다.
          <v-spacer></v-spacer>
          로그인 후 이용하실 수 있습니다.
        </v-card-text>
      </v-card>
      <v-card-actions class="justify-center">
        <v-btn class="mb-8 pa-0" size="large" variant="tonal" @click="loginWithKakao">
          <v-img width="auto" :src="require('@/assets/kakao_login.png')" alt="카카오 로그인" cover></v-img>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)

// 카카오 로그인

// ✅ 컴포넌트가 마운트될 때 SDK 초기화 실행
onMounted(() => {
  console.log('mounted()')
  const script = document.createElement("script");
  script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js";
  script.onload = async () => {
    console.log('load')
    kakaoInit()
    console.log('loaded')
  }
  document.head.appendChild(script);
})

// ✅ Kakao SDK 초기화 함수
const kakaoInit = () => {
  Kakao.init('a21fca6df45467b72c4cff24ec14cb6b') // 실제 카카오 JavaScript 키 입력
  console.log('Kakao initialized:', Kakao.isInitialized())
}

// ✅ 카카오 로그인 함수
const loginWithKakao = async () => {
  await Kakao.Auth.authorize({
    redirectUri: `${window.location.origin}`
  })
}

</script>

<style scoped>
.login-stage {
  /* 헤더 56px, 푸터 64px 가정 — 프로젝트 값에 맞게 바꾸세요 */
  min-height: calc(100dvh - 80px - 64px);
  display: grid;
  place-items: center;
  /* 가로+세로 가운데 */
}

:deep(.placeholder-small input::placeholder) {
  font-size: 13px;
}
</style>