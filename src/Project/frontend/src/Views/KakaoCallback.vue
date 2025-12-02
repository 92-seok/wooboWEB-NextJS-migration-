  <template>
    <v-container class="callback-container" fluid>
      <div class="callback-wrapper">
        <!-- 로딩 상태 -->
        <div v-if="!errorMessage" class="loading-card">
          <div class="kakao-logo-wrapper">
            <div class="kakao-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 191" width="60" height="60">
                <path fill="#FEE500" d="M104 0C46.6 0 0 36.4 0 81.3c0 29.2 19.4 54.8 48.5 69.4-1.8 6.7-6.5 24.8-7.4 28.7-.9 4.3 1.6       
  4.3 3.3 3.1 1.4-.9 22.9-15.3 31.8-21.3 9.1 1.3 18.5 2 28.1 2 57.4 0 104-36.4 104-81.3S161.4 0 104 0z" />
              </svg>
            </div>
            <div class="pulse-ring"></div>
          </div>

          <h2 class="loading-title">카카오 로그인 중</h2>
          <p class="loading-subtitle">잠시만 기다려주세요</p>

          <div class="loading-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else class="error-card">
          <div class="error-icon-wrapper">
            <v-icon size="80" color="#ff5252">mdi-alert-circle-outline</v-icon>
          </div>
          <h2 class="error-title">로그인 실패</h2>
          <p class="error-message">{{ errorMessage }}</p>
          <v-btn color="primary" variant="flat" size="large" class="redirect-btn" @click="router.push('/login')">
            로그인 페이지로 돌아가기
          </v-btn>
        </div>
      </div>
    </v-container>
  </template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute();
const router = useRouter();
const errorMessage = ref('');

onMounted(async () => {
  try {
    // URL에서 authorization code 추출
    const code = route.query.code

    if (!code) {
      console.error('카카오 인증 코드가 없습니다.');
      errorMessage.value = '카카오 로그인에 실패했습니다.';
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    // console.log('카카오 인증 코드:', code);

    // 백엔드로 코드 전송하여 로그인 처리하기
    const response = await axios.post('/api/auth/kakao', {
      code,
      domain: window.location.origin,
    });

    // console.log('카카오 로그인 응답:', response.data);

    if (response.data && response.data.accessToken) {
      const { accessToken, refreshToken, user } = response.data;

      // 세션 스토리지에 토큰 및 사용자 정보 저장
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userName', user.name || user.username);

      // axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // 홈으로 리다이렉트 보내기
      router.push('/');
    } else {
      throw new Error('토큰을 할당 받지 못하였습니다.');
    }
  } catch (error) {
    console.error('카카오 로그인 처리 중 오류:', error);
    errorMessage.value = error.response?.data?.message || '카카오 로그인에 실패하였습니다.';

    // 3초 후 로그인 페이지로 이동
    setTimeout(() => router.push('/login'), 3000);
  }
});
</script>

<style lang="scss" scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.callback-wrapper {
  width: 100%;
  max-width: 450px;
}

/* ===== 로딩 카드 ===== */
.loading-card {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-out;
}

/* 카카오 로고 */
.kakao-logo-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
}

.kakao-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 3px solid #FEE500;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0px);
  }

  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

/* 타이틀 */
.loading-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.loading-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 40px;
  font-weight: 400;
}

/* 로딩 점 애니메이션 */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== 에러 카드 ===== */
.error-card {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-out;
}

.error-icon-wrapper {
  margin-bottom: 24px;
  animation: shake 0.5s ease-in-out;
}

.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.error-message {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 32px;
  line-height: 1.6;
}

.redirect-btn {
  font-weight: 600;
  padding: 12px 32px !important;
  border-radius: 12px !important;
  text-transform: none;
  letter-spacing: -0.3px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.redirect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ===== 애니메이션 ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

/* 반응형 */
@media (max-width: 600px) {

  .loading-card,
  .error-card {
    padding: 40px 24px;
  }

  .loading-title,
  .error-title {
    font-size: 24px;
  }

  .loading-subtitle,
  .error-message {
    font-size: 14px;
  }
}
</style>