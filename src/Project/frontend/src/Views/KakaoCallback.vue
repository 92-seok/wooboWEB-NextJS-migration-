<template>
  <div>
    <h1>Kakao Callback</h1>
    <p>카카오 로그인 후 리다이렉트되는 페이지입니다. 잠시만 기다려주세요...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios' // Nuxt의 this.$axios를 쓰지 않는 일반 Vue3 기준

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  try {
    // ✅ code 유무 체크
    const code = route.query.code
    if (!code) {
      return router.push('/')
    }

    console.log(`code : ${code}`)

    // ✅ 서버 로그인 요청 (kakao 인증 코드 전달)
    const body = {
      code,
      domain: window.location.origin
    }

    const response = await axios.post('/auth/login', body)
    console.log('로그인 응답:', response.data)
  } catch (error) {
    console.error('로그인 중 오류 발생:', error)
  }
})
</script>

<style lang="scss" scoped>

</style>