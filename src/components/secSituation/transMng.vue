<!-- 通行管理 -->
<template>
  <div class="sec-trans left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">通行管理</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">车流量监测</div>
        <div class="flex-box">
          <circleProgress
            :percentage="percentage"
            :title="progresstitle"
            :color="'#aefecb'"
            :progressOffset="progressOffset"
          />
          <div class="statistics">
            <div class="data-box">
              <div class="item">
                <div class="text">总车位</div>
                <div class="num">{{ num2 }}</div>
              </div>
              <div class="item">
                <div class="text">已使用</div>
                <div class="num">{{ num3 }}</div>
              </div>
              <div class="item">
                <div class="text">未使用</div>
                <div class="num">{{ num4 }}</div>
              </div>
            </div>
            <div class="line"></div>
            <div class="data-box">
              <div class="item">
                <div class="text">社会车辆</div>
                <div class="num">{{ num5 }}</div>
              </div>
              <div class="item">
                <div class="text">物流车辆</div>
                <div class="num">{{ num6 }}</div>
              </div>
              <div class="item">
                <div class="text">工作车辆</div>
                <div class="num">{{ num7 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">各场馆人流量分析(实时)</div>
          <div class="text">
            当前在馆总人数 <span> {{ pNum }} </span> 人
          </div>
        </div>
        <div ref="chartRef5" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

import circleProgress from '../commonVue/circleProgress.vue'
import { applyChart, getCrowd, getParking } from '@/utils/screenStats'

const num2 = ref('--')
const num3 = ref('--')
const num4 = ref('--')
const num5 = ref('--')
const num6 = ref('--')
const num7 = ref('--')
const pNum = ref('--')
const chartRef5 = ref(null)
let myChart = null
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])

const percentage = ref('--')
const progresstitle = ref('车位使用率')
const circumference = 2 * Math.PI * 45
const progressOffset = computed(() => {
  const per = Number(percentage.value)
  if (!isNaN(per) && typeof per === 'number') {
    return circumference * (1 - percentage.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
onMounted(async () => {
  await nextTick()
  if (chartRef5.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  const [parking, crowd] = await Promise.all([getParking(), getCrowd()])
  percentage.value = parking.usage_rate
  num2.value = parking.total_spaces
  num3.value = parking.used_spaces
  num4.value = parking.free_spaces
  num5.value = parking.social_vehicles
  num6.value = parking.logistics_vehicles
  num7.value = parking.work_vehicles
  pNum.value = crowd.total
  applyChart(
    myChart,
    (crowd.items || []).map((item) => item.hall_name),
    [(crowd.items || []).map((item) => item.headcount)],
  )
})
const getPercent = () => {
  const data = 29.2918
  if (data > 100) {
    percentage.value = 100
  } else {
    percentage.value = Math.round(data)
  }
  num2.value = 1000
  num3.value = 600
  num4.value = 400
  num5.value = 200
  num6.value = 300
  num7.value = 100
}
const initChart = () => {
  myChart = echarts.init(chartRef5.value)
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
      data: ['A1馆', 'A2馆', 'A3馆', 'A4馆', 'A5馆', 'A6馆', 'A7馆', 'A8馆', 'A9馆'],
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
  // const labels = ['1', '2', '3', '4', '5', '6', '7']
  if (myChart) {
    myChart.setOption({
      // xAxis: { data: labels },
      series: [{ data: chartData.value }],
    })
  }
}
</script>
<style lang="scss" scoped>
@use '../../assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.sec-trans {
  margin-bottom: 10px;
  .title {
    margin-bottom: 12px;
  }
  .left {
    .flex-box {
      display: flex;

      justify-content: space-around;
    }
    .statistics {
      flex: 1;
      padding: 20px;
      width: 241px;
      height: 156px;
      background: linear-gradient(180deg, rgba(255, 223, 71, 0.3) 0%, rgba(205, 230, 255, 0) 100%);
      border-radius: 12px;
      .data-box {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .item {
          display: flex;
          align-items: center;
        }
        .text {
          width: 80px;
          text-align: left;
          font-size: 14px;
        }
        .num {
          color: #00b4ff;
          font-size: 20px;
          font-family: DINAlternate;
          text-align: right;
          font-size: 14px;
          // padding-right: 10px;
        }
      }
      .line {
        border-bottom: 1px solid #838383;
        margin: 10px 0;
      }
    }
  }
  .right {
    .chart-header {
      // display: flex;
      // justify-content: space-between;
      // align-items: center;
      // margin-bottom: 20px;
      text-align: center;
      position: relative;
      .title {
        font-size: 14px;
        color: #fff;
        margin-bottom: 0;
      }
      .text {
        font-family: MicrosoftYaHei;
        font-size: 14px;
        color: #00d0ff;
        span {
          font-family: DINAlternate;
          font-weight: bold;
          font-size: 26px;
          color: #aefecb;
        }
      }
    }

    .chart-container {
      width: 100%;
      height: 174px;
    }
  }
}
</style>
