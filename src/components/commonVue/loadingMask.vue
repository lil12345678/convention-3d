<template>
  <Transition name="loading-mask-fade">
    <div class="loading-mask" v-show="isLoading">
      <div class="loading-content">
        <div class="loading-box">
          <img src="../../assets/gif/loading.gif" class="loading-spinner" />
          <div class="loading-text">{{ percent }}%</div>
          <div>模型加载中</div>
        </div>
      </div>
    </div>
  </Transition>
  <Transition name="loading-mask-fade">
    <div class="loading-mask" v-show="aniLoading">
      <div class="loading-content">
        <img src="../../assets/gif/loading.gif" class="loading-img" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import eventHub from '@/utils/eventHub'
const isLoading = ref(true) // 添加加载状态
const aniLoading = ref(false) // 添加加载状态
const percent = ref(0) // 加载进度条
onMounted(() => {
  eventHub.on('animationLoading', () => {
    aniLoading.value = true // 开始加载
  })
  eventHub.on('animationLoaded', () => {
    aniLoading.value = false
  })
  eventHub.on('modelLoading', (progress) => {
    // console.log('模型加载进度：', progress)

    if (progress === -1) {
      console.error('模型加载失败')
      return
    }
    if (progress === 100) {
      isLoading.value = false // 立即隐藏加载遮罩
      percent.value = 100 // 直接设置进度为100%
      clearLoadingAnimation() // 清除未完成的动画
      return
    }
    const currentTime = Date.now()
    const timeDiff = currentTime - lastUpdateTime // 计算距离上次更新的时间差
    lastUpdateTime = currentTime

    handleLoadingAnimation(percent.value, progress, timeDiff)
  })
})
onUnmounted(() => {
  eventHub.off('animationLoading', () => {})
  eventHub.off('animationLoaded', () => {})
  eventHub.off('modelLoading')
  clearLoadingAnimation()
})
let animationFrame = null
let lastUpdateTime = Date.now()

// 处理加载动画的方法
const handleLoadingAnimation = (currentPercent, targetPercent, timeDiff) => {
  // 取消之前的动画
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }

  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < timeDiff && !isLoading.value) {
      // 若遮罩已隐藏，直接终止动画
      return
    }

    if (elapsed < timeDiff) {
      const progress = elapsed / timeDiff
      percent.value = Math.floor(currentPercent + (targetPercent - currentPercent) * progress)
      animationFrame = requestAnimationFrame(animate)
    } else {
      percent.value = targetPercent
      animationFrame = null
    }
  }

  animationFrame = requestAnimationFrame(animate)
}

// 清除加载动画的方法
const clearLoadingAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/load-mask.css';
// .loading-mask {
// background: rgba(0, 10, 13, 255);
//  background: radial-gradient(
//   circle,
//   rgba(8, 4, 71, 255) 0%,
//   rgba(0, 10, 13, 255) 50%,
//   rgba(6, 7, 61, 255) 100%
// );
// }
.loading-img {
  width: 600px;
  height: auto;
}
</style>
