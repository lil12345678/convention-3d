<!-- 设备工单类型统计(个) -->
<template>
  <div class="device-worklist left-right-content">
    <div class="content">
      <div class="left">
        <div class="relative">
          <div class="title">设备工单类型统计(个)</div>

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

        <div ref="chartRef8" class="chart-container"></div>
      </div>
      <div class="right">
        <div class="title">设备工单列表</div>
        <div class="record-list">
          <div class="table-header">
            <span>序号</span>
            <span>等级</span>
            <span>事件类型</span>
            <span>时间</span>
            <span>状态</span>
          </div>
          <div class="table-body" v-if="list.length">
            <div class="record-item" v-for="(item, index) in list" :key="index">
              <span>{{ index + 1 }}</span>
              <span>{{ item.level }}</span>
              <span>{{ item.order_type }}</span>
              <span>{{ item.created_at }}</span>
              <span>{{ item.status }}</span>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import Empty from '@/components/commonVue/emptyData.vue'
import { applyChart, getWorkOrderView } from '@/utils/screenStats'

const chartRef8 = ref(null)
const chartData1 = ref([0, 0, 0, 0, 0, 0]) // 维修工单
const chartData2 = ref([0, 0, 0, 0, 0, 0]) // 报事工单
const chartData3 = ref([0, 0, 0, 0, 0, 0]) // 投诉工单
const chartData4 = ref([0, 0, 0, 0, 0, 0]) // 其他
const list = ref([])
let myChart = null
const activeTab = ref('日')
let orderView = null

onMounted(async () => {
  await nextTick()
  if (chartRef8.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  orderView = await getWorkOrderView()
  list.value = orderView.orders.slice(0, 8)
  paintOrders()
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintOrders()
}
const paintOrders = () => {
  if (!orderView) return
  const series = activeTab.value === '月' ? orderView.typeMonth : orderView.typeDay
  applyChart(
    myChart,
    series[0].labels,
    series.map((item) => item.values),
  )
}

const initChart = () => {
  myChart = echarts.init(chartRef8.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      x: 'center',
      data: ['维修工单', '报事工单', '投诉工单'],
      textStyle: {
        color: '#fff',
      },
      icon: 'square',
      // top: 0,
      // right: 10,
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
      data: [],
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)',
        },
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12,
      },
    },
    series: [
      {
        name: '维修工单',
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: '#FFB800',
        },
        data: chartData1.value,
      },
      {
        name: '报事工单',
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: '#D33FB1',
        },
        data: chartData2.value,
      },
      {
        name: '投诉工单',
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: '#4A17FF',
        },
        data: chartData3.value,
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
.device-worklist {
  border-radius: 0 0 24px 24px;
  margin-bottom: 10px;
  .title {
    margin-bottom: 20px;
  }
  .left {
    .chart-container {
      width: 100%;
      height: 230px;
    }
  }

  .right {
    .record-list {
      // width: 100%;
      height: 230px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      // border: 1px solid #516aa2;
      overflow: hidden;
      position: relative;
      .empty-box {
        padding-top: 40px;
      }
      .table-header {
        display: grid;
        grid-template-columns: 0.8fr 0.8fr 1fr 2.4fr 1.5fr;
        padding: 10px;
        background: rgba(0, 137, 255, 0.5);
        font-size: 12px;
        color: #00b4ff;
        text-align: center;
      }

      .table-body {
        height: calc(100% - 40px);

        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 170, 255, 0.5);
          border-radius: 2px;
        }

        .record-item {
          display: grid;
          grid-template-columns: 0.8fr 0.8fr 1fr 2.4fr 1.5fr;
          padding: 10px;
          font-size: 14px;
          text-align: center;
          border-bottom: 1px solid rgba(76, 89, 115, 0.5);
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background: rgba(0, 170, 255, 0.1);
          }
        }
      }
    }
  }
}
</style>
