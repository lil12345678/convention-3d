<!-- 视频监控 -->
<template>
  <div class="sec-video left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">视频监控</div>
    </div>
    <div class="content">
      <div v-for="(slot, index) in slots" :key="index" :class="index === 0 ? 'left' : 'right'">
        <select v-if="cameras.length" v-model="slot.id" class="camera-select">
          <option v-for="camera in cameras" :key="camera.id" :value="camera.id">
            {{ camera.name }}（{{ camera.status }}）
          </option>
        </select>
        <video
          v-if="cameraOf(slot)?.stream_url"
          :key="cameraOf(slot).stream_url"
          :src="cameraOf(slot).stream_url"
          class="video-player"
          controls
          autoplay
          loop
          muted
        ></video>
        <Empty v-else :text="emptyText(cameraOf(slot))" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Empty from '@/components/commonVue/emptyData.vue'
import { fetchCameras } from '@/api/convention'

const cameras = ref([])
const slots = ref([{ id: null }, { id: null }])

const cameraOf = (slot) => cameras.value.find((item) => item.id === slot.id)
const emptyText = (camera) => {
  if (!camera) return '暂无摄像头'
  if (camera.status !== '在线') return `${camera.name} 离线`
  return `${camera.name} 未接入视频流`
}

onMounted(async () => {
  cameras.value = await fetchCameras()
  const preferred = [
    ...cameras.value.filter((item) => item.stream_url),
    ...cameras.value.filter((item) => !item.stream_url && item.status === '在线'),
    ...cameras.value,
  ]
  const picked = [...new Set(preferred.map((item) => item.id))]
  slots.value = slots.value.map((_, index) => ({ id: picked[index] ?? null }))
})
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
  .camera-select {
    position: absolute;
    top: 8px;
    left: 12px;
    z-index: 2;
    max-width: 70%;
    padding: 2px 6px;
    font-size: 12px;
    color: #fff;
    background: rgba(9, 104, 170, 0.6);
    border: 1px solid rgba(64, 158, 255, 0.5);
    border-radius: 4px;
    outline: none;
    option {
      color: #000;
    }
  }
  .video-player {
    width: 446px;
    height: 237px;
    border-radius: 24px;
  }
}
</style>
