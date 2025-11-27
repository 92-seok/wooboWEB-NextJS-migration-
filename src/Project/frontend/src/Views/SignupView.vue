<template>
  <v-container class="signup-stage" fluid>
    <v-card class="signup-card mx-auto" elevation="8" rounded="lg">

      <!-- 아이콘, 제목 부분 -->
      <div class="d-flex align-center justify-center flex-column header-section">
        <v-img class="mx-auto logo-img" src="/favicon.ico"></v-img>
        <div class="signup-title font-weight-bold mt-2 text-center">운영지원 시스템 로그인</div>
      </div>

      <!-- 이름 입력 부분 -->
      <div class="field-label text-medium-emphasis">이름</div>
      <v-text-field v-model="name" density="compact" placeholder="이름을 입력해주세요." prepend-inner-icon="mdi-account-outline"
        variant="outlined" class="placeholder-small input-field" :error-messages="nameError"
        :disabled="loading"></v-text-field>

      <!-- 아이디 입력 부분 -->
      <div class="field-label text-medium-emphasis">아이디</div>
      <v-text-field v-model="username" density="compact" placeholder="아이디를 입력해주세요." prepend-inner-icon="mdi-account"
        variant="outlined" class="placeholder-small input-field" :error-messages="usernameError"
        :disabled="loading"></v-text-field>

      <!-- 비밀번호 입력 부분 -->
      <div class="field-label text-medium-emphasis">비밀번호</div>
      <v-text-field v-model="password" :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visiblePassword ? 'text' : 'password'" density="compact" placeholder="비밀번호를 입력해주세요.(최소 8자)"
        prepend-inner-icon="mdi-lock-outline" variant="outlined"
        @click:append-inner="visiblePassword = !visiblePassword" class="placeholder-small input-field"
        :error-messages="passwordError" :disabled="loading"></v-text-field>

      <!-- 비밀번호 확인 부분 -->
      <div class="field-label text-medium-emphasis">비밀번호 확인</div>
      <v-text-field v-model="passwordConfirm" :append-inner-icon="visiblePasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visiblePasswordConfirm ? 'text' : 'password'" density=" compact" placeholder="비밀번호를 다시 입력해주세요."
        prepend-inner-icon="mdi-lock-check-outline" variant="outlined"
        @click:append-inner="visiblePasswordConfirm = !visiblePasswordConfirm" class="placeholder-small input-field"
        :error-messages="passwordConfirmError" @keyup.enter="handleSignup" :disabled="loading"></v-text-field>

      <!-- 에러 메세지 표출 부분 -->
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="alert-message" closable
        @click:close="errorMessage = ''">
        {{ errorMessage }}</v-alert>

      <!-- 성공 메세지 표출 부분 -->
      <v-alert v-if="successMessage" type="success" variant="tonal" class="alert-message">
        {{ successMessage }}</v-alert>

      <!-- 안내 카드 부분 -->
      <v-card class="info-card" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis info-text" align="center">
          운영지원 시스템 회원가입 페이지입니다.
          <v-spacer></v-spacer>
          가입 후 로그인하여 이용하실 수 있습니다.
        </v-card-text>
      </v-card>

      <!-- 회원가입 버튼 -->
      <v-btn block color="primary" variant="elevated" @click="handleSignup" :loading="loading" :disabled="loading"
        class="signup-btn">
        회원가입
      </v-btn>

      <!-- 로그인 페이지 이동 부분 -->
      <div class="text-center login-link">
        <span class="login-text text-medium-emphasis">이미 계정이 있으신가요?</span>
        <v-btn variant="text" color="primary" size="small" @click="goToLogin" :disabled="loading">로그인</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter()

// 폼 데이터 만들기
const name = ref('');
const username = ref('');
// const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const visiblePassword = ref(false);
const visiblePasswordConfirm = ref(false);
const loading = ref(false);

// 에러 메시지 만들기
const nameError = ref('');
const usernameError = ref('');
// const emailError = ref('');
const passwordError = ref('');
const passwordConfirmError = ref('');
const errorMessage = ref('');
const successMessage = ref('');

