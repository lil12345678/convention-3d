<!-- 用电统计和占比 -->
<template>
  <div class="energy-water-top left-right-content">
    <div class="content">
      <div class="left">
        <div class="chart-header">
          <div class="title">分区域用水统计(m³)</div>
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
        <div ref="chartRef12" class="chart-container"></div>
      </div>
      <div class="right">
        <div class="title">月度用水TOP5</div>
        <div class="progress">
          <div class="progress-item" v-for="(item, index) in alarmList" :key="index">
            <div class="progress-row">
              <div class="label" :style="{ color: item.color }">
                <span>{{ item.rank }}</span
                ><span class="num">{{ item.num }}</span>
              </div>
              <div class="text">{{ item.name }}</div>
              <el-progress
                :percentage="item.percentage"
                :show-text="false"
                :stroke-width="10"
                color="#AFFFCC"
              />
              <div class="value-box">
                <span>{{ item.value }}m³</span>
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

const chartRef12 = ref(null)

let myChart = null
const activeTab = ref('日')
const chartData = ref([0, 0, 0, 0, 0, 0])

const alarmList = ref([
  { rank: 'TOP', num: 1, name: 'AI视频告警', value: '--', percentage: 1, color: '#DD1D4E' },
  { rank: 'TOP', num: 2, name: '入侵告警', value: '--', percentage: 1, color: '#FFAF28' },
  { rank: 'TOP', num: 3, name: '消防告警', value: '--', percentage: 1, color: '#00D0FF' },
  { rank: 'TOP', num: 4, name: '消防告警', value: '--', percentage: 1, color: '#AFFFCC' },
  { rank: 'TOP', num: 5, name: '消防告警', value: '--', percentage: 1, color: '#fff' },
])

onMounted(async () => {
  // getList()
  await nextTick()
  if (chartRef12.value) {
    initChart()

    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
    // getChartData()
  }
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  getChartData()
}

const initChart = () => {
  myChart = echarts.init(chartRef12.value)
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
      data: ['A1层', 'A2层', 'A3层', 'A4层', 'A5层', 'A6层'],
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
        data: chartData.value, // 使用最新数据,
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#BEFF8B' }, // 顶部亮绿色
            { offset: 1, color: 'rgba(63, 211, 133, 0.1)' }, // 底部半透明绿色
          ]),
        },
      },
    ],
  }
  myChart.setOption(option)
}
const getChartData = () => {
  chartData.value = [90, 70, 40, 85, 40, 80]
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
const getList = () => {
  alarmList.value = [
    { rank: 'TOP', num: 1, name: 'AI视频告警', value: 4675, percentage: 70, color: '#DD1D4E' },
    { rank: 'TOP', num: 2, name: '入侵告警', value: 4675, percentage: 50, color: '#FFAF28' },
    { rank: 'TOP', num: 3, name: '消防告警', value: 4675, percentage: 20, color: '#00D0FF' },
    { rank: 'TOP', num: 4, name: '消防告警', value: 4675, percentage: 20, color: '#AFFFCC' },
    { rank: 'TOP', num: 5, name: '消防告警', value: 4675, percentage: 20, color: '#fff' },
  ]
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

.energy-water-top {
  border-radius: 0 0 24px 24px;
  .title {
    margin-top: 0;
    margin-bottom: 20px;
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
      // margin-top: 10px;
    }
  }
  .right {
    .title {
      margin-bottom: 10px;
    }
  }
}
.progress {
  // padding: 20px;
  padding-bottom: 0;
  .progress-item {
    margin-bottom: 4px;
    .progress-row {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        width: 68px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        font-family: Headlines-Bold;
      }
      .text {
        width: 80px;
        text-align: left;

        font-size: 14px;
        color: #ffffff;
        line-height: 19px;
        font-style: normal;
      }
      .num {
        font-family: Isemin;
      }
      .el-progress {
        flex: 1;
      }

      .value-box {
        width: 60px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        text-align: right;
        .percentage {
          color: #fff;
        }
      }
      .TOP1 {
        color: #dd1d4e;
      }
      .TOP2 {
        color: #ffaf28;
      }
      .TOP3 {
        color: #00d0ff;
      }
      .TOP4 {
        color: #afffcc;
      }
      .TOP5 {
        color: #fff;
      }
    }
  }

  :deep(.el-progress-bar__outer) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px;
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 6px;
  }
}
</style>
