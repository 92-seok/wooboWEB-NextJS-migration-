<template>
  <a @click="loginWithKakao">
    <img src="/kakao_login.png"/>
  </a>
</template>

<script>
export default {
  name: 'IndexPage',
  methods: {
    kakaoInit () {
      Kakao.init('a21fca6df45467b72c4cff24ec14cb6b')// KaKao client key
      Kakao.isInitialized()
    },
    async loginWithKakao () {
      await Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/kakao-callback`
      })
    }
  },
  mounted () {
    this.kakaoInit()
  }
}
</script>


