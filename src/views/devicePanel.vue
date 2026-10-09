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

  <div class="tree-panel" v-for="item in deviceList" :key="item.id" v-show="activeDevice === item.id">
    <div class="tree-header">
      <span>{{ item.name }}</span>
    </div>
    <div class="tree-content" v-if="item.groups">
      <div v-for="group in item.groups" :key="group.name" class="tree-area">
        <div class="area-title" @click="toggleArea(group)">
          <span class="toggle-icon">{{ group.expanded ? '▼' : '▶' }}</span>
          <span>{{ group.name }}</span>
        </div>
        <div class="area-devices" v-show="group.expanded">
          <div
            v-for="leaf in group.leaves"
            :key="leaf.name"
            class="device-option"
            :class="{ active: selectedLeaf === leaf.name }"
            @click="selectLeaf(leaf)"
          >
            <span class="checkbox"></span>
            <span>{{ leaf.name }}（{{ leaf.total }}）</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tree-content" v-else>
      <div
        v-for="leaf in item.leaves"
        :key="leaf.name"
        class="device-option"
        :class="{ active: selectedLeaf === leaf.name }"
        @click="selectLeaf(leaf)"
      >
        <span class="checkbox"></span>
        <img :src="leaf.icon" alt="" class="item-icon" v-if="leaf.icon" />
        <span>{{ leaf.name }}（{{ leaf.total }}）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import eventHub from '@/utils/eventHub'
import { debounce } from '@/utils/commonFunc.js'
import { registerDeviceController } from '@/ai/aiCommandBus'
import { useAuthStore } from '@/store/modules/auth'
import { isLoggedIn } from '@/utils/conventionAuth'
import { getDevices } from '@/utils/screenStats'

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

const CATEGORY_ICONS = { monitor, security, elevator, energy }
const LEAF_ICONS = {
  入侵探测器: d1,
  停车场匝道: d2,
  门禁: d3,
  照明: d4,
  冷热源: d5,
  空调: d6,
  电表: d7,
  水表: d8,
}
/** 3D 模型里有标签点位的设备类型 → tagManage 的事件前缀 */
const SCENE_LABELS = {
  空调用电: 'ac1',
  集中空调: 'ac2',
  辐射空调: 'ac3',
  应急照明: 'ac4',
  照明插座: 'ac5',
  景观照明: 'ac6',
  入侵探测器: 'security',
  停车场匝道: 'parking',
  门禁: 'door',
}
/** 监控设备按设备组展示成树，其余分类平铺 */
const TREE_CATEGORIES = ['monitor']

const auth = useAuthStore()
const activeDevice = ref('')
const selectedLeaf = ref('')
const deviceList = ref([])

function buildDeviceList(devices) {
  const categories = new Map()
  devices.forEach((device) => {
    if (!categories.has(device.category)) {
      categories.set(device.category, { id: device.category, name: device.category_name, rows: [] })
    }
    categories.get(device.category).rows.push(device)
  })
  return [...categories.values()].map(({ id, name, rows }) => {
    const leafMap = new Map()
    rows.forEach((row) => {
      if (!leafMap.has(row.leaf_type)) {
        leafMap.set(row.leaf_type, { name: row.leaf_type, group: row.group_name, total: 0, icon: LEAF_ICONS[row.leaf_type] })
      }
      leafMap.get(row.leaf_type).total += 1
    })
    const leaves = [...leafMap.values()]
    const item = { id, name, icon: CATEGORY_ICONS[id], leaves }
    if (TREE_CATEGORIES.includes(id)) {
      const groups = new Map()
      leaves.forEach((leaf) => {
        if (!groups.has(leaf.group)) groups.set(leaf.group, { name: leaf.group, expanded: true, leaves: [] })
        groups.get(leaf.group).leaves.push(leaf)
      })
      item.groups = [...groups.values()]
    }
    return item
  })
}

async function loadDevices() {
  if (!isLoggedIn()) {
    deviceList.value = []
    return
  }
  deviceList.value = buildDeviceList(await getDevices())
}

function hideSceneLabels() {
  Object.values(SCENE_LABELS).forEach((key) => eventHub.emit(`hide${key}LabelCallback`))
}

watch(() => auth.sessionVersion, loadDevices)

onMounted(() => {
  loadDevices()
  eventHub.on('hideDeviceMenuCallback', hidemenu)
  document.addEventListener('mousedown', handleClickOutside)
  registerDeviceController({
    openCategory(name) {
      const item = deviceList.value.find((row) => row.name === name || row.id === name)
      if (!item) return false
      if (activeDevice.value !== item.id) handleDeviceClick(item)
      return true
    },
    selectDevice(name) {
      const item = deviceList.value.find((row) => row.leaves.some((leaf) => leaf.name === name))
      if (!item) return false
      if (activeDevice.value !== item.id) handleDeviceClick(item)
      selectLeaf(item.leaves.find((leaf) => leaf.name === name))
      return true
    },
    getState() {
      return {
        category: deviceList.value.find((row) => row.id === activeDevice.value)?.name || null,
        device: selectedLeaf.value || null,
      }
    },
    listCategories: () => deviceList.value.map((row) => row.name),
    listDevices: () => deviceList.value.flatMap((row) => row.leaves.map((leaf) => leaf.name)),
  })
})
onBeforeUnmount(() => {
  eventHub.off('hideDeviceMenuCallback', hidemenu)
  document.removeEventListener('mousedown', handleClickOutside)
  registerDeviceController(null)
})

function handleClickOutside(event) {
  if (!event.target.closest('.tree-panel')) hidemenu()
}

function hidemenu() {
  activeDevice.value = ''
}

const handleDeviceClick = debounce(
  (item) => {
    activeDevice.value = item.id
    selectedLeaf.value = ''
    hideSceneLabels()
    eventHub.emit('hideDeviceInfo')
  },
  300,
  true
)

const toggleArea = debounce(
  (group) => {
    group.expanded = !group.expanded
  },
  300,
  true
)

const selectLeaf = debounce(
  (leaf) => {
    selectedLeaf.value = leaf.name
    Object.entries(SCENE_LABELS).forEach(([name, key]) => {
      eventHub.emit(name === leaf.name ? `${key}LabelCallback` : `hide${key}LabelCallback`)
    })
    eventHub.emit('hideDeviceInfo')
    eventHub.emit('hideStadiumLabelCallback')
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
