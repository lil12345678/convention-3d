<!-- 视频监控 -->
<template>
  <div class="sec-video left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">视频监控</div>
    </div>
    <div class="content">
      <div class="left">
        <video ref="videoPlayer" class="video-player" controls autoplay loop muted>
          <source :src="video1" type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
        <Empty />
      </div>
      <div class="right">
        <video ref="videoPlayer" class="video-player" controls autoplay loop muted>
          <source :src="video2" type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
        <Empty />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Empty from '@/components/commonVue/emptyData.vue'

const video1 = ref('')
const video2 = ref('')
onMounted(() => {
  getSrc()
})
const getSrc = () => {
  video1.value = ''
  video2.value = ''
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/leftRight.scss';
.sec-video {
  margin-bottom: 10px;
  padding-bottom: 0;
  .content {
    gap: 0;
  }
  .model-header {
    margin-bottom: 0;
  }

  .left,
  .right {
    width: 50%;
    height: 240px;
    background: rgba(0, 0, 0, 0);
    position: relative;
  }
  .video-player {
    width: 446px;
    height: 237px;
    border-radius: 24px;
  }
}
</style>
