<template>
  <div class="device-dialog" v-if="visible">
    <div class="dialog-content">
      <div class="dialog-icon">
        <p>设备详情</p>
      </div>
      <div class="dialog-text">
        <video ref="videoPlayer" class="video-player" controls autoplay loop muted>
          <source src="https://www.ixigua.com/7226245960341389859" type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
      </div>
      <button class="dialog-btn" @click.stop="handleClose">关闭</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible'])

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/device-dialog.css';

.video-player {
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  margin: 10px 0;
}
</style>
