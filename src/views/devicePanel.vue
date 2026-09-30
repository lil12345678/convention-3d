<template>
  <div class="device-panel">
    <div
      v-for="item in deviceList"
      :key="item.id"
      class="device-item"
      :class="{ active: activeDevice === item.id }"
      @click="handleDeviceClick(item)"
    >
      <img :src="item.icon" alt="" class="device-icon" />
      <span class="device-name">{{ item.name }}</span>
      <div class="device-arrow"></div>
    </div>
  </div>

  <!-- 监控设备树形选择面板 -->
  <div class="tree-panel" v-show="activeDevice === 'monitor'">
    <div class="tree-header">
      <span>监控设备</span>
    </div>
    <div class="tree-content">
      <div v-for="(area, index) in monitorTree" :key="index" class="tree-area">
        <div class="area-title" @click="toggleArea(index)">
          <span class="toggle-icon">{{ area.expanded ? '▼' : '▶' }}</span>
          <span>{{ area.name }}</span>
        </div>
        <div class="area-devices" v-show="area.expanded">
          <div
            v-for="device in area.devices"
            :key="device.id"
            class="device-option"
            :class="{ active: selectedDevice === device.id }"
            @click="selectDevice(device)"
          >
            <span class="checkbox"></span>
            <span>{{ device.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 安防设备选择面板 -->
  <div class="tree-panel" v-show="activeDevice === 'security'">
    <div class="tree-header">
      <span>安防设备</span>
    </div>
    <div class="tree-content">
      <div
        v-for="(item, index) in securityList"
        :key="index"
        class="device-option"
        :class="{ active: selectedSecurityDevice === item.id }"
        @click="selectSecurityDevice(item)"
      >
        <span class="checkbox"></span>
        <img :src="item.icon" alt="" class="item-icon" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>

  <!-- 楼宇自控面板 -->
  <div class="tree-panel" v-show="activeDevice === 'elevator'">
    <div class="tree-header">
      <span>楼宇自控</span>
    </div>
    <div class="tree-content">
      <div
        v-for="(item, index) in elevatorList"
        :key="index"
        class="device-option"
        :class="{ active: selectedElevatorDevice === item.id }"
        @click="selectElevatorDevice(item)"
      >
        <span class="checkbox"></span>
        <img :src="item.icon" alt="" class="item-icon" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>

  <!-- 能效设备面板 -->
  <div class="tree-panel" v-show="activeDevice === 'energy'">
    <div class="tree-header">
      <span>能效设备</span>
    </div>
    <div class="tree-content">
      <div
        v-for="(item, index) in energyList"
        :key="index"
        class="device-option"
        :class="{ active: selectedEnergyDevice === item.id }"
        @click="selectEnergyDevice(item)"
      >
        <span class="checkbox"></span>
        <img :src="item.icon" alt="" class="item-icon" />
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import eventHub from '@/utils/eventHub'
import { debounce } from '@/utils/commonFunc.js'

import monitor from '../assets/icon/d1.png'
import security from '../assets/icon/d2.png'
import elevator from '../assets/icon/d3.png'
import energy from '../assets/icon/d4.png'

import d1 from '../assets/icon/d2-1.png'
import d2 from '../assets/icon/d2-2.png'
import d3 from '../assets/icon/d2-3.png'
import d4 from '../assets/icon/d3-1.png'
import d5 from '../assets/icon/d3-2.png'
import d6 from '../assets/icon/d3-3.png'
import d7 from '../assets/icon/d4-1.png'
import d8 from '../assets/icon/d4-2.png'

const emit = defineEmits(['select'])
const activeDevice = ref('')
const showTreePanel = ref(false)
const selectedDevice = ref('')
const selectedSecurityDevice = ref('')
const selectedElevatorDevice = ref('')
const selectedEnergyDevice = ref('')
const deviceList = [
  { id: 'monitor', name: '监控设备', icon: monitor },
  { id: 'security', name: '安防设备', icon: security },
  { id: 'elevator', name: '楼宇自控', icon: elevator },
  { id: 'energy', name: '能效设备', icon: energy },
]
// 监控设备树形数据
const monitorTree = ref([
  {
    name: 'A展厅',
    expanded: true, // 默认展开
    devices: [
      { id: 'monitor1', name: '空调用电' },
      { id: 'monitor2', name: '集中空调' },
      { id: 'monitor3', name: '辐射空调' },
    ],
  },
  {
    name: 'B展厅',
    expanded: true, // 默认展开
    devices: [
      { id: 'monitor4', name: '应急照明' },
      { id: 'monitor5', name: '照明插座' },
      { id: 'monitor6', name: '景观照明' },
    ],
  },
])
const securityList = ref([
  { id: 'security1', name: '入侵探测器', icon: d1 },
  { id: 'security2', name: '停车场匝道', icon: d2 },
  { id: 'security3', name: '门禁', icon: d3 },
])

const elevatorList = ref([
  { id: 'elevator1', name: '照明', icon: d4 },
  { id: 'elevator2', name: '冷热源', icon: d5 },
  { id: 'elevator3', name: '空调', icon: d6 },
])

const energyList = ref([
  { id: 'energy1', name: '电表', icon: d7 },
  { id: 'energy2', name: '水表', icon: d8 },
])

onMounted(() => {
  eventHub.on('hideDeviceMenuCallback', () => hidemenu())
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
function handleClickOutside(event) {
  // 检查点击事件是否来自下拉框内部
  const isClickInDropdown = ['.tree-panel'].some((selector) => {
    const element = event.target.closest(selector)
    return element !== null
  })

  // 如果点击的不是下拉框内部，则关闭所有下拉框
  if (!isClickInDropdown) {
    hidemenu()
  }
}

const hidemenu = () => {
  activeDevice.value = ''
}
const handleDeviceClick = debounce(
  (item) => {
    activeDevice.value = item.id
    if (item.id == 'monitor') {
      showTreePanel.value = true
    } else {
      showTreePanel.value = false
    }
    //清空已选设备
    selectedDevice.value = ''
    selectedSecurityDevice.value = ''
    selectedElevatorDevice.value = ''
    selectedEnergyDevice.value = ''
    //清空所有标签
    eventHub.emit('hidesecurityLabelCallback')
    eventHub.emit('hideparkingLabelCallback')
    eventHub.emit('hidedoorLabelCallback')
    eventHub.emit('hideac1LabelCallback')
    eventHub.emit('hideac1LabelCallback')
    eventHub.emit('hideac2LabelCallback')
    eventHub.emit('hideac3LabelCallback')
    eventHub.emit('hideac4LabelCallback')
    eventHub.emit('hideac5LabelCallback')
    eventHub.emit('hideac6LabelCallback')
    eventHub.emit('hideDeviceInfo')
  },
  300,
  true
)

const toggleArea = debounce(
  (index) => {
    monitorTree.value[index].expanded = !monitorTree.value[index].expanded
  },
  300,
  true
)

const selectDevice = debounce(
  (device) => {
    selectedDevice.value = device.id
    if (device.id === 'monitor1') {
      eventHub.emit('ac1LabelCallback')
    } else {
      eventHub.emit('hideac1LabelCallback')
    }
    if (device.id === 'monitor2') {
      eventHub.emit('ac2LabelCallback')
    } else {
      eventHub.emit('hideac2LabelCallback')
    }
    if (device.id === 'monitor3') {
      eventHub.emit('ac3LabelCallback')
    } else {
      eventHub.emit('hideac3LabelCallback')
    }
    if (device.id === 'monitor4') {
      eventHub.emit('ac4LabelCallback')
    } else {
      eventHub.emit('hideac4LabelCallback')
    }
    if (device.id === 'monitor5') {
      eventHub.emit('ac5LabelCallback')
    } else {
      eventHub.emit('hideac5LabelCallback')
    }
    if (device.id === 'monitor6') {
      eventHub.emit('ac6LabelCallback')
    } else {
      eventHub.emit('hideac6LabelCallback')
    }
    eventHub.emit('hideDeviceInfo')
    eventHub.emit('hideStadiumLabelCallback')
  },
  300,
  true
)
const selectSecurityDevice = debounce(
  (device) => {
    selectedSecurityDevice.value = device.id
    if (device.id === 'security1') {
      eventHub.emit('securityLabelCallback')
    } else {
      eventHub.emit('hidesecurityLabelCallback')
    }
    if (device.id === 'security2') {
      eventHub.emit('parkingLabelCallback')
    } else {
      eventHub.emit('hideparkingLabelCallback')
    }
    if (device.id === 'security3') {
      eventHub.emit('doorLabelCallback')
    } else {
      eventHub.emit('hidedoorLabelCallback')
    }
    eventHub.emit('hideDeviceInfo')
    eventHub.emit('hideStadiumLabelCallback')
  },
  300,
  true
)

const selectElevatorDevice = debounce(
  (device) => {
    selectedElevatorDevice.value = device.id
  },
  300,
  true
)

const selectEnergyDevice = debounce(
  (device) => {
    selectedEnergyDevice.value = device.id
  },
  300,
  true
)
</script>

<style lang="scss" scoped>
.device-panel {
  position: absolute;
  left: 26%;
  bottom: 20px;
  // transform: translateY(-50%);
  background: rgba(9, 104, 170, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  padding: 10px;
  z-index: 10;

  .device-item {
    display: flex;
    align-items: center;
    // padding: 15px 20px;
    padding-right: 20px;
    cursor: pointer;
    color: #fff;
    transition: all 0.3s ease;
    border-radius: 4px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid transparent;
    position: relative;
    font-family: MicrosoftYaHei;
    font-size: 14px;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #02b2f4;
    }

    &.active {
      background: rgba(64, 158, 255, 0.2);
      border: 1px solid rgba(64, 158, 255, 0.5);
      color: #02b2f4;

      .device-arrow {
        opacity: 1;
      }
    }

    .device-icon {
      width: 54px;
      height: 54px;
      margin-right: 10px;
    }

    .device-name {
      font-size: 14px;
      white-space: nowrap;
    }

    .device-arrow {
      position: absolute;
      right: -6px;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid rgba(64, 158, 255, 0.5);
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
}

.tree-panel {
  position: absolute;
  left: calc(26% + 160px);
  bottom: 20px;
  // transform: translateY(-50%);
  backdrop-filter: blur(8px);
  background: rgba(9, 104, 170, 0.3);
  border-radius: 12px;
  // padding: 15px;
  min-width: 200px;
  color: #fff;
  margin-left: 12px;

  .tree-header {
    height: 40px;
    line-height: 40px;
    background: linear-gradient(#00a6ff 0%, rgba(0, 182, 255, 0) 100%);
    border-radius: 12px 12px 0px 0px;
    padding: 0 10px 10px 10px;
  }
  .tree-content {
    height: 210px;
    overflow-y: auto;
    padding: 0 20px;
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    .tree-area {
      margin-bottom: 15px;

      .area-title {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px 0;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;

        .toggle-icon {
          margin-right: 8px;
          font-size: 14px;
          color: #fff;
        }
      }

      .area-devices {
        padding-left: 24px;
      }
    }
    .device-option {
      display: flex;
      align-items: center;
      padding: 6px 0;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;

      &:hover {
        color: #409eff;
      }

      &.active {
        color: #409eff;

        .checkbox {
          border-color: #409eff;
          background: #fff;

          &::after {
            opacity: 1;
          }
        }
      }
      .item-icon {
        width: 26px;
        height: 26px;
        margin: 6px;
      }
      .checkbox {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1px solid #02b2f4;
        margin-right: 8px;
        position: relative;

        &::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 1px;
          color: #409eff;
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.2s;
        }
      }
    }
  }
}
</style>
