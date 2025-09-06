const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})


module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 백엔드 서버 주소
      },
    }
  }
}