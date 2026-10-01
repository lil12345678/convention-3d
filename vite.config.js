import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import postcsspxtoviewport from 'postcss-px-to-viewport'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  assetsInclude: ['**/*.ttf'],
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport({
          unitToConvert: 'px',
          viewportWidth: 3840, // 设计稿宽度
          viewportHeight: 1080, // 设计稿高度
          unitPrecision: 6, // 转换后的精度
          viewportUnit: 'vw',
          fontViewportUnit: 'vw',
          propList: ['*'], // 能转换的属性，*表示所有属性，!border表示border不转
          minPixelValue: 1, // 最小转换的值，小于等于1不转
          mediaQuery: false, // 是否在媒体查询的css代码中也进行转换
          replace: true,
          selectorBlackList: ['ignore-'],
          exclude: [/node_modules/],
          include: [],
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    https: false, // 是否开启 https
    open: true, // 是否自动在浏览器打开
    port: 3000, // 端口号
    hmr: true, //开启热更新
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // 构建配置
  build: {
    outDir: 'dist', // 指定输出路径
    assetsDir: 'assets', // 指定生成静态资源的存放路径
    minify: 'terser', // 混淆器,terser构建后文件体积更小
    sourcemap: false, //是否构建source map 文件
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true, // 生产环境移除debugger
      },
    },
  },
})
