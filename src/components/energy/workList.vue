<!-- 能耗工单处理情况 -->
<template>
  <div class="energy-worklist left-right-content">
    <div class="content">
      <div class="left">
        <div class="title">能耗工单处理情况</div>
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c9.png" alt="" />
            <div class="value">{{ num1 }}</div>
            <div class="label">能耗工单总数(件)</div>
          </div>
          <div class="status-row">
            <div class="status-item" v-for="(i, index) in list" :key="index">
              <span class="label">{{ i.label }}</span>
              <span class="value">{{ i.val }} 件</span>
            </div>
            <!-- <div class="status-item">
              <span class="label">处理中</span>
              <span class="value">74件</span>
            </div>
            <div class="status-item">
              <span class="label">已处理</span>
              <span class="value">61件</span>
            </div> -->
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">能耗工单趋势(件)</div>
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
        <div ref="chartRef13" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { applyChart, countBuckets, filterBySource, getWorkOrderView } from '@/utils/screenStats'

const num1 = ref('--')
const list = ref([
  { label: '未处理', val: '--' },
  { label: '处理中', val: '--' },
  { label: '已处理', val: '--' },
])

const chartRef13 = ref(null)

let myChart = null
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0]) // 示例数据CONST
const activeTab = ref('日')
let energyOrders = []
const paintEnergyOrders = () => {
  const trend = countBuckets(energyOrders, 'created_at', activeTab.value)
  applyChart(myChart, trend.labels, [trend.values])
}
onMounted(async () => {
  await nextTick()
  if (chartRef13.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  const data = await getWorkOrderView()
  energyOrders = filterBySource(data.orders, '能源')
  num1.value = energyOrders.length
  list.value = ['未处理', '处理中', '已处理'].map((label) => ({
    label,
    val: energyOrders.filter((item) => item.status === (label === '未处理' ? '待处理' : label)).length,
  }))
  paintEnergyOrders()
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintEnergyOrders()
}

const initChart = () => {
  myChart = echarts.init(chartRef13.value)

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
  const data = [40, 20, 80, 60, 30, 20, 90, 40, 60] // 示例数据
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
.energy-worklist {
  border-radius: 0 0 24px 24px;
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
      // margin-bottom: 18px;
      .card {
        width: 212px;
        position: relative;
        color: #fff;
        img {
          width: 212px;
          height: 100px;
          position: absolute;
          top: 0;
          left: 0;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .value {
          font-size: 26px;
          margin-top: 16px;
          position: relative;
          color: #35b4ff;
          z-index: 1;
          font-family: DINAlternate;
          font-weight: bold;
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
    .status-row {
      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        padding: 6px 20px;
        .label {
          color: #00d0ff;
        }

        .value {
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
      height: 120px;
    }
  }
}
</style>
