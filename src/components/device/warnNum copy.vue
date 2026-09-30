<!-- 设备告警占比 echarts图表-->
<template>
  <div class="dev-num-copy">
    <div class="content">
      <div class="left">
        <div class="title">设备告警占比</div>
        <div class="flex-box flex items-center">
          <div class="img-box">
            <img src="../../assets/img/circle-data2.png" class="circle-outer" />
            <div ref="chartRef22" class="chart-container"></div>
          </div>

          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">{{ item.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">设备告警趋势(个)</div>
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
        <div ref="chartRef16" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import CirclePercentage from '@/components/commonVue/circlePercentage.vue'
const chartRef16 = ref(null)
const chartRef22 = ref(null)
let myChart = null
let myChart22 = null
const activeTab = ref('日')

const rightdata = ref([
  { percentage: 10, color: '#40F0FF', type: 'one', label: '弱电工程' }, // 一般
  { percentage: 20, color: '#807E6F', type: 'two', label: '消防工程' }, // 较急
  { percentage: 30, color: '#807E6F', type: 'three', label: '暖通工程' }, // 紧急
  { percentage: 40, color: '#3FD385', type: 'four', label: '电气工程' }, // 特急
  { percentage: 0, color: '#3F55D3', type: 'five', label: '给排数工程' }, // 特急
])

const handleTabClick = (tab) => {
  activeTab.value = tab
}

const initChart = () => {
  myChart = echarts.init(chartRef16.value)
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
      data: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
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
        data: [40, 20, 80, 60, 30, 20, 90, 40, 60],
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
const initChart22 = () => {
  myChart22 = echarts.init(chartRef22.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    legend: {
      show: false,
      orient: 'vertical',
      right: '3%',
      top: '4%',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 14,
      icon: 'circle',
      textStyle: {
        color: '#fff',
        fontSize: 14,
        padding: [0, 20],
      },
      formatter: function (name) {
        let data = option.series[0].data
        let target
        let color
        for (let i = 0; i < data.length; i++) {
          if (data[i].name === name) {
            target = data[i].value
            color = data[i].itemStyle.color
          }
        }
        return ['{name|' + name + '}', '{value|' + target + '%}'].join('          ') // 使用多个空格来控制间距
      },
      // ... existing code ...
      textStyle: {
        rich: {
          name: {
            color: function (params) {
              let data = option.series[0].data
              for (let i = 0; i < data.length; i++) {
                if (data[i].name === params.name) {
                  return data[i].itemStyle.color
                }
              }
            },
            fontSize: 14,
            padding: [0, 30, 0, 10],
          },
          value: {
            color: '#fff',
            fontSize: 14,
            padding: [0, 0, 0, 0],
          },
        },
      },
    },
    // graphic: [
    //   {
    //     //环形图中间添加文字
    //     type: 'text', //通过不同top值可以设置上下显示
    //     left: '10%',
    //     top: '51%',
    //     style: {
    //       text: `总数 ${total.value}`,
    //       textAlign: 'center',
    //       fill: '#fff', //文字的颜色
    //       fontSize: 20,
    //       lineHeight: 20,
    //     },
    //   },
    // ],
    series: [
      {
        type: 'pie',
        radius: ['52%', '65%'],
        center: ['46%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          fontSize: 14,
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
              fontSize: 14,
              color: '#fff',
              padding: [0, 0],
            },
          },
        },
        data: [
          { value: 10, name: '弱电工程', itemStyle: { color: '#40F0FF' } },
          { value: 20, name: '消防工程', itemStyle: { color: '#807E6F' } },
          { value: 30, name: '暖通工程', itemStyle: { color: '#FEB817' } },
          { value: 40, name: '电气工程', itemStyle: { color: '#3FD385' } },
          { value: 40, name: '给排数工程', itemStyle: { color: '#4A17FF' } },
        ],
      },
    ],
  }
  myChart22.setOption(option)
}
onMounted(async () => {
  await nextTick()
  if (chartRef16.value) {
    initChart()

    window.addEventListener('resize', () => {
      myChart && myChart.resize()
    })
  }
  if (chartRef22.value) {
    initChart22()
    window.addEventListener('resize', () => {
      myChart22 && myChart22.resize()
    })
  }
})
onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  window.removeEventListener('resize', () => {
    myChart && myChart.resize()
  })
  if (myChart22) {
    myChart22.dispose()
    myChart22 = null
  }
  window.removeEventListener('resize', () => {
    myChart22 && myChart22.resize()
  })
})
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
.dev-num-copy {
  background-color: rgba(9, 104, 170, 0.3);
  color: #ffffff;
  padding: 0 20px 20px 20px;
  border-radius: 0 0 10px 10px;
  margin-bottom: 10px;

  .content {
    display: flex;
    gap: 20px;
    .title {
      margin-top: 8px;
      font-family: MicrosoftYaHei;
      font-size: 14px;
      color: #ffffff;
      margin-bottom: 32px;
    }
    .left {
      width: 48%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 24px;
      padding: 10px;
      .img-box {
        position: relative;
        height: 174px;
        width: 45%;
      }
      .circle-outer {
        position: absolute;
        left: 10px;
        top: 6px;
        width: 160px;
        height: 160px;
      }
      .chart-container {
        width: 100%;
        height: 174px;
      }
      .statistics {
      }
      .stat-item {
        display: flex;
        align-items: center;
        margin: 12px 0;
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
    .flex-box {
      display: flex;
      width: 100%;
      position: relative;
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
      width: 48%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 24px;
      padding: 10px;

      .chart-container {
        width: 100%;
        height: 174px;
      }
    }
  }
}
</style>
