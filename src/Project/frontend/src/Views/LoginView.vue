<template>
  <div class="login-stage">
    <v-card class="login-card mx-auto" elevation="12" rounded="xl">
      <!-- 헤더 섹션 -->
      <div class="header-section">
        <v-img class="logo-img mx-auto" src="/favicon.ico"></v-img>
        <h1 class="login-title">운영지원 시스템</h1>
        <p class="login-subtitle">로그인하여 시작하세요</p>
      </div>

      <!-- 카카오 로그인 -->
      <v-btn block color="#FEE500" variant="flat" size="large" @click="handleKakaoLogin" :disabled="loading"
        class="kakao-login-btn">
        <v-icon start color="#000000">mdi-comment</v-icon>
        <span class="kakao-text">카카오로 시작하기</span>
      </v-btn>

      <!-- 구분선 -->
      <v-expand-transition>
        <div v-show="formExpanded" class="divider-wrapper">
          <v-divider></v-divider>
          <span class="divider-text">또는</span>

          <v-divider></v-divider>
        </div>
      </v-expand-transition>

      <!-- 입력 폼 -->
      <v-expand-transition>
        <div v-show="formExpanded" class="form-section">
          <!-- 아이디 -->

          <div class="input-group">
            <label class="input-label">아이디</label>
            <v-text-field v-model="username" density="comfortable" placeholder="아이디를 입력해주세요"
              prepend-inner-icon="mdi-account-outline" variant="outlined" :error-messages="usernameError"
              @keyup.enter="handleLogin" :disabled="loading" hide-details="auto"></v-text-field>
          </div>


          <!-- 비밀번호 -->
          <div class="input-group">
            <label class="input-label">비밀번호</label>
            <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'" density="comfortable" placeholder="비밀번호를 입력해주세요"
              prepend-inner-icon="mdi-lock-outline" variant="outlined" @click:append-inner="visible = !visible"
              :error-messages="passwordError" @keyup.enter="handleLogin" :disabled="loading"
              hide-details="auto"></v-text-field>
          </div>

          <!-- 체크박스 -->
          <div class="checkbox-section">
            <v-checkbox v-model="saveId" label="아이디 저장" density="compact" hide-details :disabled="loading"></v-checkbox>
            <v-checkbox v-model="autoLogin" label="자동 로그인" density="compact" hide-details
              :disabled="loading"></v-checkbox>
          </div>

          <!-- 에러 메시지 -->
          <v-expand-transition>
            <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" closable
              @click:close="errorMessage = ''" class="error-alert">
              {{ errorMessage }}
            </v-alert>
          </v-expand-transition>

        </div>
      </v-expand-transition>

      <!-- 로그인 버튼 -->
      <v-btn block color="primary" variant="flat" size="x-large" @click="handleLoginClick" :loading="loading"
        :disabled="loading" class="login-btn">
        아이디로 로그인
      </v-btn>

      <!-- 안내 카드 -->
      <v-card class="info-card" variant="tonal" color="surface-variant">
        <v-card-text class="info-text">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          운영지원 시스템 로그인 페이지입니다.
        </v-card-text>
      </v-card>

      <!-- 회원가입 링크 -->
      <div class="signup-section">
        <span class="signup-text">계정이 없으신가요?</span>
        <v-btn variant="text" color="primary" size="small" @click="goToSignup" :disabled="loading" class="signup-btn">
          회원가입
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()

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

const formExpanded = ref(false);

const handleLoginClick = async () => {
  if (!formExpanded.value) {
    // 폼 접혀 있으면 펼치기
    formExpanded.value = true
  } else {
    // 폼이 펼쳐져 있으면 로그인 시도
    await handleLogin()
  }
}

onMounted(async () => {
  initKakaoSDK(import.meta.env.VITE_KAKAO_JS_KEY)
  loadSavedId()
  await handleAutoLogin()
})

const goToSignup = () => {
  router.push('/signup')
}
</script>

