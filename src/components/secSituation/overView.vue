<!-- 安防总览2 -->
<template>
  <div class="sec-overview left-right-content">
    <div class="content">
      <div class="left">
        <div class="title">安防告警监测</div>
        <div class="stat-item1">
          <div class="span-text">{{ num1 }}</div>
          <div class="span-text2">告警总数(件)</div>
          <img src="../../assets/img/up.png" alt="" class="up-icon" />
        </div>

        <div class="progress">
          <div class="progress-item">
            <div class="progress-row">
              <span class="label">处理中</span>
              <el-progress
                :percentage="percentage1"
                :show-text="false"
                :stroke-width="15"
                color="#00B4FF"
              />
              <div class="value-box">
                <span>{{ statusHandling }}件</span>
                <span class="percentage">{{ percentage1 }}%</span>
              </div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-row">
              <span class="label">已处理</span>
              <el-progress
                :percentage="percentage2"
                :show-text="false"
                :stroke-width="15"
                color="#AFFFCC"
              />
              <div class="value-box">
                <span>{{ statusDone }}件</span>
                <span class="percentage">{{ percentage2 }}%</span>
              </div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-row">
              <span class="label">未处理</span>
              <el-progress
                :percentage="percentage3"
                :show-text="false"
                :stroke-width="15"
                color="#FFB800"
              />
              <div class="value-box">
                <span>{{ statusPending }}件</span>
                <span class="percentage">{{ percentage3 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">安防事件趋势</div>
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
              <span
                :class="['tab-item', { active: activeTab === '年' }]"
                @click="handleTabClick('年')"
                >年</span
              >
            </div>
          </div>
        </div>
        <div ref="chartRef4" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { applyChart, getAlarmView } from '@/utils/screenStats'

const num1 = ref('--')
const percentage1 = ref(1)
const percentage2 = ref(1)
const percentage3 = ref(1)
const chartRef4 = ref(null)

let myChart = null
const activeTab = ref('日')
const ChartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const statusHandling = ref(0)
const statusDone = ref(0)
const statusPending = ref(0)
let alarmView = null

const paintOverview = () => {
  if (!alarmView) return
  const key = activeTab.value === '年' ? 'year' : activeTab.value === '月' ? 'month' : 'day'
  const trend = alarmView[key]
  ChartData.value = trend.values
  applyChart(myChart, trend.labels, [trend.values])
}
onMounted(async () => {
  await nextTick()
  if (chartRef4.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  alarmView = await getAlarmView()
  num1.value = alarmView.total
  const handling = alarmView.statuses.find((item) => item.name === '处理中')
  const done = alarmView.statuses.find((item) => item.name === '已处理')
  const pending = alarmView.statuses.find((item) => item.name === '未处理')
  percentage1.value = handling?.percentage || 0
  percentage2.value = done?.percentage || 0
  percentage3.value = pending?.percentage || 0
  statusHandling.value = handling?.count || 0
  statusDone.value = done?.count || 0
  statusPending.value = pending?.count || 0
  paintOverview()
})

const handleTabClick = (tab) => {
  activeTab.value = tab
  paintOverview()
}
const getdata = () => {
  const data = 123590

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  percentage1.value = 70
  percentage2.value = 50
  percentage3.value = 20
}
const initChart = () => {
  myChart = echarts.init(chartRef4.value)
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
        data: ChartData.value,
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
const getChartData = () => {
  ChartData.value = [40, 20, 80, 60, 30, 20, 90, 40, 60]
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: ChartData.value, // 使用最新数据
        },
      ],
    })
  }
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
.sec-overview {
  border-radius: 0 0 24px 24px;
  .left {
    .stat-item1 {
      width: 100%;
      text-align: center;
      margin-top: 20px;
      .up-icon {
        width: 130px;
        height: 18px;
      }
      .span-text {
        font-family: DINAlternate;
        font-weight: bold;
        font-size: 26px;
        color: #35b4ff;
        line-height: 30px;
        text-align: center;
      }
      .span-text2 {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 12px;
        color: #ffffff;
        margin-bottom: -10px;
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
  }
  .right {
    .chart-container {
      width: 100%;
      height: 200px;
    }
  }

  .progress {
    padding: 20px;
    padding-bottom: 0;
    .progress-item {
      margin-bottom: 15px;
      .progress-row {
        display: flex;
        align-items: center;
        gap: 10px;

        .label {
          width: 50px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .el-progress {
          flex: 1;
        }

        .value-box {
          width: 100px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          span {
            padding-right: 12px;
          }
          .percentage {
            color: #fff;
            padding-right: 0;
          }
        }
      }
    }

    :deep(.el-progress-bar__outer) {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-radius: 6px;
    }
    :deep(.el-progress-bar__inner) {
      border-radius: 6px;
    }
  }
}
</style>
