<template>
  <div class="signup-stage">
    <v-card class="signup-card mx-auto" elevation="12" rounded="xl">
      <!-- 헤더 섹션 -->
      <div class="header-section">
        <v-img class="logo-img mx-auto" src="/favicon.ico"></v-img>
        <h1 class="signup-title">운영지원 시스템</h1>
        <p class="signup-subtitle">새 계정을 만들어보세요</p>
      </div>

      <!-- 입력 폼 -->
      <div class="form-section">
        <!-- 이름 -->
        <div class="input-group">
          <label class="input-label">이름</label>
          <v-text-field v-model="name" density="comfortable" placeholder="이름을 입력해주세요"
            prepend-inner-icon="mdi-account-outline" variant="outlined" :error-messages="nameError" :disabled="loading"
            hide-details="auto"></v-text-field>
        </div>

        <!-- 아이디 -->
        <div class="input-group">
          <label class="input-label">아이디</label>
          <v-text-field v-model="username" density="comfortable" placeholder="아이디를 입력해주세요"
            prepend-inner-icon="mdi-account" variant="outlined" :error-messages="usernameError" :disabled="loading"
            hide-details="auto"></v-text-field>
        </div>

        <!-- 비밀번호 -->
        <div class="input-group">
          <label class="input-label">비밀번호</label>
          <v-text-field v-model="password" :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visiblePassword ? 'text' : 'password'" density="comfortable" placeholder="비밀번호를 입력해주세요 (최소 8자)"
            prepend-inner-icon="mdi-lock-outline" variant="outlined"
            @click:append-inner="visiblePassword = !visiblePassword" :error-messages="passwordError" :disabled="loading"
            hide-details="auto"></v-text-field>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="input-group">
          <label class="input-label">비밀번호 확인</label>
          <v-text-field v-model="passwordConfirm"
            :append-inner-icon="visiblePasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visiblePasswordConfirm ? 'text' : 'password'" density="comfortable" placeholder="비밀번호를 다시 입력해주세요"
            prepend-inner-icon="mdi-lock-check-outline" variant="outlined"
            @click:append-inner="visiblePasswordConfirm = !visiblePasswordConfirm"
            :error-messages="passwordConfirmError" @keyup.enter="handleSignup" :disabled="loading"
            hide-details="auto"></v-text-field>
        </div>

        <!-- 에러 메시지 -->
        <v-expand-transition>
          <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" closable
            @click:close="errorMessage = ''" class="alert-message">
            {{ errorMessage }}
          </v-alert>
        </v-expand-transition>

        <!-- 성공 메시지 -->
        <v-expand-transition>
          <v-alert v-if="successMessage" type="success" variant="tonal" density="compact" class="alert-message">
            {{ successMessage }}
          </v-alert>
        </v-expand-transition>
      </div>

      <!-- 회원가입 버튼 -->
      <v-btn block color="primary" variant="flat" size="x-large" @click="handleSignup" :loading="loading"
        :disabled="loading" class="signup-btn">
        회원가입
      </v-btn>

      <!-- 안내 카드 -->
      <v-card class="info-card" variant="tonal" color="surface-variant">
        <v-card-text class="info-text">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          가입 후 로그인하여 이용하실 수 있습니다.
        </v-card-text>
      </v-card>

      <!-- 로그인 링크 -->
      <div class="login-section">
        <span class="login-text">이미 계정이 있으신가요?</span>
        <v-btn variant="text" color="primary" size="small" @click="goToLogin" :disabled="loading" class="login-btn">
          로그인
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '@/api/auth.api';
import { isValidUsername, isValidPassword } from '@/utils/validators';

const router = useRouter()

// 폼 데이터
const name = ref('');
const username = ref('');
const password = ref('');
const passwordConfirm = ref('');
const visiblePassword = ref(false);
const visiblePasswordConfirm = ref(false);
const loading = ref(false);

// 에러 메시지
const nameError = ref('');
const usernameError = ref('');
const passwordError = ref('');
const passwordConfirmError = ref('');
const errorMessage = ref('');
const successMessage = ref('');

