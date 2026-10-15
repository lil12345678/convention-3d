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
              <span :title="item.name">{{ item.name }}</span>
              <span>{{ item.booth }}</span>
              <span :title="item.status">{{ item.type }}</span>
              <span>{{ item.time }}</span>
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
import { applyChart, getCrowd } from '@/utils/screenStats'
import { fetchExhibitorProvinces, fetchExhibitorServices } from '@/api/convention'

const chartRef20 = ref(null)
const chartRef21 = ref(null)
let myChart = null
let myChart2 = null
const chartData1 = ref([])
const chartData5 = ref([])
// 表格数据
const tableData = ref([])
onMounted(async () => {
  const settle = (request, fallback) =>
    request.catch((error) => {
      console.warn('展商服务面板数据加载失败', error.message)
      return fallback
    })
  const [services, provinces, crowd] = await Promise.all([
    settle(fetchExhibitorServices(20), []),
    settle(fetchExhibitorProvinces(), []),
    settle(getCrowd(), { items: [] }),
  ])
  tableData.value = services.map((item, index) => ({
    id: String(index + 1).padStart(2, '0'),
    name: item.exhibitor_name,
    booth: item.booth,
    type: item.service_type,
    status: item.status,
    time: item.created_at,
  }))
  const halls = (crowd.items || []).map((item) => item.hall_name)
  chartData1.value = (crowd.items || []).map((item) => item.headcount)
  chartData5.value = provinces.map((item) => ({ name: item.province, value: item.count }))
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

const initChart = () => {
  myChart = echarts.init(chartRef20.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
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
      data: [],
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
        name: '在馆人数',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chartData1.value,
        itemStyle: {
          color: '#00DEFF',
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
        name: '展商数',
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
        grid-template-columns: 0.6fr 2.2fr 1.2fr 1fr 1.8fr;
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
          grid-template-columns: 0.6fr 2.2fr 1.2fr 1fr 1.8fr;
          height: 45px;
          line-height: 45px;
          font-size: 14px;
          text-align: center;
          border-bottom: 1px solid #516aa2;
          color: rgba(255, 255, 255, 0.8);

          span {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

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
