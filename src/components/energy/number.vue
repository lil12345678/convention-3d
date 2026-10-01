<!-- 能耗指标 -->
<template>
  <div class="energy-num left-right-content">
    <div class="content">
      <div class="left">
        <div class="title">能耗指标</div>
        <!-- 年份选择器 -->
        <div class="year-select">
          <div class="select-box" @click="showYearOptions = !showYearOptions">
            <span>{{ selectedYear }}年</span>
            <img
              src="../../assets/img/arrow-down.png"
              alt=""
              :class="{ rotate: showYearOptions }"
              class="arrow-icon"
            />
          </div>
          <div class="year-options" v-show="showYearOptions">
            <div class="year-item" v-for="year in yearList" :key="year" @click="selectYear(year)">
              {{ year }}年
            </div>
          </div>
        </div>

        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c8.png" alt="" />
            <div class="value">{{ num1 }}<span>tce</span></div>
            <div class="label">折标煤</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c8-2.png" alt="" />
            <div class="value">{{ num2 }}<span>tco2</span></div>
            <div class="label">碳排放量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c8-3.png" alt="" />
            <div class="value">{{ num3 }}<span>tco2</span></div>
            <div class="label">单位建筑面积电耗</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c8-4.png" alt="" />
            <div class="value">{{ num4 }}<span>kgce/㎡·a</span></div>
            <div class="label">单位建筑面积综合能耗</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">碳排放量(t)</div>
        </div>
        <div ref="chartRef17" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { applyChart, formatInt, getEnergyMap } from '@/utils/screenStats'

const num1 = ref('--')
const num2 = ref('--')
const num3 = ref('--')
const num4 = ref('--')

const chartRef17 = ref(null)

let myChart = null
const chartData = ref([0, 0, 0, 0, 0, 0])
const showYearOptions = ref(false)
const selectedYear = ref(new Date().getFullYear())
const yearList = ref([new Date().getFullYear()])
let energyMap = null
const paintNumber = () => {
  const months = (energyMap?.电.months || []).filter((item) =>
    item.period_key.startsWith(String(selectedYear.value)),
  )
  const kwh = months.reduce((total, item) => total + item.value, 0)
  num1.value = formatInt((kwh * 0.1229) / 1000)
  num2.value = formatInt((kwh * 0.5703) / 1000)
  num3.value = formatInt(kwh ? kwh / 10000 : 0)
  num4.value = formatInt(kwh * 0.1229)
  applyChart(
    myChart,
    months.map((item) => `${Number(item.period_key.slice(5))}月`),
    [months.map((item) => Number(((item.value * 0.5703) / 1000).toFixed(2)))],
  )
}
onMounted(async () => {
  await nextTick()
  if (chartRef17.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  energyMap = await getEnergyMap()
  yearList.value = [
    ...new Set((energyMap.电.months || []).map((item) => Number(item.period_key.slice(0, 4)))),
  ].sort((a, b) => b - a)
  if (yearList.value.length) selectedYear.value = yearList.value[0]
  paintNumber()
})
const selectYear = (year) => {
  selectedYear.value = year
  showYearOptions.value = false
  paintNumber()
}
const getNum = () => {
  const data = 35678

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  num2.value = formattedData
  num3.value = formattedData
  num4.value = formattedData
}
const initChart = () => {
  myChart = echarts.init(chartRef17.value)
  const option = {
    grid: {
      top: '5%',
      left: '3%',
      right: '4%',
      bottom: '1%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: { color: '#4C5973' },
      },
      axisLabel: {
        color: '#fff',
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { color: '#4C5973', type: 'dashed' },
      },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        data: chartData.value,
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#BEFF8B' }, // 顶部亮绿色
            { offset: 1, color: 'rgba(63, 211, 133, 1)' }, // 底部半透明绿色
          ]),
        },
      },
    ],
  }
  myChart.setOption(option)
}

const getChartData = () => {
  chartData.value = [10, 80, 20, 50, 42, 13]
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
.energy-num {
  border-radius: 0 0 24px 24px;
  .title {
    margin-top: 0;
  }
  .left {
    position: relative;
    .energy-cards {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
      // margin-bottom: 18px;
      .card {
        width: 212px;
        position: relative;
        color: #fff;
        margin-bottom: 10px;
        img {
          width: 212px;
          height: 64px;
          position: absolute;
          top: 0;
          left: 0;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .value {
          font-size: 26px;
          margin-top: 6px;
          position: relative;
          font-weight: bold;
          z-index: 1;
          font-family: DINAlternate;
          span {
            font-size: 14px;
            margin-left: 5px;
            color: rgba(255, 255, 255, 0.8);
          }
        }

        .label {
          position: relative;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          // margin-bottom: 10px;
        }
        .img-icon {
          width: 80px;
        }
      }
    }
  }

  .right {
    .chart-container {
      width: 100%;
      height: 130px;
      margin-top: 20px;
    }
  }
}
.year-select {
  position: absolute;
  top: 10px;
  right: 20px;
  width: 80px;
  height: 20px;
  // margin: 15px auto;

  .select-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: linear-gradient(
      270deg,
      rgba(0, 222, 255, 0.8) 0%,
      #5dabff 50%,
      rgba(0, 63, 150, 0.8) 100%
    );
    border-radius: 4px;
    cursor: pointer;
    // border: 1px solid rgba(255, 255, 255, 0.1);
    .rrow-icon {
      width: 12px;
    }
    span {
      color: #fff;
      font-size: 12px;
    }

    img {
      width: 16px;
      height: 16px;
      transition: transform 0.3s;

      &.rotate {
        transform: rotate(180deg);
      }
    }
  }

  .year-options {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(9, 104, 170, 0.9);
    border-radius: 4px;
    margin-top: 5px;
    z-index: 10;
    font-size: 12px;
    .year-item {
      padding: 8px 12px;
      cursor: pointer;
      text-align: center;

      &:hover {
        background: rgba(0, 170, 255, 0.3);
      }
    }
  }
}
</style>
