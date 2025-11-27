<template>
  <v-container class="login-stage" fluid>
    <v-card class="login-card mx-auto" elevation="8" rounded="lg">
      <div class="d-flex align-center justify-center flex-column header-section">
        <v-img class="mx-auto logo-img" src="/favicon.ico"></v-img>
        <div class="login-title font-weight-bold mt-2 text-center">운영지원 시스템 로그인</div>
      </div>

      <!-- 아이디 입력부분 -->
      <div class="field-label text-medium-emphasis">
        아이디
      </div>
      <v-text-field v-model="username" density="compact" placeholder="아이디를 입력해주세요"
        prepend-inner-icon="mdi-account-outline" variant="outlined" class="placeholder-small input-field"
        :error-messages="usernameError" @keyup.enter="handleLogin" :disabled="loading"></v-text-field>

      <!-- password 입력부분 -->
      <div class="field-label text-medium-emphasis d-flex align-center justify-space-between">
        비밀번호
      </div>
      <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'" density="compact" placeholder="비밀번호를 입력해주세요."
        prepend-inner-icon="mdi-lock-outline" variant="outlined" @click:append-inner="visible = !visible"
        class="placeholder-small input-field" :error-messages="passwordError" @keyup.enter="handleLogin"
        :disabled="loading"></v-text-field>

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 폼 데이터
const username = ref('');
const password = ref('');
const visible = ref(false);
const loading = ref(false);

// 에러메세지
const usernameError = ref('');
const passwordError = ref('');
const errorMessage = ref('');

// 유효성검사
const validateForm = () => {
  let isValid = true;

  // 초기화
  usernameError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

  // 아이디 검증하기
  if (!username.value) {
    usernameError.value = '아이디를 입력해주세요.';
    isValid = false;
  } else if (username.value.length < 2) {
    usernameError.value = '아이디 최소 2자 이상이어야 합니다.';
    isValid = false;
  }

  // 비밀번호 검증하기
  if (!password.value) {
    passwordError.value = '비밀번호를 입력해주세요.';
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.value = '비밀번호는 최소 6자 이상이어야 합니다.';
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
      username: username.value,
      password: password.value,
    });

    // 응답오는 데이터 안전하게 추출하기
    const { accessToken, refreshToken, user } = response.data || {}

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

    // 사용자 정보 저장하기
    if (user) {
      // user 객체 전체를 JSON으로 저장 (라우터 가드에서 사용)
      sessionStorage.setItem('user', JSON.stringify(user));

      // 개별 필드도 저장 (다른 곳에서 사용할 수 있음)
      sessionStorage.setItem('userName', user.name || user.username || user.email || '사용자');
      sessionStorage.setItem('userId', user.id || user._id || user.username || '');
      sessionStorage.setItem('userEmail', user.email || '');
      sessionStorage.setItem('userRole', user.role || 'user');
    } else {
      // user 객체가 없으면 아이디라도 저장하기
      sessionStorage.setItem('userName', username.value); // 아이디라도 저장
      // sessionStorage.setItem('userEmail', email.value);
    }

    // axios 기본 헤더에 토큰 설정 추가해주기
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    console.log('로그인 성공')
    console.log('사용자 이름:', sessionStorage.getItem('userName'))
    console.log('axios 헤더:', axios.defaults.headers.common['Authorization'])

    // 민감한 정보 초기화로직
    username.value = '';
    password.value = '';
    visible.value = false;

    // 모니터링 페이지로 리다이렉트하기
    await router.push('/weathersi');
  } catch (error) {
    console.error('로그인 실패: ', error);

    // 에러 처리 로직
    if (error.response) {
      // 서버 응답이 있는 경우 로직
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 401:
          errorMessage.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
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
        case 500:
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

// 회원가입 페이지로 이동하기
const goToSignup = () => {
  router.push('/signup');
}
</script>

<style lang="scss" scoped>
.login-stage {
  // 헤더 80px, 푸터 64px 제외하기
  min-height: calc(100vh - 80px - 64px);
  display: grid;
  place-items: center;
  padding: 12px;
}

/* 모바일 스타일 (기본: ~600px) */
.login-card {
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
  margin-bottom: 20px;
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

:deep(.placeholder-small input::placeholder) {
  font-size: 12px;
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
    font-size: 16px;
    height: 48px;
    margin-bottom: 16px;
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
}
</style>