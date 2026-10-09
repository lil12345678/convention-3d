<!-- 用电统计和占比 -->
<template>
  <div class="energy-prop left-right-content">
    <div class="content">
      <div class="left">
        <div class="chart-header">
          <div class="title">用电量趋势(kWh)</div>
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
        <div ref="chartRef10" class="chart-container"></div>
      </div>
      <div class="right">
        <div class="title">分项用电占比</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="rightdata" :total="righttotal" :text="'用电'" />
          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">
                {{ item.percentage }}
                <span v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import CirclePercentage from '@/components/commonVue/circlePercentage.vue'
import { applyChart, getEnergyMap, percent } from '@/utils/screenStats'
const chartRef10 = ref(null)

let myChart = null
const activeTab = ref('日')
const chartData = ref([0, 0, 0, 0, 0, 0]) // 初始化数据为零
const rightdata = ref([
  { percentage: 0, color: '#40F0FF', type: 'one', label: '用电' },
  { percentage: 0, color: '#3FD385', type: 'four', label: '用水' },
])
const righttotal = ref('--')
let energyMap = null
const paintProp = () => {
  const power = energyMap?.电
  const water = energyMap?.水
  if (!power || !water) return
  if (activeTab.value === '月') {
    applyChart(myChart, power.monthLabels, [power.monthValues])
  } else {
    applyChart(myChart, power.dayLabels, [power.dayValues])
  }
  const total = power.monthSum + water.monthSum
  rightdata.value = [
    { percentage: percent(power.monthSum, total), color: '#40F0FF', type: 'one', label: '用电' },
    { percentage: percent(water.monthSum, total), color: '#3FD385', type: 'four', label: '用水' },
  ]
  righttotal.value = Math.round(total)
}
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintProp()
}

onMounted(async () => {
  await nextTick()
  if (chartRef10.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  energyMap = await getEnergyMap()
  paintProp()
})
const initChart = () => {
  myChart = echarts.init(chartRef10.value)
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
      data: [],
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
            { offset: 0, color: '#40F0FF' },
            { offset: 1, color: 'rgba(64, 240, 255, 0.1)' },
          ]),
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
.energy-prop {
  border-radius: 0 0 24px 24px;
  .title {
    margin-top: 0;
  }
  .left {
    .chart-container {
      width: 100%;
      height: 120px;
    }
  }
  .flex-box {
    display: flex;
    width: 100%;
  }
  .chart-header {
    margin-bottom: 20px;
    text-align: center;
    position: relative;
  }
  .right {
    .title {
      margin-bottom: 20px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      margin: 2px 0;
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
}
</style>
