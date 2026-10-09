<template>
  <div class="btn-box">
    <div
      v-for="tab in tabList"
      :key="tab.name"
      class="btn-tab-item"
      :class="{ tabactive: activeTab === tab.name }"
      @click.stop="handleTabChange(tab)"
    >
      <img :src="activeTab === tab.name ? tab.activeIcon : tab.icon" alt="" class="tab-icon" />
      <span class="tab-name">{{ tab.name }}</span>
    </div>
  </div>
  <!-- 分层场馆选择下拉框 -->
  <div class="down-select build-select" v-show="showBuildSelect">
    <div class="scroll">
      <div
        v-for="option in buildOptions"
        :key="option.value"
        class="weather-item"
        :class="{ active: currentBuild === option.value }"
        @click.stop="handleBuildChange(option)"
      >
        <img src="../assets/icon/tab-3.png" alt="" class="build-icon" />
        <span>{{ option.name }}</span>
      </div>
    </div>
  </div>
  <!-- 昼夜选择下拉框 -->
  <div class="down-select day-night-select" v-show="showDayNightSelect">
    <div
      v-for="option in dayNightOptions"
      :key="option.value"
      class="weather-item"
      :class="{ active: currentDayNight === option.value }"
      @click.stop="handleDayNightChange(option.value)"
    >
      <img :src="option.icon" alt="" class="weather-icon" />
      <span>{{ option.name }}</span>
    </div>
  </div>

  <!-- 天气选择下拉框 -->
  <div class="down-select" v-show="showWeatherSelect">
    <div
      v-for="option in weatherOptions"
      :key="option.value"
      class="weather-item"
      :class="{ active: currentWeather === option.value }"
      @click.stop="handleWeatherChange(option.value)"
    >
      <img :src="option.icon" alt="" class="weather-icon" />
      <span>{{ option.name }}</span>
    </div>
  </div>
  <div class="down-select roam-select" v-show="showRoamSelect">
    <div
      v-for="option in roamOptions"
      :key="option.value"
      class="weather-item"
      :class="{ active: currentRoam === option.value }"
      @click.stop="handleRoamChange(option.value)"
    >
      <!-- <img :src="`@/assets/icon/route.png`" alt="" class="weather-icon" v-if="option.icon" /> -->
      <span style="padding: 8px 16px">{{ option.name }}</span>
    </div>
  </div>
  <div class="level-select" v-show="showlevelSel">
    <div
      v-for="option in levelOptions"
      :key="option.value"
      class="item"
      :class="{ active: currentLevel === option.value }"
      @click.stop="handleLevelChange(option.value)"
    >
      <span style="padding: 8px 16px">{{ option.name }}</span>
    </div>
  </div>
  <div class="level-select" v-show="showRoamStart">
    <div @click.stop="handleRoamStart">{{ isStart ? '漫游开始' : '漫游暂停' }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import overview from '../assets/icon/tab-1.png'
import overviewActive from '../assets/icon/tab-1-active.png'
import stadium from '../assets/icon/tab-2.png'
import stadiumActive from '../assets/icon/tab-2-active.png'
import level from '../assets/icon/tab-3.png'
import levelActive from '../assets/icon/tab-3-active.png'
import sunnight from '../assets/icon/daynt.png'
import weather from '../assets/icon/weather.png'
import heatmap from '../assets/icon/tab-6.png'
import heatmapActive from '../assets/icon/tab-6-active.png'
import roam from '../assets/icon/tab-7.png'
import roamActive from '../assets/icon/tab-7-active.png'

import sun from '../assets/icon/tab-5.png'
import cloud from '../assets/icon/cloud.png'
import rain from '../assets/icon/rain2.png'

import day from '../assets/icon/tab-4.png'
import night from '../assets/icon/tab-4-active.png'

import eventHub from '@/utils/eventHub'
import { debounce } from '@/utils/commonFunc.js'
import { registerSceneController } from '@/ai/aiCommandBus'

const activeTab = ref('总览')
const currentDayNight = ref('day')
const currentWeather = ref('sunny')
const currentRoam = ref(null)
const currentBuild = ref(null)
const currentLevel = ref('3')
const showDayNightSelect = ref(false)
const showWeatherSelect = ref(false)
const showRoamSelect = ref(false)
const showBuildSelect = ref(false)
const showlevelSel = ref(false) //控制楼层选择
const showRoamStart = ref(false) //控制路线选择
const isStart = ref(false) //控制路线选择
const dayNightTimer = ref(null) // 定时器存储变量
const weatherTimer = ref(null)

const tabList = [
  { name: '总览', icon: overview, activeIcon: overviewActive },
  { name: '场馆', icon: stadium, activeIcon: stadiumActive },
  { name: '分层', icon: level, activeIcon: levelActive },
  { name: '昼夜', icon: sunnight, activeIcon: sunnight },
  { name: '天气', icon: weather, activeIcon: weather },
  { name: '热力图', icon: heatmap, activeIcon: heatmapActive },
  { name: '漫游', icon: roam, activeIcon: roamActive },
]
const buildOptions = [
  { name: '1号馆', value: '1' },
  { name: '2号馆', value: '2' },
  { name: '3号馆', value: '3' },
  { name: '4号馆', value: '4' },
  { name: '5号馆', value: '5' },
  { name: '6号馆', value: '6' },
  { name: '7号馆', value: '7' },
  { name: '8号馆', value: '8' },
  { name: '9号馆', value: '9' },
  { name: '10号馆', value: '10' },
  { name: '11号馆', value: '11' },
  { name: '12号馆', value: '12' },
  { name: '13号馆', value: '13' },
  { name: '14号馆', value: '14' },
  { name: '15号馆', value: '15' },
  { name: '16号馆', value: '16' },
  { name: '主登录厅', value: '17' },
  { name: '次登录厅', value: '18' },
  { name: '东登录厅', value: '19' },
]
const levelOptions = [
  { name: '1F', value: '1' },
  { name: '恢复', value: '2' },
  { name: '全部展开', value: '3' },
]
const dayNightOptions = [
  { name: '白天', value: 'day', icon: day },
  { name: '夜晚', value: 'night', icon: night },
]
const weatherOptions = [
  { name: '晴', value: 'sunny', icon: sun },
  { name: '阴', value: 'cloudy', icon: cloud },
  { name: '雨', value: 'rainy', icon: rain },
]

const roamOptions = [
  { name: '路线一', value: 'route1' },
  { name: '路线二', value: 'route2' },
]

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  // AI 指令复用按钮的处理函数，保证面板高亮与 3D 场景状态一致
  registerSceneController({
    switchTab: (name) => {
      const tab = tabList.find((item) => item.name === name)
      if (tab) handleTabChange(tab)
    },
    selectBuilding: (name) => {
      const option = buildOptions.find((item) => item.name === name)
      if (option) handleBuildChange(option)
    },
    selectFloor: (value) => handleLevelChange(value),
    selectRoute: (value) => handleRoamChange(value),
    startRoam: () => {
      if (!isStart.value) handleRoamStart()
    },
    getState: () => ({
      tab: activeTab.value,
      building: currentBuild.value,
      route: currentRoam.value,
    }),
  })
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  registerSceneController(null)
})
function handleClickOutside(event) {
  // 检查点击事件是否来自下拉框内部
  const isClickInDropdown = ['.down-select', '.level-select'].some((selector) => {
    const element = event.target.closest(selector)
    return element !== null
  })

  // 如果点击的不是下拉框内部，则关闭所有下拉框
  if (!isClickInDropdown) {
    showBuildSelect.value = false
    showDayNightSelect.value = false
    showWeatherSelect.value = false
    showRoamSelect.value = false
    showlevelSel.value = false
  }
}
const handleTabChange = debounce(
  (tab) => {
    // console.log('测试防抖-点击了')
    activeTab.value = tab.name
    //打开下拉框，默认选中
    showBuildSelect.value = tab.name === '分层'
    showDayNightSelect.value = tab.name === '昼夜'
    showWeatherSelect.value = tab.name === '天气'
    showRoamSelect.value = tab.name === '漫游'
    //除天气、昼夜、漫游，其余关闭下拉框
    if (tab.name !== '天气' && tab.name !== '昼夜' && tab.name !== '漫游') {
      showDayNightSelect.value = false
      showWeatherSelect.value = false
      showRoamSelect.value = false
    }
    if (tab.name === '场馆') {
      eventHub.emit('stadiumLabelCallback')
      clearDeviceLabel() //清空所有设备标签
    } else {
      eventHub.emit('hideStadiumLabelCallback')
    }
    if (tab.name === '热力图') {
      eventHub.emit('showHeatMapCallback')
    } else {
      eventHub.emit('hideHeatMapCallback')
    }
    if (tab.name === '昼夜') {
      currentDayNight.value = 'day' //点击tab时，默认选中白天
    }
    if (tab.name === '天气') {
      currentWeather.value = 'sunny' //点击tab时，默认选中晴
      // eventHub.emit('weatherCallback', 'sunny')
    }
    if (tab.name === '分层') {
    } else {
      showlevelSel.value = false
    }
    if (tab.name !== '总览') {
      clearDeviceLabel()
    }
    if (tab.name === '漫游') {
      currentRoam.value = null
    }
    showRoamStart.value = false
    eventHub.emit('changeCameraPosition', {
      position: { x: 421, y: 516, z: 816 }, //{x: '354.03', y: '525.82', z: '736.39'}
      target: { x: 0, y: 0, z: 0 },
      type: 'view',
    })
    //关闭设备菜单
    eventHub.emit('hideDeviceMenuCallback')
    //关闭通道
    // eventHub.emit('hideComposerCallback')
    //无论点击哪个tab都重置为白天，
    eventHub.emit('dayCallback', 'tabchange')
    eventHub.emit('weatherCallback', { weather: 'sunny', type: 'tabchange' }) //无论点击哪个tab都清理天气,重置为晴天
    eventHub.emit('walkCallback') //清除漫游
    eventHub.emit('buildSelectCallback') //恢复分层
    currentBuild.value = null

    leftRightPanel(tab)
  },
  400,
  true
)
const handleDayNightChange = debounce(
  (time) => {
    currentDayNight.value = time
    eventHub.emit('animationLoading', 'dayNightChange')
    if (dayNightTimer.value) clearTimeout(dayNightTimer.value)
    dayNightTimer.value = setTimeout(() => {
      if (time === 'day') {
        eventHub.emit('dayCallback', 'dayNightChange')
      } else {
        eventHub.emit('nightCallback')
      }
      // 执行完成后清除定时器
      dayNightTimer.value = null
    }, 300)
  },
  100,
  true
)
const handleBuildChange = debounce(
  (build) => {
    currentBuild.value = build.value
    showlevelSel.value = true
    currentLevel.value = '3'
    eventHub.emit('buildSelectCallback', build.name)
  },
  500,
  true
)
const handleLevelChange = debounce(
  (level) => {
    currentLevel.value = level
    eventHub.emit('levelSelectCallback', level)
  },
  500,
  true
)
const handleWeatherChange = debounce(
  (weather) => {
    currentWeather.value = weather
    eventHub.emit('animationLoading', 'weatherChange')
    if (weatherTimer.value) clearTimeout(weatherTimer.value)
    weatherTimer.value = setTimeout(() => {
      eventHub.emit('weatherCallback', { weather: weather, type: 'weatherChange' })

      if (currentWeather.value === 'sunny') {
        eventHub.emit('dayCallback', 'weatherChange')
      } else if (currentWeather.value === 'cloudy') {
        eventHub.emit('cloudyCallback')
      } else if (currentWeather.value === 'rainy') {
        eventHub.emit('rainyCallback')
      }
      weatherTimer.value = null
    }, 300)
  },
  100,
  true
)

