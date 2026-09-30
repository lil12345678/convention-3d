<!-- 能耗统计 -->
<template>
  <div class="energy-static left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">能耗统计</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="chart-header">
          <div class="title">能耗监测</div>
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
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c4.png" alt="" class="img" />
            <div class="value">{{ num1 }}<span>kW/h</span></div>
            <div class="label">本年用电量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c5.png" alt="" class="img" />
            <div class="value">{{ num2 }}<span>kW/h</span></div>
            <div class="label">本月用电量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num3 }}<span>kW/h</span></div>
            <div class="label">本日用电量</div>
          </div>
        </div>
        <div class="grid-box">
          <div class="compare">
            <div class="item">
              <span>同比</span>
              <span class="up">{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof hNum === 'number'" class="up">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
            <div class="item">
              <span>环比</span><span class="down">{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'" class="down">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
          </div>
          <div class="compare">
            <div class="item">
              <span>同比</span>
              <span class="up">{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof hNum === 'number'" class="up">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
            <div class="item">
              <span>环比</span><span class="down">{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'" class="down">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
          </div>
          <div class="compare">
            <div class="item">
              <span>同比</span>
              <span class="up">{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof hNum === 'number'" class="up">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
            <div class="item">
              <span>环比</span><span class="down">{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'" class="down">%</span>
              <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">能耗趋势</div>
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
        <div ref="chartRef2" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const chartRef2 = ref(null)
let myChart = null
const activeTab = ref('电')
const activeTab2 = ref('电')
const num1 = ref('--')
const num2 = ref('--')
const num3 = ref('--')
const ChartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const tNum = ref('--')
const hNum = ref('--')
const upStatus = ref(false)
const downStatus = ref(false)

const handleTabClick = (tab) => {
  activeTab.value = tab
  getNum()
}
const handleTabClick2 = (tab) => {
  activeTab2.value = tab
  getEchartData()
}
onMounted(async () => {
  // getNum()
  await nextTick()
  if (chartRef2.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  // getEchartData()
})
const getNum = () => {
  const data = 1290

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  num2.value = formattedData
  num3.value = formattedData
  tNum.value = 20
  hNum.value = 30
  upStatus.value = true
  downStatus.value = false
}
const initChart = () => {
  myChart = echarts.init(chartRef2.value)
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
const getEchartData = () => {
  // 模拟数据
  ChartData.value = [40, 20, 80, 60, 30, 20, 90, 40, 60]
  const xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月']
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
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.energy-static {
  margin-bottom: 10px;
  .left {
    .energy-cards {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 40px;
      .card {
        width: 140px;
        position: relative;
        color: #fff;
        .img {
          width: 140px;
          height: 80px;
          position: absolute;
          top: 0;
          left: 0;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
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
        .img-icon {
          width: 80px;
        }
      }
    }
    .grid-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .compare {
      padding: 10px 10px 0 10px;
      .item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        padding-bottom: 6px;
        // line-height: 30px;
        img {
          width: 14px;
          height: 14px;
        }

        .up {
          color: #fff;
          font-size: 14px;
          font-family: DINAlternate;
        }
        span {
          color: #00b4ff;
        }
        .down {
          color: #fff;
          font-family: DINAlternate;
          font-size: 14px;
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
