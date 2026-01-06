<template>
  <v-container class="login-stage" fluid>
    <v-card class="login-card mx-auto" elevation="8" rounded="lg">
      <div class="d-flex align-center justify-center flex-column header-section">
        <v-img class="mx-auto logo-img" src="/favicon.ico"></v-img>
        <div class="login-title font-weight-bold mt-2 text-center">운영지원 시스템 로그인</div>
      </div>


      <!-- 카카오 로그인 -->
      <v-btn block color="#FEE500" variant="elevated" @click="handleKakaoLogin" :disabled="loading"
        class="kakao-login-btn mb-4" prepend-icon="mdi-comment">
        <template v-slot:prepend>
          <v-icon color="#000000">mdi-comment</v-icon>
        </template>
        <span class="kakao-text">카카오 계정으로 로그인</span>
      </v-btn>

      <!-- 버튼 구분하기 -->
      <v-divider class="mr-4">
        <span class="text-medium-emphasis px-2">또는</span>
      </v-divider>

      <!-- 아이디 입력부분 -->
      <div class="field-label text-medium-emphasis">
        아이디
      </div>
      <v-text-field v-model="username" density="compact" placeholder="아이디를 입력해주세요"
        prepend-inner-icon="mdi-account-outline" variant="outlined" class="placeholder-small input-field ma-0"
        :error-messages="usernameError" @keyup.enter="handleLogin" :disabled="loading"></v-text-field>

      <!-- password 입력부분 -->
      <div class="field-label text-medium-emphasis d-flex align-center justify-space-between">
        비밀번호
      </div>
      <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'" density="compact" placeholder="비밀번호를 입력해주세요."
        prepend-inner-icon="mdi-lock-outline" variant="outlined" @click:append-inner="visible = !visible"
        class="placeholder-small input-field ma-0" :error-messages="passwordError" @keyup.enter="handleLogin"
        :disabled="loading"></v-text-field>

      <!-- 체크박스 영역 추가하기 -->
      <div class="checkbox-wrapper ma-0">
        <v-checkbox v-model="saveId" label="아이디 저장" density="compact" hide-details :disabled="loading"
          class="mr-4"></v-checkbox>
        <v-checkbox v-model="autoLogin" label="자동 로그인" density="compact" hide-details :disabled="loading"></v-checkbox>
      </div>

      <!-- error message 표시 -->
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="alert-message" closable
        @click:close="errorMessage = ''">
        {{ errorMessage }}
      </v-alert>

      <!-- 안내 카드 -->
      <v-card class="info-card" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis info-text" align="center">
          운영지원 시스템 로그인 페이지입니다.
          <v-spacer></v-spacer>
          로그인 후 이용하실 수 있습니다.
        </v-card-text>
      </v-card>

      <!-- 로그인 버튼 -->
      <v-btn block color="primary" variant="elevated" @click="handleLogin" :loading="loading" :disabled="loading"
        class="login-btn">로그인</v-btn>


      <!-- 회원가입 페이지 이동 버튼 -->
      <div class="text-center signup-link">
        <span class="signup-text text-medium-emphasis">계정이 없으신가요?</span>
        <v-btn class="text-base" variant="text" color="primary" size="small" @click="goToSignup" :disabled="loading">
          회원가입
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()

// useAuth composable 사용
const {
  username,
  password,
  visible,
  loading,
  saveId,
  autoLogin,
  errorMessage,
  usernameError,
  passwordError,
  handleAutoLogin,
  loadSavedId,
  handleKakaoLogin,
  handleLogin,
  initKakaoSDK
} = useAuth()

// 페이지 로드 시 처리
onMounted(async () => {
  // 카카오 SDK 초기화
  initKakaoSDK(import.meta.env.VITE_KAKAO_JS_KEY)

  // 아이디 저장 확인
  loadSavedId()

  // 자동 로그인 확인
  await handleAutoLogin()
})

// 회원가입 페이지로 이동
const goToSignup = () => {
  router.push('/signup')
}
</script>

<style lang="scss" scoped>
.login-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // 헤더 80px, 푸터 64px 제외하기
  // min-height: calc(100vh - 80px - 64px);
  // display: grid;
  // place-items: center;
  padding: 12px;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 모바일 스타일 (기본: ~600px) */
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 16px;
}

