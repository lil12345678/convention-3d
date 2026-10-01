<!-- 能耗告警 -->
<template>
  <div class="energy-alarm left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">能耗告警</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">能耗告警占比</div>
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c8.png" alt="" />
            <div class="value">{{ num1 }}<span>件</span></div>
            <div class="label">供电告警</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c8-4.png" alt="" />
            <div class="value">{{ num2 }}<span>件</span></div>
            <div class="label">供水告警</div>
          </div>
        </div>
        <div class="progress">
          <div class="progress-item" v-for="(item, index) in alarmList" :key="index">
            <div class="progress-row">
              <div class="text">{{ item.name }}</div>
              <el-progress
                :percentage="item.percentage"
                :show-text="false"
                :stroke-width="10"
                :color="item.color"
              />
              <div class="value-box">
                <span
                  >{{ item.percentage
                  }}<span
                    v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'"
                    class="per"
                    >%</span
                  ></span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">能耗告警趋势(kWh)</div>
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
        <div ref="chartRef19" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { applyChart, getEnergyAlarmView } from '@/utils/screenStats'

const num1 = ref('--')
const num2 = ref('--')
const chartRef19 = ref(null)
let myChart = null
const activeTab = ref('日')
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const alarmList = ref([
  { num: 1, name: '一般', value: '--', percentage: 0, color: '#8BE7FF' },
  { num: 2, name: '重要', value: '--', percentage: 0, color: '#BEFF8B' },
])
let alarmView = null

const paintAlarm = () => {
  if (!alarmView) return
  num1.value = alarmView.electric
  num2.value = alarmView.water
  alarmList.value = alarmView.levels.map((item, index) => ({
    num: index + 1,
    name: item.name,
    value: item.percentage,
    percentage: item.percentage,
    color: item.color,
  }))
  const trend = activeTab.value === '月' ? alarmView.month : alarmView.day
  applyChart(myChart, trend.labels, [trend.values])
}
onMounted(async () => {
  await nextTick()
  if (chartRef19.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  alarmView = await getEnergyAlarmView()
  paintAlarm()
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintAlarm()
}
const initChart = () => {
  myChart = echarts.init(chartRef19.value)
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
const getChartData = () => {
  chartData.value = [40, 20, 80, 60, 30, 20, 90, 40, 60]
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: chartData.value, // 使用最新数据
        },
      ],
    })
  }
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.energy-alarm {
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  padding-bottom: 10px;
  .title {
    margin-top: 0;
  }
  .left {
    .energy-cards {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 5px;
      margin-top: 20px;
      margin-bottom: 18px;
      .card {
        width: 200px;
        position: relative;
        color: #fff;
        img {
          width: 212px;
          height: 70px;
          position: absolute;
          top: 0;
          left: 0;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .value {
          font-size: 26px;
          margin-top: 6px;
          position: relative;
          z-index: 1;
          font-family: DINAlternate;
          span {
            font-size: 14px;
            margin-left: 5px;
          }
        }

        .label {
          position: relative;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 10px;
        }
        .img-icon {
          width: 80px;
        }
      }
    }
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
      // margin-top: 10px;
    }
  }
  .right {
    .chart-container {
      width: 100%;
      height: 130px;
    }
  }
}
.progress {
  // padding: 20px;
  padding-bottom: 0;
  .progress-item {
    margin-bottom: 4px;
    .progress-row {
      display: flex;
      align-items: center;
      gap: 10px;

      .text {
        width: 80px;
        text-align: left;
        font-family: MicrosoftYaHei;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }
      .num {
        font-family: Isemin;
      }
      .el-progress {
        flex: 1;
      }

      .value-box {
        width: 60px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        text-align: right;
        .percentage {
          color: #fff;
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
</style>
