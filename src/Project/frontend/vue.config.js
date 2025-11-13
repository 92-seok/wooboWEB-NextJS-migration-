const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: process.env.SERVICE_PORT || 80,
    host: "0.0.0.0",
    allowedHosts: ["localhost", "woobo.online"], // 접근 허용 주소
    proxy: {
      "/api": {
        target: process.env.SERVICE_PROXY_TARGET, // 백엔드 서버 주소
      },
    },
    headers: {
      //"Cache-Control": "max-age=3600",
    },
  },
  pwa: {
    workboxPluginMode: "disabled", // 또는 'GenerateSW' 대신 'InjectManifest' 사용 시
  },
  /*
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/footer.scss";
        `,
      },
    },
  },
  */
});
