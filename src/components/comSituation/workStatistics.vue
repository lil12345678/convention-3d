<!-- 工单统计 -->
<template>
  <div class="work-static left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">工单统计</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">工单数量</div>
        <div class="flex-box">
          <circleProgress
            :percentage="percentage"
            :title="progresstitle"
            :color="'#00D0FF'"
            :progressOffset="progressOffset"
          />
          <div class="statistics">
            <div class="data-row">
              <div class="data-box">
                <div class="num">{{ num1 }}</div>
                <img src="../../assets/img/7.png" class="icon" />
                <div class="label">今日工单</div>
              </div>
              <img src="../../assets/img/49.png" class="icon2" />
              <div class="data-box border2">
                <div class="num">{{ num2 }}</div>
                <img src="../../assets/img/7.png" class="icon" />
                <div class="label">工单总数</div>
              </div>
            </div>
            <div class="status-row">
              <div class="status-item">
                <span class="label">待处理</span>
                <span class="value">{{ statusNum1 }} 个</span>
              </div>
              <div class="status-item">
                <span class="label">处理中</span>
                <span class="value">{{ statusNum2 }} 个</span>
              </div>
              <div class="status-item">
                <span class="label">已处理</span>
                <span class="value">{{ statusNum3 }} 个</span>
              </div>
              <div class="status-item">
                <span class="label">已超期</span>
                <span class="value">{{ statusNum4 }} 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">工单趋势</div>
        </div>
        <div ref="chartRef3" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import circleProgress from '../commonVue/circleProgress.vue'

const percentage = ref('--')
const progresstitle = ref('工单完成率')
const circumference = 2 * Math.PI * 45
const progressOffset = computed(() => {
  const per = Number(percentage.value)
  if (!isNaN(per) && typeof per === 'number') {
    return circumference * (1 - percentage.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
const num1 = ref('--')
const num2 = ref('--')
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const statusNum1 = ref('--')
const statusNum2 = ref('--')
const statusNum3 = ref('--')
const statusNum4 = ref('--')

const chartRef3 = ref(null)
let myChart = null

onMounted(async () => {
  // getPercent()
  await nextTick()
  if (chartRef3.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }

  // getChartData()
})
const getPercent = () => {
  const data = 29.2918
  if (data > 100) {
    percentage.value = 100
  } else {
    percentage.value = Math.round(data)
  }
}
const initChart = () => {
  myChart = echarts.init(chartRef3.value)
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
            { offset: 0, color: 'rgba(0, 255, 127, 0.3)' },
            { offset: 1, color: 'rgba(0, 255, 127, 0.05)' },
          ]),
        },
        lineStyle: {
          width: 2,
          color: '#00FF7F',
        },
      },
    ],
  }
  myChart.setOption(option)
}
const getChartData = () => {
  chartData.value = [40, 20, 80, 60, 30, 20, 90, 40, 60]
  const labels = ['1', '2', '3', '4', '5', '6', '7']
  if (myChart) {
    myChart.setOption({
      xAxis: { data: labels },
      series: [{ data: chartData.value }],
    })
  }
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.work-static {
  margin-bottom: 10px;

  .left {
    .flex-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .circle-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
      text-align: center;
      margin: 0 10px;
      .circle-outer {
        position: absolute;
        left: 0;
        top: -12px;
        width: 140px;
      }

      .num {
        line-height: 120px;
        font-family: DINAlternate, DINAlternate;
        font-weight: bold;
        font-size: 26px;
        color: #ffffff;
        position: relative;
      }

      .text {
        font-size: 14px;
        color: #00d0ff;
        margin-top: 20px;
      }
    }
    .statistics {
      flex: 1;
      padding: 20px 10px 0 20px;

      .data-row {
        display: flex;
        .icon {
          width: 110px;
        }
        .icon2 {
          width: 40px;
          height: 8px;
          margin: 0 -18px;
        }
        .data-box {
          text-align: center;
          width: 130px;
          height: 90px;
          background: linear-gradient(
            180deg,
            rgba(71, 192, 255, 0.3) 0%,
            rgba(205, 230, 255, 0) 100%
          );
          border-radius: 12px 0px 0px 12px;

          .num {
            font-family: DINAlternate;
            font-weight: bold;
            font-size: 26px;
            color: #ffffff;
            margin-top: 12px;
            margin-bottom: -20px;
          }

          .label {
            font-family: MicrosoftYaHei;
            font-size: 14px;
            color: #00d0ff;
          }
        }
        .border2 {
          border-radius: 0 12px 12px 0;
        }
      }

      .status-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding-top: 20px;
        .status-item {
          display: flex;
          align-items: center;
          font-size: 14px;

          .label {
            color: #00d0ff;
            width: 80px;
            text-align: left;
          }

          .value {
            color: #fff;
            font-family: DINAlternate;
          }
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
        font-size: 14px;
        color: #fff;
      }
    }

    .chart-container {
      width: 100%;
      height: 174px;
    }
  }
}
</style>
