<template>
  <!--  -->
  <!-- <v-scale-screen ref="myVScaleScreenRef" :delay="10" width="3840" height="1080"> -->

  <div class="home">
    <ComHeader></ComHeader>
    <div class="box">
      <div class="left"></div>
      <div id="conventionCanvas"></div>
      <div class="right"></div>
    </div>
    <!-- <div id="conventionCanvas"></div> -->

    <!-- 左上菜单按钮面板 -->
    <ControlPanel />
    <!-- 设备选择面板 -->
    <DevicePanel />
    <!-- 设备信息弹窗 -->
    <DeviceDialog v-model:visible="showDeviceDialog" :deviceInfo="deviceInfo" />
    <!-- loading加载蒙版 -->
    <AnimationLoadingMask />
    <router-view :key="`${auth.sessionVersion}-${$route.fullPath}`" />
  </div>
  <!-- </v-scale-screen> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

import ComHeader from './comheader.vue'
import ControlPanel from '@/views/controlPanel.vue'
import DevicePanel from '@/views/devicePanel.vue'
import DeviceDialog from '@/components/dialog/deviceDialog.vue'
import AnimationLoadingMask from '@/components/commonVue/loadingMask.vue'
import ThreeManager from './three/index.js'

import eventHub from '@/utils/eventHub'

import { initICCToken } from '@/utils/iccToken.js'
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()

const isNight = ref(false)
const showDeviceDialog = ref(false)

const deviceInfo = ref(null) // 设备详情
onMounted(async () => {
  await nextTick()
  new ThreeManager('conventionCanvas', isNight.value)

  eventHub.on('showDeviceInfo', showDeviceInfo)
  eventHub.on('hideDeviceInfo', hideDeviceInfo)
  initICCToken()
  window.addEventListener('webglcontextlost', (event) => {
    console.error('WebGL上下文丢失:', event)
    // 执行页面重载恢复状态
    window.location.reload()
  })
})
onUnmounted(() => {
  eventHub.off('showDeviceInfo', showDeviceInfo)
  eventHub.off('hideDeviceInfo', hideDeviceInfo)
})

// 设备详情弹窗
const showDeviceInfo = (device) => {
  // console.log('点击标签：', device)
  deviceInfo.value = device
  showDeviceDialog.value = true
}
const hideDeviceInfo = () => {
  showDeviceDialog.value = false
}
</script>

<style lang="scss">
@import '@/assets/style/load-mask.css';
.home {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: radial-gradient(circle, rgba(10, 31, 68, 0) 0%, #0a1f44 50%, #0a1f44 100%);
}
.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(10, 31, 68, 0) 0%, #0a1f44 50%, #0a1f44 100%);
  z-index: 1;
}
.box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  .right,
  .left {
    // width: 100px;
  }
  #conventionCanvas {
    flex: 1;
  }
}
// #conventionCanvas {
//   height: 100vh;
//   width: 100vw;
//   position: absolute;
//   top: 0;
// }
</style>
