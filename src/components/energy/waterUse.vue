<!-- 用水管理 -->
<template>
  <div class="energy-water-use left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">用水管理</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">用水管理</div>

        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c4.png" alt="" class="img" />
            <div class="value">{{ num1 }}<span>m³</span></div>
            <div class="label">本年用水量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c5.png" alt="" class="img" />
            <div class="value">{{ num2 }}<span>m³</span></div>
            <div class="label">本月用水量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num3 }}<span>m³</span></div>
            <div class="label">本日用水量</div>
          </div>
        </div>
        <div class="grid-box">
          <div class="compare" v-for="(i, index) in list" :key="index">
            <div class="item">
              <span>同比</span>
              <span class="up"
                >{{ i.tNum
                }}<span v-if="!isNaN(i.tNum) && typeof i.tNum === 'number'" class="per"
                  >%</span
                ></span
              >
              <img src="../../assets/img/up1.png" alt="" v-if="i.tupStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="i.tdownStatus" />
            </div>
            <div class="item">
              <span>环比</span>
              <span class="down"
                >{{ i.hNum
                }}<span v-if="!isNaN(i.hNum) && typeof i.hNum === 'number'" class="per"
                  >%</span
                ></span
              >
              <img src="../../assets/img/up1.png" alt="" v-if="i.hupStatus" />
              <img src="../../assets/img/down.png" alt="" v-if="i.hdownStatus" />
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">用水量趋势(m³)</div>
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
        <div ref="chartRef11" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { applyChart, getEnergyMap } from '@/utils/screenStats'

const num1 = ref('--')
const num2 = ref('--')
const num3 = ref('--')
const list = ref([
  {
    tNum: '--',
    hNum: '--',
    tupStatus: false,
    tdownStatus: false,
    hupStatus: false,
    hdownStatus: false,
  },
  {
    tNum: '--',
    hNum: '--',
    tupStatus: false,
    tdownStatus: false,
    hupStatus: false,
    hdownStatus: false,
  },
  {
    tNum: '--',
    hNum: '--',
    tupStatus: false,
    tdownStatus: false,
    hupStatus: false,
    hdownStatus: false,
  },
])

const chartRef11 = ref(null)
let myChart = null
const activeTab = ref('日')
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
let energyMap = null

function rateRow(rate) {
  return {
    tNum: rate?.value ?? '--',
    hNum: rate?.value ?? '--',
    tupStatus: !!rate?.up,
    tdownStatus: !!rate?.down,
    hupStatus: !!rate?.up,
    hdownStatus: !!rate?.down,
  }
}
const paintWater = () => {
  const card = energyMap?.水
  if (!card) return
  num1.value = card.yearText
  num2.value = card.monthText
  num3.value = card.dayText
  list.value = [rateRow(card.yoy), rateRow(card.mom), rateRow(card.dayMom)]
  if (activeTab.value === '月') {
    applyChart(myChart, card.monthLabels, [card.monthValues])
  } else {
    applyChart(myChart, card.dayLabels, [card.dayValues])
  }
}
onMounted(async () => {
  await nextTick()
  if (chartRef11.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  energyMap = await getEnergyMap()
  paintWater()
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintWater()
}
const initChart = () => {
  myChart = echarts.init(chartRef11.value)
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
.energy-water-use {
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
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-top: 20px;
      .card {
        width: 140px;
        position: relative;
        color: #fff;
        .img {
          width: 140px;
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
    .grid-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      // margin-top: 10px;
    }
    .compare {
      padding: 10px 10px 0 10px;
      .item {
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 5px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 24px;
        img {
          width: 12px;
          height: 12px;
        }

        .up {
          color: #fff;
        }
        span {
          color: #00b4ff;
        }
        .down {
          color: #fff;
          font-family: DINAlternate;
        }
      }
    }
  }
  .chart-header {
    margin-bottom: 20px;
    text-align: center;
    position: relative;
  }
  .right {
    .chart-container {
      width: 100%;
      height: 130px;
    }
  }
}
</style>
