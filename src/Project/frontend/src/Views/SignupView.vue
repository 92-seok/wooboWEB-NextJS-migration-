<template>
  <v-container class="signup-stage pa-0" fluid>
    <v-card class="mx-auto pa-12 pb-8" elevation="8" min-width="550" rounded="lg">

      <!-- 아이콘, 제목 부분 -->
      <div class="d-flex align-center justify-center flex-column mb-6">
        <v-icon color="primary" size="80" class="mb-3">
          mdi-account-plus-outline
        </v-icon>
        <div class="text-h5 font-weight-bold">회원가입</div>
      </div>

      <!-- 이름 입력 부분 -->
      <div class="text-subtitle-1 text-medium-emphasis">이름</div>
      <v-text-field v-model="name" density="compact" placeholder="이름을 입력해주세요." prepend-inner-icon="mdi-account-outline"
        variant="outlined" class="placeholder-small" :error-messages="nameError" :disalbed="loading"></v-text-field>

      <!-- 이메일 입력 부분 -->
      <div class="text-subtitle-1 text-medium-emphasis">이메일</div>
      <v-text-field v-model="email" density="compact" placeholder="이메일을 입력해주세요." prepend-inner-icon="mdi-email-outline"
        variant="outlined" class="placeholder-small" type="email" :error-messages="emailError"
        :disalbed="loading"></v-text-field>

      <!-- 비밀번호 입력 부분 -->
      <div class="text-subtitle-1 text-medium-emphasis">비밀번호</div>
      <v-text-field v-model="password" :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visiblePassword ? 'text' : 'password'" density="compact" placeholder="비밀번호를 입력해주세요.(최소 8자)"
        prepend-inner-icon="mdi-lock-outline" variant="outlined"
        @click:append-inner="visiblePassword = !visiblePassword" class="placeholder-small"
        :error-messages="passwordError" :disabled="loading"></v-text-field>

      <!-- 비밀번호 확인 부분 -->
      <div class="text-subtitle-1 text-medium-emphasis">비밀번호 확인</div>
      <v-text-field v-model="passwordConfirm" :append-inner-icon="visiblePassConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visiblePassConfirm ? 'text' : 'password'" density="compact" placeholder="비밀번호를 다시 입력해주세요."
        prepend-inner-icon="mdi-lock-check-outline" variant="outlined"
        @click:append-inner="visiblePassConfirm = !visiblePassConfirm" class="placeholder-small"
        :error-messages="visiblePassConfirm" @keyup.enter="handleSignup" :disabled="loading"></v-text-field>

      <!-- 에러 메세지 표출 부분 -->
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
        {{ errorMesaage }}</v-alert>

      <!-- 성공 메세지 표출 부분 -->
      <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
        {{ successMessage }}</v-alert>

      <!-- 안내 카드 부분 -->
      <v-card class="mb-6" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption" align="center">
          운영지원 시스템 회원가입 페이지입니다.
          <v-spacer></v-spacer>
          가입 후 로그인하여 이용하실 수 있습니다.
        </v-card-text>
      </v-card>

      <!-- 회원가입 버튼 -->
      <v-btn block color="primary" size="large" variant="elevated" @click="handleSignup" :loading="loading"
        :disabled="loading" class="mb-3">
        회원가입
      </v-btn>

      <!-- 로그인 페이지 이동 부분 -->
      <div class="text-center">
        <span class="text-caption text-medium-emphasis">이미 계정이 있으신가요?</span>
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
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const visiblePassword = ref(false);
const visiblePasswordConfirm = ref(false);
const loading = ref(false);

// 에러 메시지 만들기
const nameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const passwordConfirmError = ref('');
const errorMessage = ref('');
const successMessage = ref('');

// 유효성 검사하기
const validateForm = () => {
  let isValid = true;

  // 초기화
  nameError.value = '';
  emailError.value = '';
  passwordError.value = '';
  passwordConfirmError.value = '';
  errorMessage.value = '';
  successMessage.value = '';

  // 이름 검증하기
  if (!name.value) {
    nameError.value = '이름을 입력해주세요.';
    isValid = false;
  } else if (name.value.length < 2) {
    nameError.value = '이름은 최소 2자 이상이어야 합니다.';
    isValid = false;
  }

  // 이메일 검증하기
  if (!email.value) {
    emailError.value = '이메일을 입력해주세요.';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '올바른 이메일 형식이 아닙니다.';
    isValid = false;
  }

  // 비밀번호 검증하기
  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.';
    isValid = false;
  } else if (password.value.length < 8) {
    passwordError.value = '비밀번호는 최소 8자 이상이어야 합니다.';
    isValid = false;
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    passwordError.value = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
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
      email: email.value,
      password: password.value,
    });

    console.log('회원가입 성공!', response.data);

    // 성공 메세지 표시하기
    successMessage.value = '회원가입이 완료 되었습니다! 로그인 페이지로 이동합니다.'

    // 데이터 폼 초기화하기
    name.value = '';
    email.value = '';
    password.value = '';
    passwordConfirm.value = '';
    visiblePassword.value = false;
    visiblePasswordConfirm.value = false;

    // 2초 후에 로그인 페이지로 이동하기
    setTimeout(() => {
      router.push('/login');
    }, 2000);
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
          errorMessage.value = '이미 가입된 이메일입니다.';
          emailError.value = '이미 가입된 이메일입니다.';
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
  router.push('login');
}

</script>
<style lang="scss" scoped>
.signup-stage {
  min-height: calc(100dvh - 80px - 64px);
  display: grid;
  place-items: center;
}

:deep(.placeholder-small input::placeholder) {
  font-size: 13px;
}
</style>