<!-- 设备告警占比 -->
<template>
  <div class="dev-num left-right-content">
    <div class="content">
      <div class="left">
        <div class="title">设备告警占比</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="rightdata" :total="total" :text="text" :per="per" />
          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">
                {{ item.percentage
                }}<span v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'"
                  >%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">设备告警趋势(个)</div>
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
        <div ref="chartRef16" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import CirclePercentage from '@/components/commonVue/circlePercentage.vue'
import { applyChart, getAlarmView } from '@/utils/screenStats'
const chartRef16 = ref(null)

let myChart = null
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const activeTab = ref('日')
const text = ref('弱电工程')
const per = ref('--')
const rightdata = ref([
  { percentage: '--', color: '#40F0FF', type: 'one', label: '弱电工程' }, // 一般
  { percentage: '--', color: '#807E6F', type: 'two', label: '消防工程' }, // 较急
  { percentage: '--', color: '#807E6F', type: 'three', label: '暖通工程' }, // 紧急
  { percentage: '--', color: '#3FD385', type: 'four', label: '电气工程' }, // 特急
  { percentage: '--', color: '#3F55D3', type: 'five', label: '给排数工程' }, // 特急
])
const total = ref(null)
let alarmView = null

onMounted(async () => {
  await nextTick()
  if (chartRef16.value) {
    initChart()

    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  alarmView = await getAlarmView()
  const colors = ['#40F0FF', '#807E6F', '#3FD385', '#3F55D3', '#feb817']
  const types = ['one', 'two', 'three', 'four', 'five']
  rightdata.value = alarmView.byType.map((item, index) => ({
    percentage: item.percentage,
    color: colors[index % colors.length],
    type: types[index % types.length],
    label: item.name,
  }))
  total.value = alarmView.total
  text.value = alarmView.byType[0]?.name || '告警'
  per.value = `${alarmView.byType[0]?.percentage || 0}%`
  paintAlarm()
})
const paintAlarm = () => {
  if (!alarmView) return
  const trend = activeTab.value === '月' ? alarmView.month : alarmView.day
  chartData.value = trend.values
  applyChart(myChart, trend.labels, [trend.values])
}
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintAlarm()
}

const initChart = () => {
  myChart = echarts.init(chartRef16.value)
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
      data: [],
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
            { offset: 0, color: 'rgba(255, 184, 0, 0.3)' },
            { offset: 0.5, color: 'rgba(255, 184, 0, 0.2)' },
            { offset: 1, color: 'rgba(76, 89, 115, 0.1)' },
          ]),
        },
        lineStyle: {
          width: 2,
          color: '#FFB800',
        },
      },
    ],
  }
  myChart.setOption(option)
}
onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  window.removeEventListener('resize', () => {
    myChart && myChart.resize()
  })
})
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.dev-num {
  border-radius: 0 0 24px 24px;
  margin-bottom: 0;
  .title {
    margin-bottom: 32px;
  }
  .left {
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
        &.one {
          background: #40f0ff;
        }
        &.two {
          background: #807e6f;
        }
        &.three {
          background: #feb817;
        }
        &.four {
          background: #3fd385;
        }
        &.five {
          background: #4a17ff;
        }
      }

      .label {
        width: 80px;
        margin-right: 80px;
        &.one {
          color: #40f0ff;
        }
        &.two {
          color: #807e6f;
        }
        &.three {
          color: #feb817;
        }
        &.four {
          color: #3fd385;
        }
        &.five {
          color: #4a17ff;
        }
      }

      .value {
        // margin-right: 32px;
        color: #fff;
      }

      .percent {
        color: #fff;
        font-family: DINAlternate;
      }
    }
  }
  .flex-box {
    display: flex;
    width: 100%;
  }
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
      margin-top: 10px;
    }
  }
  .right {
    .chart-container {
      width: 100%;
      height: 174px;
    }
  }
}
</style>
