import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    transpileDependencies: true,
    lintOnSave: false,
    plugins: [
      vue(),
      vuetify({ autoImport: true })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: Number(env.SERVICE_PORT || 80),
      host: '0.0.0.0',
      allowedHosts: ["woobo.online", "localhost"],
      proxy: {
        '/api': {
          target: env.SERVICE_PROXY_TARGET,
          changeOrigin: true
        },
      },
      headers: {
        //"Cache-Control": "max-age=3600",
      },
      pwa: {
        workboxPluginMode: "disabled", // 또는 'GenerateSW' 대신 'InjectManifest' 사용 시
      },
      css: {
        loaderOptions: {
          sass: {
            additionalData: `@import "@/styles/footer.scss";`,
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  }
})
