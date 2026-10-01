<!-- 设备工单数量趋势(个) -->
<template>
  <div class="device-top5 left-right-content">
    <div class="content">
      <div class="left">
        <div class="relative">
          <div class="title">设备工单数量趋势(个)</div>

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

        <div ref="chartRef7" class="chart-container"></div>
      </div>
      <div class="right">
        <div class="title">超时工单类型TOP5</div>
        <div class="top-list">
          <div class="list-header">
            <span>TOP</span>
            <span>等级</span>
            <span>工单类型</span>
            <span>超时时间</span>
            <span>状态</span>
          </div>
          <div
            class="list-item"
            v-for="(item, index) in topList"
            :key="index"
            v-if="topList.length"
          >
            <span class="top-num" :style="{ color: item.color }"
              >TOP<span class="num">{{ item.num }}</span></span
            >
            <span>{{ item.name }}</span>
            <span>{{ item.value }}</span>
            <span>{{ item.time }}</span>
            <span>{{ item.status }}</span>
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

const chartRef7 = ref(null)

let myChart = null
const activeTab = ref('日')
const topList = ref([])
const chartData = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
let orderView = null

onMounted(async () => {
  await nextTick()
  if (chartRef7.value) {
    initChart()
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  orderView = await getWorkOrderView()
  topList.value = orderView.overdueTop
  paintOrders()
})

const paintOrders = () => {
  if (!orderView) return
  const trend = activeTab.value === '月' ? orderView.month : orderView.day
  chartData.value = trend.values
  applyChart(myChart, trend.labels, [trend.values])
}
const handleTabClick = (tab) => {
  activeTab.value = tab
  paintOrders()
}

const initChart = () => {
  myChart = echarts.init(chartRef7.value)
  const option = {
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['07/01', '07/02', '07/03', '07/04', '07/05', '07/06', '07/07', '07/08', '07/09'],
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
        data: chartData.value,
        type: 'line',
        smooth: true,
        // symbol: 'circle',
        symbolSize: 0,
        lineStyle: {
          color: '#29FFD1',
          width: 2,
        },
        // itemStyle: {
        //   color: '#00D0FF',
        //   borderWidth: 2,
        //   borderColor: '#fff',
        // },
      },
    ],
  }
  myChart.setOption(option)
}
const getChartData = () => {
  chartData.value = [10, 80, 20, 50, 42, 13, 91, 19, 15]
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
.device-top5 {
  border-radius: 0;
  margin-bottom: 0;

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
    position: relative;
    .empty-box {
      padding-top: 100px;
    }
    .top-list {
      .list-header {
        display: grid;
        grid-template-columns: 0.8fr 0.8fr 1fr 1fr 0.8fr;
        padding-bottom: 10px;
        color: #00b4ff;
        font-size: 14px;
      }

      .list-item {
        display: grid;
        grid-template-columns: 0.8fr 0.8fr 1fr 1fr 0.8fr;
        align-items: center;
        padding: 6px 0;
        color: #fff;
        font-size: 12px;
        // border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .top-num {
          font-size: 20px;
          font-family: Headlines-Bold;
        }
        .num {
          font-family: Isemin;
        }
      }
    }
  }
}
</style>
