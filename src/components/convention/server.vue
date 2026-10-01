<!-- 展商服务信息 -->
<template>
  <div class="con-server left-right-content">
    <div class="content">
      <div class="left">
        <div class="title">展商服务信息</div>

        <div class="record-list">
          <div class="table-header">
            <span>序号</span>
            <span>展商名称</span>
            <span>展商展位</span>
            <span>服务类型</span>
            <span>时间</span>
          </div>
          <div class="table-body" v-if="tableData.length">
            <div class="record-item" v-for="(item, index) in tableData" :key="index">
              <span>{{ item.id }}</span>
              <span>{{ item.code }}</span>
              <span>{{ item.type }}</span>

              <span>{{ item.status }}</span
              ><span>{{ item.time }}</span>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>
      <div class="right">
        <div class="r-top">
          <div class="title">展位热度分析</div>
          <div ref="chartRef20" class="chart-container"></div>
        </div>
        <div class="r-bottom">
          <div class="title">参展商区域分布</div>
          <img src="../../assets/img/circle-data2.png" class="circle-outer" />
          <div ref="chartRef21" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import Empty from '@/components/commonVue/emptyData.vue'
import { applyChart, getCrowd, getExhibitionEvents, getExhibitions } from '@/utils/screenStats'

const chartRef20 = ref(null)
const chartRef21 = ref(null)
let myChart = null
let myChart2 = null
const chartData1 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const chartData2 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const chartData3 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const chartData4 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0])
const chartData5 = ref([
  { value: '--', name: '湖北' },
  { value: '--', name: '湖南' },
  { value: '--', name: '广州' },
  { value: '--', name: '广西' },
  { value: '--', name: '江西' },
  { value: '--', name: '河南' },
  { value: '--', name: '四川' },
  { value: '--', name: '云南' },
  { value: '--', name: '贵州' },
  { value: '--', name: '重庆' },
  { value: '--', name: '四川' },
  { value: '--', name: '云南' },
  { value: '--', name: '贵州' },
  { value: '--', name: '重庆' },
])
// 表格数据
const tableData = ref([])
onMounted(async () => {
  const [events, exhibitions, crowd] = await Promise.all([
    getExhibitionEvents(),
    getExhibitions(),
    getCrowd(),
  ])
  tableData.value = events.slice(0, 8).map((item, index) => ({
    id: String(index + 1).padStart(2, '0'),
    code: item.title,
    type: item.hall_name,
    status: item.event_type,
    time: item.start_time,
  }))
  const halls = (crowd.items || []).map((item) => item.hall_name)
  chartData1.value = (crowd.items || []).map((item) => item.headcount)
  const hallCount = {}
  exhibitions.forEach((item) => {
    hallCount[item.hall_name] = (hallCount[item.hall_name] || 0) + 1
  })
  chartData5.value = Object.entries(hallCount).map(([name, value]) => ({ name, value }))
  await nextTick()
  if (chartRef20.value) {
    initChart()
    applyChart(myChart, halls, [chartData1.value])
    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  if (chartRef21.value) {
    initChart2()
    myChart2.setOption({ series: [{ data: chartData5.value }] })
    window.addEventListener('resize', () => {
      myChart2 && myChart2.resize()
    })
  }
})

const getTableData = () => {
  tableData.value = [
    {
      id: '01',
      code: 'ZC001',
      type: '高速门问题',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '物资机器人',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '洗地机',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '消防车',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '高速门问题',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '物资机器人',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
    {
      id: '01',
      code: 'ZC001',
      type: '洗地机',
      time: '2024.11.21 14:22',
      status: '维修中',
    },
  ]
}
const initChart = () => {
  myChart = echarts.init(chartRef20.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    legend: {
      data: ['A1', 'A2', 'A3', 'A4'],
      textStyle: {
        color: '#fff',
      },
      icon: 'square',
      x: 'center',
      top: 0,
      right: 10,
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '0',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['A1', 'A2', 'A3', 'A4'],
      axisLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      axisLabel: {
        color: '#fff',
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
      },
    },
    series: [
      {
        name: 'A1',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chartData1.value, // 使用最新数据,
        itemStyle: {
          color: '#00DEFF',
        },
      },
      {
        name: 'A2',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chartData2.value, // 使用最新数据,
        itemStyle: {
          color: '#FFB800',
        },
      },
      {
        name: 'A3',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chartData3.value, // 使用最新数据,
        itemStyle: {
          color: '#FF5722',
        },
      },
      {
        name: 'A4',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chartData4.value, // 使用最新数据,
        itemStyle: {
          color: '#9C27B0',
        },
      },
    ],
  }
  myChart.setOption(option)
}
const initChart2 = () => {
  myChart2 = echarts.init(chartRef21.value)
  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      // type: 'scroll',
      orient: 'vertical',
      right: '5%',
      top: 'middle',
      itemGap: 12,
      itemWidth: 15,
      itemHeight: 15,
      textStyle: {
        color: '#fff',
        fontSize: 12,
        padding: [0, 0, 0, 8],
      },
      column: 2,
      formatter: function (name) {
        const data = option.series[0].data
        const item = data.find((item) => item.name === name)
        return name + '  ' + (item ? item.value : 0)
      },
      width: '45%',
      height: '90%',
      pageIconSize: 12,
      pageButtonItemGap: 5,
      pageButtonPosition: 'end',
      scroll: {
        pageSize: 14,
      },
      left: '50%', // 添加左侧定位
    },
    grid: {
      right: '20%', // 为图例留出空间
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['40%', '60%'],
        center: ['25%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 24,
            formatter: function (params) {
              return ['{value|' + params.value + '}', '{name|' + params.name + '}'].join('\n')
            },
            rich: {
              value: {
                fontSize: 24,
                color: '#fff',
                padding: [5, 0],
              },
              name: {
                fontSize: 16,
                color: '#fff',
                padding: [0, 0],
              },
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData5.value, // 使用最新数据,
      },
    ],
  }
  myChart2.setOption(option)
}
const getChartData1 = () => {
  chartData1.value = [0, 20, 0, 30] // 示例数据
  chartData2.value = [10, 20, 30, 40] // 示例数据
  chartData3.value = [20, 30, 40, 50] // 示例数据
  chartData4.value = [30, 40, 50, 60] // 示例数据
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: chartData1.value, // 使用最新数据,
        },
        {
          data: chartData2.value, // 使用最新数据,
        },
        {
          data: chartData3.value, // 使用最新数据,
        },
        {
          data: chartData4.value, // 使用最新数据,
        },
      ],
    })
  }
}
const getChartData2 = () => {
  chartData5.value = [
    { value: 1048, name: '湖北' },
    { value: 735, name: '湖南' },
    { value: 580, name: '广州' },
    { value: 484, name: '广西' },
    { value: 300, name: '江西' },
    { value: 420, name: '河南' },
    { value: 368, name: '四川' },
    { value: 290, name: '云南' },
    { value: 265, name: '贵州' },
    { value: 248, name: '重庆' },
    { value: 368, name: '四川' },
    { value: 290, name: '云南' },
    { value: 265, name: '贵州' },
    { value: 248, name: '重庆' },
  ] // 示例数据
  if (myChart2) {
    myChart2.setOption({
      series: [
        {
          data: chartData5.value, // 使用最新数据,
        },
      ],
    })
  }
  if (myChart2) {
    myChart2.setOption({})
  }
}
onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  if (myChart2) {
    myChart2.dispose()
    myChart2 = null
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
.con-server {
  border-radius: 0 0 24px 24px;
  .title {
    margin-bottom: 20px;
  }
  .left {
    .record-list {
      // width: 100%;
      height: 518px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      margin-top: 20px;
      .table-header {
        display: grid;
        grid-template-columns: 0.8fr 0.8fr 1.2fr 1fr 2.4fr;
        padding: 10px;
        background: rgba(0, 137, 255, 0.5);
        font-size: 12px;
        color: #00b4ff;
        text-align: center;
      }

      .table-body {
        height: calc(100% - 40px);
        padding: 0 10px;
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
          grid-template-columns: 0.8fr 0.8fr 1.2fr 1fr 2.4fr;
          height: 45px;
          line-height: 45px;
          font-size: 14px;
          text-align: center;
          border-bottom: 1px solid #516aa2;
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background: rgba(0, 170, 255, 0.1);
          }
        }
      }
    }
  }

  .right {
    width: 48%;
    height: 100%;
    .r-top,
    .r-bottom {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 24px;

      padding: 10px 20px;
      position: relative;
    }
    .r-top {
      margin-bottom: 20px;
    }
    .chart-container {
      width: 100%;
      height: 206px;
    }
    .circle-outer {
      position: absolute;
      left: 26px;
      top: 70px;
      width: 180px;
      height: 180px;
    }
  }
}
</style>
