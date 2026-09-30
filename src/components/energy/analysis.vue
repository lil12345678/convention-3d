<!-- 能耗分析 -->
<template>
  <div class="energy-analysis left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">能耗分析</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="chart-header">
          <div class="title">展会数量分析</div>
          <div class="tabs">
            <div class="tab-box">
              <span
                :class="['tab-item', { active: activeTab === '电' }]"
                @click="handleTabClick('电')"
                >电</span
              >
              <span
                :class="['tab-item', { active: activeTab === '水' }]"
                @click="handleTabClick('水')"
                >水</span
              >
            </div>
          </div>
        </div>
        <div ref="chartRef15" class="chart-container"></div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">展会人流分析</div>
          <div class="tabs">
            <div class="tab-box">
              <span
                :class="['tab-item', { active: activeTab2 === '电' }]"
                @click="handleTabClick2('电')"
                >电</span
              >
              <span
                :class="['tab-item', { active: activeTab2 === '水' }]"
                @click="handleTabClick2('水')"
                >水</span
              >
            </div>
          </div>
        </div>
        <div ref="chartRef18" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef15 = ref(null)
const chartRef18 = ref(null)
let myChart1 = null
const chartData1 = [0, 0, 0, 0, 0, 0]
const chartData2 = [0, 0, 0, 0, 0, 0]
const activeTab = ref('电')

let myChart2 = null
const activeTab2 = ref('电')
const chartData3 = [0, 0, 0, 0, 0, 0]
const chartData4 = [0, 0, 0, 0, 0, 0]

onMounted(async () => {
  await nextTick()
  if (chartRef15.value) {
    initChart15()
    window.addEventListener('resize', () => {
      myChart1 && myChart1.resize()
    })
    // updateChartData()
  }
  if (chartRef18.value) {
    initChart18()
    window.addEventListener('resize', () => {
      myChart2 && myChart2.resize()
    })
    // updateChartData2()
  }
})

const handleTabClick = (tab) => {
  activeTab.value = tab
  updateChartData()
}
const handleTabClick2 = (tab) => {
  activeTab2.value = tab
  updateChartData2()
}
const initChart15 = () => {
  myChart1 = echarts.init(chartRef15.value)
  const option = {
    grid: {
      top: '22%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    legend: {
      // right: 10,
      top: '0',
      padding: [0, 0, 20, 0],
      textStyle: { color: '#fff' },
      data: ['展会数', '能耗值'],
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: { color: '#4C5973' },
      },
      axisLabel: { color: '#fff' },
    },
    yAxis: [
      {
        type: 'value',
        name: '件',
        nameTextStyle: {
          color: '#fff',
          align: 'center',
          padding: [0, 0, 0, -25], // 上右下左的内边距，用于调整位置
        },
        interval: 50, //固定间隔
        splitLine: {
          lineStyle: { color: '#4C5973', type: 'dashed' },
        },
        axisLabel: { color: '#fff' },
      },
      {
        type: 'value',
        name: 'kWh',
        nameTextStyle: {
          color: '#fff',
          align: 'center',
          padding: [0, -25, 0, 0], // 上右下左的内边距，用于调整位置
        },
        splitLine: { show: false },
        axisLabel: {
          color: '#fff',
          formatter: '{value}',
        },
      },
    ],
    series: [
      {
        name: '展会数',
        type: 'bar',
        barWidth: '20%',
        data: chartData1.value,
        itemStyle: {
          color: '#FFD18A',
        },
      },
      {
        name: '能耗值',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        data: chartData2.value,
        lineStyle: {
          color: '#179BFF',
          width: 2,
        },
        itemStyle: {
          color: '#00DEFF',
        },
      },
    ],
  }
  myChart1.setOption(option)
}
const initChart18 = () => {
  myChart2 = echarts.init(chartRef18.value)
  const option = {
    grid: {
      top: '22%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    legend: {
      // right: 10,
      top: 0,
      padding: [0, 0, 15, 0],
      textStyle: { color: '#fff' },
      data: ['人数', '能耗值'],
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: { color: '#4C5973' },
      },
      axisLabel: { color: '#fff' },
    },
    yAxis: [
      {
        type: 'value',
        name: '万人',
        nameTextStyle: {
          color: '#fff',
          align: 'center',
          padding: [0, 0, 0, -25], // 上右下左的内边距，用于调整位置
        },
        interval: 50,
        splitLine: {
          lineStyle: { color: '#4C5973', type: 'dashed' },
        },
        axisLabel: { color: '#fff' },
      },
      {
        type: 'value',
        name: 'kWh',
        nameTextStyle: {
          color: '#fff',
          align: 'center',
          padding: [0, -25, 0, 0], // 上右下左的内边距，用于调整位置
        },
        splitLine: { show: false },
        axisLabel: {
          color: '#fff',
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '人数',
        type: 'bar',
        barWidth: '20%',
        data: chartData3.value, // 假设这是你的数据，替换为实际数据,
        itemStyle: {
          color: '#8AD2FF',
        },
      },
      {
        name: '能耗值',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        data: chartData4.value,
        lineStyle: {
          color: '#179BFF',
          width: 2,
        },
        itemStyle: {
          color: '#00DEFF',
        },
      },
    ],
  }
  myChart2.setOption(option)
}
const updateChartData = () => {
  chartData1.value = [120, 150, 130, 140, 120, 130] // 更新数据
  chartData2.value = [120, 150, 130, 140, 120, 130] // 更新数据

  if (myChart1) {
    myChart1.setOption({
      series: [
        {
          data: chartData1.value, // 使用最新数据
        },
        {
          data: chartData2.value, // 使用最新数据
        },
      ],
    })
  }
}
const updateChartData2 = () => {
  chartData3.value = [12, 10, 130, 140, 120, 130] // 更新数据
  chartData4.value = [120, 15, 13, 140, 20, 30] // 更新数据
  if (myChart2) {
    myChart2.setOption({
      series: [
        {
          data: chartData3.value, // 使用最新数据
        },
        {
          data: chartData4.value, // 使用最新数据
        },
      ],
    })
  }
}
// 添加组件卸载时的清理
onUnmounted(() => {
  if (myChart1) {
    myChart1.dispose()
    myChart1 = null
  }
  if (myChart2) {
    myChart2.dispose()
    myChart2 = null
  }
  window.removeEventListener('resize', () => {
    myChart1 && myChart1.resize()
    myChart2 && myChart2.resize()
  })
})
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.energy-analysis {
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  padding-bottom: 10px;
  .chart-container {
    width: 100%;
    height: 130px;
  }

  .chart-header {
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
}
</style>
