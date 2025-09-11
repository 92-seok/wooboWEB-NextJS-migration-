const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  devServer: {
    port: 80,
    host: '0.0.0.0',
    allowedHosts: ['woobo.online'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 백엔드 서버 주소
      },
    },

  }
}