<style lang="scss" scoped>
.login-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 16px;
  position: relative;


  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: backgroundMove 20s linear infinite;
    pointer-events: none;
  }
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(50px, 50px);
  }
}

.login-card {
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 헤더 섹션 */
.header-section {
  text-align: center;
  margin-bottom: 28px;
}

.logo-img {
  width: 60px;
  height: 60px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  font-weight: 400;
  margin: 0;
}

/* 카카오 로그인 버튼 */
.kakao-login-btn {
  height: 50px;
  margin-bottom: 20px;
  color: #000000 !important;
  font-weight: 600;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(254, 229, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .kakao-text {
    font-size: 15px;
  }

  &:hover {
    background-color: #FDD835 !important;
    box-shadow: 0 6px 20px rgba(254, 229, 0, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 구분선 */
.divider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.divider-text {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  font-weight: 500;
}

/* 폼 섹션 */
.form-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 12px;
  }
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

/* 체크박스 */
.checkbox-section {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  :deep(.v-label) {
    font-size: 13px;
  }
}

/* 에러 메시지 */
.error-alert {
  margin-bottom: 12px;
  font-size: 13px;
}

/* 로그인 버튼 */
.login-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 안내 카드 */
.info-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.info-text {
  font-size: 12px;
  color: #666;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 회원가입 */
.signup-section {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.signup-text {
  font-size: 13px;
  color: #666;
}

.signup-btn {
  font-weight: 600;
  letter-spacing: -0.3px;
}

/* 태블릿 (600px~) */
@media (min-width: 600px) {
  .login-stage {
    padding: 20px;
  }

  .login-card {
    max-width: 480px;
    max-height: calc(100vh - 40px);
    padding: 36px 32px;
  }

  .header-section {
    margin-bottom: 32px;
  }

  .logo-img {
    width: 70px;
    height: 70px;
    margin-bottom: 16px;
  }

  .login-title {
    font-size: 26px;
  }

  .login-subtitle {
    font-size: 15px;
  }

  .kakao-login-btn {
    height: 54px;
    margin-bottom: 24px;

    .kakao-text {
      font-size: 16px;
    }
  }

  .divider-wrapper {
    margin-bottom: 24px;
  }

  .form-section {
    margin-bottom: 24px;
  }

  .input-group {
    margin-bottom: 18px;

    &:last-of-type {
      margin-bottom: 14px;
    }
  }

  .input-label {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .login-btn {
    height: 54px;
    font-size: 17px;
    margin-bottom: 20px;
  }

  .info-card {
    margin-bottom: 20px;
  }

  .info-text {
    padding: 12px 16px;
  }
}

/* 데스크탑 (960px~) */
@media (min-width: 960px) {
  .login-card {
    max-width: 520px;
    max-height: calc(100vh - 48px);
    padding: 40px 36px;
  }

  .header-section {
    margin-bottom: 36px;
  }

  .logo-img {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .login-title {
    font-size: 28px;
  }

  .login-subtitle {
    font-size: 16px;
  }

  .kakao-login-btn {
    height: 56px;
    margin-bottom: 28px;
  }

  .divider-wrapper {
    margin-bottom: 28px;
  }

  .form-section {
    margin-bottom: 28px;
  }

  .input-group {
    margin-bottom: 20px;

    &:last-of-type {
      margin-bottom: 16px;
    }
  }

  .login-btn {
    height: 56px;
    margin-bottom: 24px;
  }

  .info-card {
    margin-bottom: 24px;
  }
}

/* 대형 데스크탑 (1280px~) */
@media (min-width: 1280px) {
  .login-card {
    max-width: 560px;
    padding: 48px 40px;
  }

  .login-title {
    font-size: 30px;
  }
}

/* 입력 필드 스타일 커스터마이징 */
:deep(.v-field) {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

:deep(.v-field--focused) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

:deep(.v-text-field input::placeholder) {
  font-size: 13px;
  color: #999;
}
</style>