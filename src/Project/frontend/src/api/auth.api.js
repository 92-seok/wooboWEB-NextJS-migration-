import axios from 'axios'

// * 로그인 API *
export const signin = async (username, password) => {
  const response = await axios.post('/api/auth/signin', {
    username,
    password,
  })
  return response.data
}

// * 토큰 검증 API *
export const verifyToken = async (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  const response = await axios.get('/api/auth/verify')
  return response.data
}

// 카카오 로그인 초기화
export const initKakaoSDK = (kakaoJsKey) => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJsKey)
    console.log('카카오 SDK 초기화 완료: ', window.Kakao.isInitialized())
  }
}

// 카카오 로그인 시작
export const startKakaoLogin = () => {
  if (!window.Kakao || !window.Kakao.isInitialized()) {
    throw new Error('카카오 SDK가 초기화되지 않았습니다.')
  }

  const redirectUri = `${window.location.origin}/kakao-callback`

  window.Kakao.Auth.authorize({
    redirectUri: redirectUri,
    scope: 'profile_nickname,account_email',
    prompt: 'select_account',
  })
}