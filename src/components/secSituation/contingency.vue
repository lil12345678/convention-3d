<!-- 应急管理 -->
<template>
  <div class="sec-congency left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">应急管理</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">应急概况</div>
        <div class="flex">
          <div class="card1">
            <img src="../../assets/img/c11.png" alt="" class="img" />
            <div class="value">{{ num1 }}<span>件</span></div>
            <div class="label">应急预案数</div>
          </div>
          <div class="grid">
            <div class="card">
              <img src="../../assets/img/c5.png" alt="" class="img" />
              <div class="value">{{ num2 }}<span>人</span></div>
              <div class="label">应急队伍</div>
            </div>
            <div class="card">
              <img src="../../assets/img/c4.png" alt="" class="img" />
              <div class="value">{{ num3 }}<span>人</span></div>
              <div class="label">应急仓库</div>
            </div>
            <div class="card">
              <img src="../../assets/img/c5.png" alt="" class="img" />
              <div class="value">{{ num4 }}<span>人</span></div>
              <div class="label">应急场所</div>
            </div>
            <div class="card">
              <img src="../../assets/img/c4.png" alt="" class="img" />
              <div class="value">{{ num5 }}<span>人</span></div>
              <div class="label">应急物资</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">应急事件统计</div>
          <div class="tabs">
            <div class="tab-box">
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
        <div ref="chartRef6" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const num1 = ref('--') //应急预案数
const num2 = ref('--') //应急队伍
const num3 = ref('--') //应急仓库
const num4 = ref('--') //应急场所
const num5 = ref('--') //应急物资
const chartRef6 = ref(null)
let myChart = null
const activeTab = ref('月')
const chartData1 = ref([0, 0, 0, 0, 0, 0])
const chartData2 = ref([0, 0, 0, 0, 0, 0])
const chartData3 = ref([0, 0, 0, 0, 0, 0])
const chartData4 = ref([0, 0, 0, 0, 0, 0])
const chartData5 = ref([0, 0, 0, 0, 0, 0])

const handleTabClick = (tab) => {
  activeTab.value = tab
}
onMounted(async () => {
  // getData()
  await nextTick()
  if (chartRef6.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
    // getChartData()
  }
})
const getData = () => {
  num1.value = 10
  num2.value = 10
  num3.value = 10
  num4.value = 10
  num5.value = 10
}
const initChart = () => {
  myChart = echarts.init(chartRef6.value)
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['公共卫生', '自然灾害', '社会安全', '事故灾害', '其它'],
      textStyle: {
        color: '#fff',
      },
      top: 0,
      itemWidth: 10, // 设置图例标记的宽度
      itemHeight: 10, // 设置图例标记的高度
      icon: 'rect', // 设置图例标记为矩形
      itemGap: 15,
    },
    grid: {
      top: '15%',
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
      splitLine: {
        lineStyle: { color: '#4C5973', type: 'dashed' },
      },
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: '公共卫生',
        type: 'line',
        smooth: true,
        data: chartData1.value, // 使用最新数据,
        lineStyle: { color: '#00B4FF' },
      },
      {
        name: '自然灾害',
        type: 'line',
        smooth: true,
        data: chartData2.value, //[50, 70, 50, 60, 70, 50]
        lineStyle: { color: '#00FF9C' },
      },
      {
        name: '社会安全',
        type: 'line',
        smooth: true,
        data: chartData3.value, //[20, 40, 20, 40, 20, 30]
        lineStyle: { color: '#FFB800' },
      },
      {
        name: '事故灾害',
        type: 'line',
        smooth: true,
        data: chartData4.value,
        lineStyle: { color: '#FF5722' },
      },
      {
        name: '其它',
        type: 'line',
        smooth: true,
        data: chartData5.value,
        lineStyle: { color: '#9C27B0' },
      },
    ],
  }
  myChart.setOption(option)
}
const getChartData = () => {
  chartData1.value = [40, 60, 40, 80, 60, 40]
  chartData2.value = [50, 70, 50, 60, 70, 50]
  chartData3.value = [20, 40, 20, 40, 20, 30]
  chartData4.value = [10, 30, 10, 20, 10, 10]
  chartData5.value = [10, 20, 10, 10, 10, 10]
  // 确保 myChart 已初始化，否则会报错
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: chartData1.value, // 使用最新数据
        },
        {
          data: chartData2.value, // 使用最新数据
        },
        {
          data: chartData3.value, // 使用最新数据
        },
        {
          data: chartData4.value, // 使用最新数据
        },
        {
          data: chartData5.value, // 使用最新数据
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
.sec-congency {
  .left {
    padding: 10px 10px 0 10px;

    .flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
      margin-top: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 10px;
    }
    .card1 {
      position: relative;
      text-align: center;
      width: 140px;
      height: 174px;
      // border: 1px dashed #fff;
      .value {
        margin-top: 50%;
      }
      .img {
        width: 138px;
        height: 174px;
        top: 0;
        left: 0;
        position: absolute;
      }
    }
    .card {
      position: relative;
      text-align: center;
      width: 140px;
      height: 80px;
      // border: 1px dashed #fff;
      .img {
        width: 140px;
        height: 80px;
        top: 0;
        left: 0;
        position: absolute;
      }
    }
    .value {
      font-size: 26px;
      margin-top: 10px;
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
