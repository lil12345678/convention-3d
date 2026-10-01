<!-- 告警统计 -->
<template>
  <div class="warn-static left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">告警统计</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">告警数量</div>
        <div class="left-item">
          <span>同比</span>
          <span class="up">--</span>
          <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
          <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />
        </div>
        <div class="flex-box">
          <div class="circle-wrapper">
            <img src="../../assets/img/circle-data3.png" class="circle-outer" />
            <div class="circle-inner">
              <div class="num">{{ num }}</div>
              <div class="text">告警数</div>
            </div>
          </div>
          <div class="statistics">
            <div class="stat-item">
              <span class="dot normal"></span>
              <span class="label normal">一般</span>
              <div class="value">{{ levelNormal }} 件</div>
              <div class="percent">{{ levelNormalRate }}%</div>
            </div>
            <div class="stat-item">
              <span class="dot warning"></span>
              <span class="label warning">重要</span>
              <div class="value">{{ levelImportant }} 件</div>
              <div class="percent">{{ levelImportantRate }}%</div>
            </div>
            <div class="stat-item">
              <span class="dot danger"></span>
              <span class="label danger">严重</span>
              <div class="value">{{ levelSevere }} 件</div>
              <div class="percent">{{ levelSevereRate }}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">设备告警趋势</div>
          <div class="tabs">
            <div class="tab-box">
              <span
                :class="['tab-item', { active: activeTab === '日' }]"
                @click="handleTabClick('日')"
                >日</span
              >
              <span
                :class="['tab-item', { active: activeTab === '月' }]"
                @click="handleTabClick('月')"
                >月</span
              >
            </div>
          </div>
        </div>
        <div ref="alarmchartRef1" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { applyChart, getAlarmView } from '@/utils/screenStats'

const alarmchartRef1 = ref(null)
let myChart = null
const activeTab = ref('日')
const num = ref('--') //告警数
const upStatus = ref(false)
const downStatus = ref(false)
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const levelNormal = ref(0)
const levelImportant = ref(0)
const levelSevere = ref(0)
const levelNormalRate = ref(0)
const levelImportantRate = ref(0)
const levelSevereRate = ref(0)
let alarmView = null

onMounted(async () => {
  await nextTick()
  if (alarmchartRef1.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  alarmView = await getAlarmView()
  num.value = alarmView.total
  const [normal, important, severe] = alarmView.levels
  levelNormal.value = normal.count
  levelImportant.value = important.count
  levelSevere.value = severe.count
  levelNormalRate.value = normal.percentage
  levelImportantRate.value = important.percentage
  levelSevereRate.value = severe.percentage
  paintAlarm()
})

const handleTabClick = (tab) => {
  activeTab.value = tab
  paintAlarm()
}
const paintAlarm = () => {
  if (!alarmView) return
  const trend = activeTab.value === '月' ? alarmView.month : alarmView.day
  chartData.value = trend.values
  applyChart(myChart, trend.labels, [trend.values])
}
const initChart = () => {
  myChart = echarts.init(alarmchartRef1.value)
  const option = {
    grid: {
      top: '5%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      axisLine: {
        lineStyle: { color: '#4C5973' },
      },
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: {
        lineStyle: { color: '#4C5973', type: 'dashed' },
      },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        data: chartData.value,
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 222, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 222, 255, 0)' },
          ]),
        },
        lineStyle: {
          width: 2,
          color: '#00DEFF',
        },
      },
    ],
  }
  myChart.setOption(option)
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.warn-static {
  margin-bottom: 10px;
  .left {
    .flex-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .left-item {
      margin-left: 42%;
      margin-top: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 14px;
      span {
        color: #00d0ff;
      }
      img {
        width: 14px;
      }
      .up {
        color: #fff;
      }
    }
    .circle-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;

      .circle-outer {
        position: absolute;
        top: -12px;
        width: 140px;
      }

      .circle-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: -20px;
        .num {
          font-family: DINAlternate;
          font-weight: bold;
          font-size: 26px;
          color: #ffffff;
          position: relative;
        }

        .text {
          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #ffffff;
          line-height: 16px;
          position: relative;
        }
      }
    }

    .statistics {
      .stat-item {
        display: flex;
        align-items: center;
        margin: 12px 0;
        font-size: 14px;
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 10px;
          border: 1px solid #ffffff;
          &.normal {
            background: #03a30e;
          }
          &.warning {
            background: #ffb800;
          }
          &.danger {
            background: #ff4d4f;
          }
        }

        .label {
          width: 100px;
          text-align: left;
          &.normal {
            color: #03a30e;
          }
          &.warning {
            color: #ffb800;
          }
          &.danger {
            color: #ff4d4f;
          }
        }

        .value {
          margin-right: 32px;
          color: #fff;
        }

        .percent {
          color: #fff;
          font-family: DINAlternate;
        }
      }
    }
  }
  .right {
    .chart-header {
      // display: flex;
      // justify-content: space-between;
      // align-items: center;
      margin-bottom: 20px;
      text-align: center;
      position: relative;
      .title {
        font-family: MicrosoftYaHei;
        font-size: 14px;
        color: #ffffff;
      }
    }

    .chart-container {
      width: 100%;
      height: 174px;
    }
  }
}
</style>
