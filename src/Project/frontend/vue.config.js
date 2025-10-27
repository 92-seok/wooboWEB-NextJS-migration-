const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 80,
    host: "0.0.0.0",
    allowedHosts: ["woobo.online", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:8080", // 백엔드 서버 주소
      },
    },
    headers: {
      //"Cache-Control": "max-age=3600",
    },
  },
  pwa: {
    workboxPluginMode: "disabled", // 또는 'GenerateSW' 대신 'InjectManifest' 사용 시
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/footer.scss";
        `
      }
    }
  },

});