// 유효성 검사하기
const validateForm = () => {
  let isValid = true;

  // 초기화
  nameError.value = '';
  usernameError.value = '';
  passwordError.value = '';
  passwordConfirmError.value = '';
  errorMessage.value = '';
  successMessage.value = '';

  // 이름 검증하기
  if (!name.value) {
    nameError.value = '아이디를 입력해주세요.';
    isValid = false;
  } else if (name.value.length < 2) {
    nameError.value = '이름은 최소 2자 이상이어야 합니다.';
    isValid = false;
  }

  // 아이디 검증하기
  if (!username.value) {
    usernameError.value = '아이디를 입력하세요.';
    isValid = false;
  } else if (username.value.length < 2) {
    usernameError.value = '아이디는 최소 2자 이상이어야 합니다.'
    isValid = false;
  }

  // 이메일 검증하기
  // if (!email.value) {
  //   emailError.value = '이메일을 입력해주세요.';
  //   isValid = false;
  // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
  //   emailError.value = '올바른 이메일 형식이 아닙니다.';
  //   isValid = false;
  // }

  // 비밀번호 검증하기
  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.';
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.value = '비밀번호는 최소 6자 이상이어야 합니다.';
    isValid = false;
  }

  // 비밀번호 확인 검증하기
  if (!passwordConfirm.value) {
    passwordConfirmError.value = '비밀번호 확인을 입력해주세요.';
    isValid = false;
  } else if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = '비밀번호가 일치하지 않습니다.';
    isValid = false;
  }

  return isValid;
}

// 회원가입 처리하기
const handleSignup = async () => {
  // 유효성 검사하기
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post('/api/auth/signup', {
      name: name.value,
      // email: email.value,
      username: username.value,
      password: password.value,
    });

    // console.log('회원가입 성공!', response.data);

    // 성공 메세지 표시하기
    successMessage.value = '회원가입이 완료 되었습니다! 로그인 페이지로 이동합니다.'

    // 데이터 폼 초기화하기
    name.value = '';
    // email.value = '';
    username.value = '';
    password.value = '';
    passwordConfirm.value = '';
    visiblePassword.value = false;
    visiblePasswordConfirm.value = false;

    // 1.5초 후에 로그인 페이지로 이동하기
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    console.error('회원가입 실패: ', error);

    // 에러 처리 로직
    console.log('error signup response')
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
          errorMessage.value = message || '유효하지 않은 입력값 입니다..';
          break;
        case 500:
          errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage.value = message || '회원가입에 실패했습니다.';
      }
    } else if (error.request) {
      errorMessage.value = '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.'
    } else {
      errorMessage.value = '회원가입 요청 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false;
  }
}

// 로그인 페이지로 이동하기
const goToLogin = () => {
  router.push('/login');
}

</script>
<style lang="scss" scoped>
.signup-stage {
  min-height: calc(100vh - 80px - 64px);
  display: grid;
  place-items: center;
  padding: 12px;
}

/* 모바일 스타일 (기본: ~600px) */
.signup-card {
  width: 100%;
  max-width: 100%;
  padding: 16px;
}

.header-section {
  margin-bottom: 20px;
}

.logo-img {
  width: 50px;
  height: 50px;
}

.signup-title {
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
  margin-bottom: 20px;
}

.info-text {
  font-size: 11px;
  padding: 12px;
}

.signup-btn {
  font-size: 15px;
  height: 44px;
  margin-bottom: 12px;
}

.login-link {
  margin-top: 8px;
}

.login-text {
  font-size: 12px;
}

:deep(.placeholder-small input::placeholder) {
  font-size: 12px;
}

/* 태블릿 스타일 (600px ~ 960px) */
@media (min-width: 600px) {
  .signup-stage {
    padding: 20px;
  }

  .signup-card {
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

  .signup-title {
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

  .signup-btn {
    font-size: 16px;
    height: 48px;
    margin-bottom: 16px;
  }

  .login-link {
    margin-top: 12px;
  }

  .login-text {
    font-size: 13px;
  }

  :deep(.placeholder-small input::placeholder) {
    font-size: 13px;
  }
}

/* 노트북/데스크탑 스타일 (960px 이상) */
@media (min-width: 960px) {
  .signup-stage {
    padding: 24px;
  }

  .signup-card {
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

  .signup-title {
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

  .signup-btn {
    font-size: 17px;
    height: 52px;
    margin-bottom: 16px;
  }

  .login-link {
    margin-top: 16px;
  }

  .login-text {
    font-size: 14px;
  }

  :deep(.placeholder-small input::placeholder) {
    font-size: 13px;
  }
}

/* 대형 데스크탑 (1280px 이상) */
@media (min-width: 1280px) {
  .signup-card {
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

  .signup-title {
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

  .signup-btn {
    height: 56px;
    font-size: 18px;
  }
}
</style>