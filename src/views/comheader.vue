<template>
  <div class="header">
    <img src="../assets/img/title.png" class="header-img" />
    <div class="header-left">
      <img src="../assets/img/location.png" alt="" class="img1" />
      <div class="location">--</div>
      <img src="../assets/img/weather.png" alt="" class="img2" />
      <span class="weather">--</span>
    </div>
    <div class="header-center">
      <div class="center-l">
        <div
          class="nav-button margintop1"
          :class="{ navactive: activeButton === '综合态势' }"
          @click="gotocommon"
        >
          综合态势
        </div>
        <div
          class="nav-button"
          :class="{ navactive: activeButton === '安防态势' }"
          @click="gotosec"
        >
          安防态势
        </div>
        <div
          class="nav-button margintop2"
          :class="{ navactive: activeButton === '设备运行' }"
          @click="gotodevice"
        >
          设备运行
        </div>
      </div>
      <div class="center-r">
        <div
          class="nav-button btn-trans margintop2"
          :class="{ navactive: activeButton === '能源管理' }"
          @click="gotoEng"
        >
          <span>能源管理</span>
        </div>
        <div class="nav-button btn-trans"><span>资产管理</span></div>
        <div
          class="nav-button btn-trans margintop1"
          :class="{ navactive: activeButton === '会展信息' }"
          @click="gotoConvention"
        >
          <span>会展信息</span>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="warn-box">
        <img src="../assets/img/warn.png" alt="" class="img3" />
        <div class="warn-num">告警<span>({{ alarmCount }})</span></div>
      </div>

      <div class="user-box" v-if="auth.isAuthenticated">
        <div class="user-name">{{ auth.username || '已登录' }}</div>
        <button class="logout-btn" type="button" @click="onLogout">退出</button>
      </div>

      <div>
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ getDateWeek() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getDateWeek } from '@/utils/date.js'
import { debounce } from '@/utils/commonFunc.js'
import { getAlarmView } from '@/utils/screenStats'
import { useAuthStore } from '@/store/modules/auth'

const NAV_TITLES = {
  '/': '综合态势',
  '/SecSituation': '安防态势',
  '/device': '设备运行',
  '/energy': '能源管理',
  '/convention': '会展信息',
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const currentTime = ref('')
/** 高亮跟随路由，点击、AI 指令、浏览器前进后退都能同步 */
const activeButton = computed(() => NAV_TITLES[route.path] || '')
const alarmCount = ref(0)
let timer = null
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}
const onLogout = () => {
  auth.logout()
}
const go = debounce((path) => router.push(path), 300, true)
const gotocommon = () => go('/')
const gotosec = () => go('/SecSituation')
const gotodevice = () => go('/device')
const gotoEng = () => go('/energy')
const gotoConvention = () => go('/convention')

const loadAlarmCount = async () => {
  if (!auth.isAuthenticated) {
    alarmCount.value = 0
    return
  }
  try {
    const alarms = await getAlarmView()
    alarmCount.value = alarms.pending
  } catch (error) {
    console.warn('告警数加载失败', error)
  }
}
watch(() => auth.sessionVersion, loadAlarmCount)

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadAlarmCount()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.header {
  z-index: 9;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  // background-image: url('@/assets/img/title.png');
  // background-size: 100% 120%;
  // background-repeat: no-repeat;
  color: #ffffff;
  height: 180px;
  .header-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: -1;
  }
  .header-left,
  .header-center,
  .header-right,
  .center-l,
  .center-r {
    display: flex;
    align-items: center;
    padding-top: 12px;
  }
  .header-left,
  .header-right {
    width: 750px;
  }
  .img1 {
    height: 36px;
    margin-left: 64px;
  }
  .img2 {
    height: 56px;
  }
  .location,
  .weather,
  .time,
  .date {
    margin-right: 15px;
    font-size: 16px;
    font-family: MicrosoftYaHei;
  }
  .time {
    font-family: DINAlternate;
  }
  .location {
    margin: 0 70px 0 12px;
  }
  .warn-box {
    position: relative;
    height: 100px;
    margin-right: 68px;
    margin-left: 200px;
  }
  .img3 {
    height: 100px;
  }
  .warn-num {
    position: absolute;
    height: 150px;
    top: 39%;
    left: 41%;
    font-size: 18px;
    font-family: HuXiaoBo;
  }
  .user-box {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 24px;
  }
  .user-name {
    font-size: 16px;
    color: rgba(220, 240, 255, 0.9);
  }
  .logout-btn {
    height: 32px;
    padding: 0 14px;
    border: 1px solid rgba(140, 200, 230, 0.45);
    background: transparent;
    color: #dff4ff;
    cursor: pointer;
    font-size: 14px;
  }
  .logout-btn:hover {
    border-color: rgba(180, 230, 255, 0.8);
  }
  .time {
    font-family: MicrosoftYaHei;
    font-size: 36px;
    background-image: linear-gradient(180deg, #ffffff 0%, #14fbfb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    letter-spacing: 4px;
    font-weight: 600;
  }
  .nav-button {
    width: 136px;
    height: 48px;
    line-height: 48px;
    background-image: url('@/assets/img/btn.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border: none;
    color: #ffffff;
    text-align: center;
    padding: 6px;
    cursor: pointer;
    font-family: 'HuXiaoBo';
    font-size: 18px;
    transition: all 0.3s ease;
  }
  .navactive {
    width: 136px;
    height: 48px;
    line-height: 48px;
    background-image: url('@/assets/img/btn-active.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border: none;
    padding: 6px;
    cursor: pointer;
    font-family: 'HuXiaoBo';
    font-size: 18px;
  }
  .margintop1 {
    margin-top: -10px;
  }
  .margintop2 {
    margin-top: 10px;
  }
  .btn-trans {
    transform: scaleX(-1); /* 水平翻转背景 */
    span {
      display: inline-block;
      transform: scaleX(-1); /* 将文字翻转回正常方向 */
    }
  }
  .header-center {
    width: 1900px;
    display: flex;
    justify-content: space-between;
    // margin-left: -80px;

    .center-l,
    .center-r {
      display: flex;
      gap: 4px;
      margin-top: 16px;
    }
  }
}
</style>
