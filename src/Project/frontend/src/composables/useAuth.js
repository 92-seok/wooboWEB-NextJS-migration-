import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signin, verifyToken, initKakaoSDK, startKakaoLogin } from '@/api/auth.api';

export const useAuth = () => {
  const router = useRouter();

  // 폼 데이터
  const username = ref('');
  const password = ref('');
  const visible = ref(false);
  const loading = ref(false);

  // 체크박스 상태
  const saveId = ref(false)
  const autoLogin = ref(false)

  // 에러 메시지
  const errorMessage = ref('')
  const usernameError = ref('')
  const passwordError = ref('')

  // * 폼 유효성 검사 *
  const validateForm = () => {
    let isValid = true

    // 초기화
    usernameError.value = ''
    passwordError.value = ''
    errorMessage.value = ''

    // 아이디 검증
    if (!username.value) {
      usernameError.value = '아이디를 입력해주세요.'
      isValid = false
    } else if (username.value.length < 2) {
      usernameError.value = '아이디 최소 2자 이상이어야 합니다.'
      isValid = false
    }

    // 비밀번호 검증
    if (!password.value) {
      passwordError.value = '비밀번호를 입력해주세요.'
      isValid = false
    } else if (password.value.length < 4) {
      passwordError.value = '비밀번호는 최소 4자 이상이어야 합니다.'
      isValid = false
    }

    return isValid
  }

  // * 자동 로그인 처리 *
  const handleAutoLogin = async () => {
    const savedAccessToken = localStorage.getItem('accessToken')
    const savedRefreshToken = localStorage.getItem('refreshToken')
    const autoLoginChecked = localStorage.getItem('autoLogin') === 'true'

    if (autoLoginChecked) {
      autoLogin.value = true
    }

    if (autoLoginChecked && savedAccessToken && savedRefreshToken) {
      try {
        const data = await verifyToken(savedAccessToken)

        if (data && data.user) {
          // 토큰이 유효하면 sessionStorage에도 저장
          sessionStorage.setItem('accessToken', savedAccessToken)
          sessionStorage.setItem('refreshToken', savedRefreshToken)
          sessionStorage.setItem('user', JSON.stringify(data.user))
          sessionStorage.setItem('userName', data.user.name || data.user.username)
          sessionStorage.setItem('userId', data.user.id)
          sessionStorage.setItem('userRole', data.user.role || 'user')

          // 자동으로 메인 페이지로 이동
          await router.push('/weathersi')
        }
      } catch (error) {
        console.error('자동 로그인 실패: ', error)
        // 토큰 만료 시 삭제
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('autoLogin')
        autoLogin.value = false
      }
    }
  }

  // * 아이디 저장 불러오기 *
  const loadSavedId = () => {
    const savedUsername = localStorage.getItem('savedUsername')
    const savedIdChecked = localStorage.getItem('saveId') === 'true'

    if (savedIdChecked && savedUsername) {
      username.value = savedUsername
      saveId.value = true
    }
  }

  // * 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    try {
      startKakaoLogin()
    } catch (error) {
      errorMessage.value = error.message
    }
  }

  // * 일반 로그인 핸들러 *
  const handleLogin = async () => {
    // 유효성 검사
    if (!validateForm()) {
      return
    }

    loading.value = true

    try {
      const data = await signin(username.value, password.value)
      const { accessToken, refreshToken, user } = data || {}

      // 토큰 확인
      if (!accessToken || !refreshToken) {
        errorMessage.value = '로그인 응답 형식이 올바르지 않습니다.'
        return
      }

      // 토큰 타입 검증
      if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        errorMessage.value = '토큰 형식이 올바르지 않습니다.'
        return
      }

      // 자동 로그인 처리
      if (autoLogin.value) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('autoLogin', 'true')
      } else {
        sessionStorage.setItem('accessToken', accessToken)
        sessionStorage.setItem('refreshToken', refreshToken)
        localStorage.removeItem('autoLogin')
      }

      // 사용자 정보 저장
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user))
        sessionStorage.setItem('userName', user.name || user.username || user.email || '사용자')
        sessionStorage.setItem('userId', user.id || user._id || user.username || '')
        sessionStorage.setItem('userEmail', user.email || '')
        sessionStorage.setItem('userRole', user.role || 'user')
      } else {
        sessionStorage.setItem('userName', username.value)
      }

      // 아이디 저장 처리
      if (saveId.value) {
        localStorage.setItem('savedUsername', username.value)
        localStorage.setItem('saveId', 'true')
      } else {
        localStorage.removeItem('savedUsername')
        localStorage.removeItem('saveId')
      }

      // 민감한 정보 초기화
      username.value = ''
      password.value = ''
      visible.value = false

      // 메인 페이지로 이동
      await router.push('/')
    } catch (error) {
      console.error('로그인 실패: ', error)

      // 에러 처리
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message

        switch (status) {
          case 401:
            errorMessage.value = '아이디 또는 비밀번호가 일치하지 않습니다.'
            break
          case 400:
            errorMessage.value = message || '입력 정보를 확인해주세요.'
            break
          case 403:
            errorMessage.value = '계정이 비활성화 되었습니다. 관리자에게 문의하세요.'
            break
          case 429:
            errorMessage.value = '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.'
            break
          case 500:
            errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            break
          default:
            errorMessage.value = message || '로그인에 실패했습니다.'
        }
      } else if (error.request) {
        errorMessage.value = '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.'
      } else {
        errorMessage.value = '로그인 요청 중 오류가 발생했습니다.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // 상태
    username,
    password,
    visible,
    loading,
    saveId,
    autoLogin,
    errorMessage,
    usernameError,
    passwordError,

    // 메서드
    validateForm,
    handleAutoLogin,
    loadSavedId,
    handleKakaoLogin,
    handleLogin,
    initKakaoSDK
  }
}