const handleRoamChange = debounce(
  (route) => {
    currentRoam.value = route
    eventHub.emit('walkCallback', route)
    showRoamStart.value = true
    isStart.value = false
  },
  500,
  true
)
const handleRoamStart = debounce(() => {
  isStart.value = !isStart.value
  eventHub.emit('walkStartPause', isStart.value)
  // showRoamSelect.value = false
})
const clearDeviceLabel = () => {
  //清空所有设备标签
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
}
const leftRightPanel = (tab) => {
  const leftPanel = document.querySelector('.left-panel')
  const rightPanel = document.querySelector('.right-panel')

  if (tab.name === '场馆') {
    // 先移除显示类，再添加隐藏类（确保类名变化触发过渡）
    leftPanel?.classList.remove('slide-in')
    rightPanel?.classList.remove('slide-in')
    leftPanel?.classList.add('slide-out')
    rightPanel?.classList.add('slide-out')
  } else if (tab.name === '总览') {
    // 先移除隐藏类，再添加显示类（确保类名变化触发过渡）
    leftPanel?.classList.remove('slide-out')
    rightPanel?.classList.remove('slide-out')
    leftPanel?.classList.add('slide-in')
    rightPanel?.classList.add('slide-in')
  }
}
</script>

<style lang="scss" scoped>
// 复制原来的样式
.btn-box {
  position: absolute;
  top: 120px;
  left: 26%;
  display: flex;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  z-index: 99;
  .btn-tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border-radius: 6px;
    padding-bottom: 6px;

    .tab-icon {
      width: 64px;
      height: 48px;
      margin-bottom: 4px;
    }

    .tab-name {
      font-size: 14px;
      color: #fff;
    }
  }
  .tabactive {
    background: transparent;
    border: 1px solid rgba(64, 158, 255, 0.5);
  }
}

.down-select {
  position: absolute;
  top: 218px;
  left: calc(26% + 268px);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  z-index: 10;
  min-width: 120px;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(0, 0, 0, 0.3);
  }

  .weather-item {
    display: flex;
    align-items: center;
    // padding: 8px 16px;
    cursor: pointer;
    color: #fff;
    transition: all 0.3s ease;
    border-radius: 4px;
    margin-bottom: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(64, 158, 255, 0.2);
      border: 1px solid rgba(64, 158, 255, 0.5);
    }

    .weather-icon {
      width: 56px;
      height: 38px;
      margin-right: 8px;
    }

    span {
      font-size: 14px;
    }
  }
}

.roam-select {
  left: calc(26% + 416px);
}
.day-night-select {
  left: calc(26% + 196px);
}
.build-select {
  left: calc(26% + 120px);

  .scroll {
    padding: 8px 0;
    height: 118px;
    overflow: hidden;
    overflow-y: auto;
  }
  .build-icon {
    width: 52px;
  }
}
.level-select {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  z-index: 10;
  color: #fff;
  display: flex;
  align-items: center;
  .item {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(64, 158, 255, 0.2);
      border: 1px solid rgba(64, 158, 255, 0.5);
    }
  }
}
</style>