.header-section {
  margin-bottom: 20px;
}

.logo-img {
  width: 50px;
  height: 50px;
}

.login-title {
  font-size: 18px;
  line-height: 1.3;
}

.field-label {
  font-size: 13px;
  margin-bottom: 4px;
}

.input-field {
  margin-bottom: 12px;
}

.alert-message {
  margin-bottom: 16px;
  font-size: 13px;
}

.info-card {
  margin: 10px 0 10px 0;
}

.info-text {
  font-size: 11px;
  padding: 12px;
}

.login-btn {
  font-size: 15px;
  height: 44px;
  margin-bottom: 12px;
}

.signup-link {
  margin-top: 8px;
}

.signup-text {
  font-size: 12px;
}

.checkbox-wrapper {
  display: flex;
  flex-direction: row;
  gap: 0px;
}

:deep(.placeholder-small input::placeholder) {
  font-size: 12px;
}

.kakao-login-btn {
  min-height: 44px;
  color: #000000 !important;
  text-transform: none;
  letter-spacing: -0.5px;
  padding: 12px 16px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .kakao-text {
    font-size: 15px;
  }

  &:hover {
    background-color: #FDD835 !important;
    box-shadow: 0 4px 16px rgba(254, 229, 0, 0.5);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  transition: all 0.2s ease-in-out;
}

/* 태블릿 스타일 (600px ~ 960px) */
@media (min-width: 600px) {
  .login-stage {
    padding: 20px;
  }

  .login-card {
    max-width: 500px;
    padding: 32px;
  }

  .header-section {
    margin-bottom: 28px;
  }

  .logo-img {
    width: 60px;
    height: 60px;
  }

  .login-title {
    font-size: 22px;
  }

  .field-label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .input-field {
    margin-bottom: 16px;
  }

  .alert-message {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .info-card {
    margin-bottom: 28px;
  }

  .info-text {
    font-size: 12px;
    padding: 16px;
  }

  .login-btn {
    font-size: 17px;
    height: 52px;
    margin-bottom: 16px;
  }

  .kakao-login-btn {
    min-height: 52px;

    .kakao-text {
      font-size: 17px;
    }
  }

  .signup-link {
    margin-top: 12px;
  }

  .signup-text {
    font-size: 13px;
  }

  :deep(.placeholder-small input::placeholder) {
    font-size: 13px;
  }
}

/* 노트북/데스크탑 스타일 (960px 이상) */
@media (min-width: 960px) {
  .login-stage {
    padding: 24px;
  }

  .login-card {
    max-width: 550px;
    padding: 48px;
  }

  .header-section {
    margin-bottom: 32px;
  }

  .logo-img {
    width: 70px;
    height: 70px;
  }

  .login-title {
    font-size: 24px;
  }

  .field-label {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .input-field {
    margin-bottom: 20px;
  }

  .alert-message {
    margin-bottom: 24px;
    font-size: 14px;
  }

  .info-card {
    margin-bottom: 32px;
  }

  .info-text {
    font-size: 13px;
    padding: 16px 20px;
  }

  .login-btn {
    font-size: 17px;
    height: 52px;
    margin-bottom: 16px;
  }

  .signup-link {
    margin-top: 16px;
  }

  .signup-text {
    font-size: 14px;
  }

  :deep(.placeholder-small input::placeholder) {
    font-size: 13px;
  }
}

/* 대형 데스크탑 (1280px 이상) */
@media (min-width: 1280px) {
  .login-card {
    max-width: 600px;
    padding: 56px;
  }

  .header-section {
    margin-bottom: 36px;
  }

  .logo-img {
    width: 80px;
    height: 80px;
  }

  .login-title {
    font-size: 26px;
  }

  .field-label {
    font-size: 16px;
  }

  .input-field {
    margin-bottom: 24px;
  }

  .info-card {
    margin-bottom: 36px;
  }

  .login-btn {
    height: 56px;
    font-size: 18px;
  }

  .kakao-login-btn {
    min-height: 56px;

    .kakao-text {
      font-size: 18px;
    }
  }
}
</style>