// 유효성 검사
const validateForm = () => {
  let isValid = true;

  // 초기화
  nameError.value = '';
  usernameError.value = '';
  passwordError.value = '';
  passwordConfirmError.value = '';
  errorMessage.value = '';
  successMessage.value = '';

  // 이름 검증
  if (!name.value) {
    nameError.value = '이름을 입력해주세요.';
    isValid = false;
  } else if (!isValidUsername(username.value)) {
    nameError.value = '이름은 최소 2자 이상이어야 합니다.';
    isValid = false;
  }

  // 아이디 검증
  if (!username.value) {
    usernameError.value = '아이디를 입력하세요.';
    isValid = false;
  } else if (username.value.length < 2) {
    usernameError.value = '아이디는 최소 2자 이상이어야 합니다.'
    isValid = false;
  }

  // 비밀번호 검증
  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.';
    isValid = false;
  } else if (!isValidPassword(password.value)) {
    passwordError.value = '비밀번호는 최소 4자 이상이어야 합니다.';
    isValid = false;
  }

  // 비밀번호 확인 검증
  if (!passwordConfirm.value) {
    passwordConfirmError.value = '비밀번호 확인을 입력해주세요.';
    isValid = false;
  } else if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = '비밀번호가 일치하지 않습니다.';
    isValid = false;
  }

  return isValid;
}

// 회원가입 처리
const handleSignup = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const response = await signup({
      name: name.value,
      username: username.value,
      password: password.value,
    });

    // 성공 메시지 표시
    successMessage.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'

    // 폼 초기화
    name.value = '';
    username.value = '';
    password.value = '';
    passwordConfirm.value = '';
    visiblePassword.value = false;
    visiblePasswordConfirm.value = false;

    // 1초 후 로그인 페이지로 이동
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  } catch (error) {
    console.error('회원가입 실패: ', error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          errorMessage.value = message || '입력 정보를 확인해주세요.';
          break;
        case 409:
          errorMessage.value = '이미 가입된 아이디입니다.';
          usernameError.value = '이미 가입된 아이디입니다.';
          break;
        case 422:
          errorMessage.value = message || '유효하지 않은 입력값입니다.';
          break;
        case 500:
          errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage.value = message || '회원가입에 실패했습니다.';
      }
    } else if (error.request) {
      errorMessage.value = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
    } else {
      errorMessage.value = '회원가입 요청 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false;
  }
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.signup-stage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;

  // Safe Area 고려한 padding
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));

  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;

  // Vuetify 레이아웃 CSS 변수 무효화
  --v-layout-top: 0px !important;
  --v-layout-bottom: 0px !important;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 1px, transparent 1px);
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

.signup-card {
  width: 100%;
  max-width: 440px;

  // Safe Area를 고려한 max-height
  max-height: calc(100dvh - max(32px, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 32px));

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

.signup-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.signup-subtitle {
  font-size: 14px;
  color: #666;
  font-weight: 400;
  margin: 0;
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

/* 알림 메시지 */
.alert-message {
  margin-bottom: 12px;
  font-size: 13px;
}

/* 회원가입 버튼 */
.signup-btn {
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

/* 로그인 링크 */
.login-section {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.login-text {
  font-size: 13px;
  color: #666;
}

.login-btn {
  font-weight: 600;
  letter-spacing: -0.3px;
}

/* 태블릿 (600px~) */
@media (min-width: 600px) {
  .signup-stage {
    padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
  }

  .signup-card {
    max-width: 480px;
    max-height: calc(100dvh - max(40px, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 40px));
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

  .signup-title {
    font-size: 26px;
  }

  .signup-subtitle {
    font-size: 15px;
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

  .signup-btn {
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
  .signup-stage {
    padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
  }

  .signup-card {
    max-width: 520px;
    max-height: calc(100dvh - max(48px, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 48px));
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

  .signup-title {
    font-size: 28px;
  }

  .signup-subtitle {
    font-size: 16px;
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

  .signup-btn {
    height: 56px;
    margin-bottom: 24px;
  }

  .info-card {
    margin-bottom: 24px;
  }
}

/* 대형 데스크탑 (1280px~) */
@media (min-width: 1280px) {
  .signup-card {
    max-width: 560px;
    padding: 48px 40px;
  }

  .signup-title {
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