<template>
  <v-container class="login-stage pa-0" fluid>
    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="400" rounded="lg">
      <div class="d-flex align-center justify-center flex-column mb-6">
        <v-icon color="primary" size="100">mdi-weather-partly-cloudy</v-icon>
        <div class="text-h5 mb-6 font-weight-bold">로그인</div>
      </div>
      <!-- email 입력부분 -->
      <div class="text-subtitle-1 text-medium-emphasis">
        이메일
      </div>
      <v-text-field v-model="email" density="compact" placeholder="이메일을 입력해주세요" prepend-inner-icon="mdi-email-outline"
        variant="outlined" class="placeholder-small" type="email" :error-messages="emailError"
        @keyup.enter="handleLogin" :disabled="loading"></v-text-field>

      <!-- password 입력부분 -->
      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        비밀번호
      </div>
      <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'" density="compact" placeholder="비밀번호를 입력해주세요."
        prepend-inner-icon="mdi-lock-outline" variant="outlined" @click:append-inner="visible = !visible"
        class="placeholder-small" :error-messages="passwordError" @keyup.enter="handleLogin"
        :disabled="loading"></v-text-field>

      <!-- error message 표시 -->
      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
        {{ errorMessage }}
      </v-alert>

      <!-- 안내 카드 -->
      <v-card class="mb-6" color="surface-variant" variant="tonal">
        <v-card-text class="text-medium-emphasis text-caption" align="center">
          운영지원 시스템 로그인 페이지입니다.
          <v-spacer></v-spacer>
          로그인 후 이용하실 수 있습니다.
        </v-card-text>
      </v-card>

      <!-- 로그인 버튼 -->
      <v-btn block color="primary" size="large" variant="elevated" @click="handleLogin" :loading="loading"
        :disabled="loading">로그인</v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 폼 데이터
const email = ref('');
const password = ref('');
const visible = ref(false);
const loading = ref(false);

// 에러메세지
const emailError = ref('');
const passwordError = ref('');
const errorMessage = ref('');

// 유효성검사
const validateForm = () => {
  let isValid = true;

  // 초기화
  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

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
  }

  return isValid;
}

// 로그인 처리로직
const handleLogin = async () => {
  // 유효성 검사하기
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post('/api/auth/signin', {
      email: email.value,
      password: password.value,
    });

    // 응답오는 데이터 안전하게 추출하기
    const { accessToken, refreshToken } = response.data || {}

    // 토큰 확인하기
    if (!accessToken || !refreshToken) {
      errorMessage.value = '로그인 응답 형식이 올바르지 않습니다.';
      return;
    }

    // 토큰 타입 검증하기
    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      errorMessage.value = '토큰 형식이 올바르지 않습니다.';
      return;
    }

    // 토큰 저장(보안을 위해 sessionStorage 사용 권장 ==> 브라우저 닫으면 자동으로 토큰삭제)
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    // 토큰 영구 저장하기 => localStorage
    // localStorage.setItem('accessToken', accessToken);
    // localStorage.setItem('refreshToken', refreshToken);

    console.log('로그인 성공확인');

    // 민감한 정보 초기화로직
    email.value = '';
    password.value = '';
    visible.value = '';

    // 메인 페이지로 리다이렉트하기
    await router.push('/');
  } catch (error) {
    console.error('로그인 실패: ', error);

    // 에러 처리 로직
    if (error.response) {
      // 서버 응답이 있는 경우 로직
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 401:
          errorMessage.value = '이메일 또는 비밀번호가 일치하지 않습니다.';
          break;
        case 400:
          errorMessage.value = message || '입력 정보를 확인해주세요.';
          break;
        case 403:
          errorMessage.value = '계정이 비활성화 되었습니다. 관리자에게 문의하세요.';
          break;
        case 429:
          errorMessage.value = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 4500:
          errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage.value = message || '로그인에 실패했습니다.';
      }
    } else if (error.request) {
      // 요청은 보냈지만 서버에 응답이 없는 경우
      errorMessage.value = '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.';
    } else {
      // 요청 설정 중 오류 발생했을 시
      errorMessage.value = '로그인 요청 중 오류가 발생했습니다.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-stage {
  // 헤더 80px, 푸터 64px 제외하기
  min-height: calc(100dvh - 80px - 64px);
  display: grid;
  place-items: center;
}

:deep(.placeholder-small input::placeholder) {
  font-size: 14px;
}
</style>