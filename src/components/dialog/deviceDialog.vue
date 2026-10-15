<template>
  <div class="device-dialog" v-if="visible" :style="dialogStyle">
    <div class="device-head">
      <div class="device-head-text">设备详情</div>
      <div class="icon" @click.stop="handleClose">×</div>
    </div>
    <div class="dialog-content">
      <div class="dialog-text">
        <div class="text-item" v-for="row in rows" :key="row.label">
          <div>{{ row.label }}</div>
          <div :class="{ [`status-${row.value}`]: row.label === '设备状态' }">{{ row.value }}</div>
        </div>
      </div>
      <!-- <button class="dialog-btn" @click.stop="handleClose">关闭</button> -->
    </div>
  </div>
</template>

<script setup>
import ThreeManager from '@/views/three/index.js'
import { ref, computed, watch } from 'vue'
import * as THREE from 'three'
import { fetchDeviceBySceneNode } from '@/api/convention'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  deviceInfo: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:visible'])
const device = ref(null)
const error = ref('')
watch(
  () => props.visible && props.deviceInfo?.name,
  async (node) => {
    device.value = null
    error.value = ''
    if (!node) return
    try {
      const row = await fetchDeviceBySceneNode(node)
      if (props.deviceInfo?.name === node) device.value = row
    } catch (err) {
      if (props.deviceInfo?.name === node) error.value = err.message || '加载失败'
    }
  },
  { immediate: true }
)
const rows = computed(() => {
  const d = device.value
  if (!d) {
    return [
      { label: '设备点位', value: props.deviceInfo?.name || '--' },
      { label: '设备信息', value: error.value || '加载中…' },
    ]
  }
  return [
    { label: '设备名称', value: d.name },
    { label: '设备编号', value: d.code },
    { label: '设备型号', value: d.model || '--' },
    { label: '设备状态', value: d.status },
    { label: '所在位置', value: `${d.hall_name} ${d.floor}` },
  ]
})
// 计算对话框位置
const dialogStyle = computed(() => {
  if (!props.deviceInfo.position) return {}

  // 将3D世界坐标转换为屏幕坐标
  const vector = new THREE.Vector3(
    props.deviceInfo.position.x,
    props.deviceInfo.position.y,
    props.deviceInfo.position.z
  )

  // 获取当前相机和渲染器
  const camera = ThreeManager.getInstance().getCamera()
  const renderer = ThreeManager.getInstance().getRenderer()

  vector.project(camera)

  // 转换为屏幕坐标
  const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth
  const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight

  return {
    position: 'fixed',
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -100%)',
  }
})
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.device-dialog {
  width: 256px;
  // height: 50vh;
  background: rgba(9, 104, 170, 0.6);
  border-radius: 12px;
  z-index: 1000;
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  .device-head-text {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
    padding-left: 16px;
  }
  .device-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // padding: 0 12px;
    width: 100%;
    height: 40px;
    background: linear-gradient(rgba(0, 182, 255, 0) 0%, #00a6ff 100%);
    border-radius: 12px 12px 0px 0px;
    color: #ffffff;
  }
  .icon {
    padding-right: 16px;
    font-size: 20px;
  }
  .text-item {
    width: 90%;
    display: flex;
    justify-content: space-between;
    padding: 16px;
    // height: 40px;
    color: #ffffff;
    font-size: 16px;
    gap: 12px;
    > div:last-child {
      text-align: right;
    }
    .status-在线 {
      color: #17fcff;
    }
    .status-离线 {
      color: #b0b0b0;
    }
    .status-故障 {
      color: #feb817;
    }
  }
}
</style>
