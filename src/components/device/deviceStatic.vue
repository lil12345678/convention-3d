<!-- 设备统计 -->
<template>
  <div class="dev-static left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">设备统计</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">设备概况</div>
        <div class="img-box">
          <img src="../../assets/img/c7.png" alt="" class="img" />
          <div class="text-box">
            <div class="text">设备总数</div>
            <div class="num">{{ num1 }}</div>
            <div class="text2">个</div>
          </div>
        </div>
        <div class="status-row">
          <div class="status-item" v-for="(i, index) in list" :key="index">
            <span class="label">{{ i.label }}</span>
            <span class="value">{{ i.num }}<span class="white">个</span></span>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">设备运行状态</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="rightdata" :total="righttotal" :text="'一般'" />
          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">{{ item.count }}</div>
              <div class="percent">
                {{ item.percentage
                }}<span v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'"
                  >%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

import CirclePercentage from '@/components/commonVue/circlePercentage.vue'
import { getDeviceView } from '@/utils/screenStats'

const num1 = ref('--')
const list = ref([
  { label: '弱电设备', num: '--' },
  { label: '暖通设备', num: '--' },
  { label: '消防设备', num: '--' },
  { label: '电气设备', num: '--' },
  { label: '给排水设备', num: '--' },
])
const rightdata = ref([
  { percentage: '--', color: '#17fcff', type: 'one', label: '在线' },
  { percentage: '--', color: '#807E6F', type: 'two', label: '离线' },
  { percentage: '--', color: '#feb817', type: 'three', label: '故障' },
])
const righttotal = ref('--')

onMounted(async () => {
  const data = await getDeviceView()
  num1.value = data.totalText
  list.value = data.groups
  righttotal.value = data.total
  rightdata.value = data.status
})

const getData = () => {
  const data = 1234567890

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  list.value = [
    { label: '弱电设备', num: 74 },
    { label: '暖通设备', num: 74 },
    { label: '消防设备', num: 61 },
    { label: '电气设备', num: 10 },
    { label: '给排水设备', num: 10 },
  ]
}
const getRightdata = () => {
  righttotal.value = 86

  rightdata.value = [
    { percentage: 10, color: '#17fcff', type: 'one', label: '在线' },
    { percentage: 20, color: '#807E6F', type: 'two', label: '离线' },
    { percentage: 30, color: '#feb817', type: 'three', label: '故障' },
  ]
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/leftRight.scss';
.dev-static {
  .title {
    margin-bottom: 32px;
  }
  .left {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .img-box {
      position: relative;
      width: 390px;
      height: 72px;
      .text-box {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .num {
        font-family: DINAlternate;
        font-weight: bold;
        font-size: 26px;
        color: #35b4ff;
        margin-left: 20px;
      }
      .text {
        font-family: MicrosoftYaHei;
        font-size: 14px;
        color: #ffffff;
      }
      .text2 {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 14px;
        color: #ffffff;
        padding-left: 10px;
      }
      .img {
        width: 390px;
        height: 72px;
        // border: 1px dashed rgba(255, 255, 255, 0.5);
      }
    }

    .status-row {
      display: grid;
      grid-template-columns: repeat(2, 46%);
      gap: 20px;
      margin-top: 30px;
      width: 100%;
      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        width: 100%;
        .label {
          color: #fff;
          // width: 120px;
          text-align: left;
          padding-left: 20px;
        }

        .value {
          color: #00d0ff;
          font-family: DINAlternate;
        }
        .white {
          color: #fff;
          padding-left: 12px;
        }
      }
    }
  }
  .right {
    .title {
      margin-bottom: 64px;
    }
    .flex-box {
      margin-top: 34px;
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
        &.three {
          background: #feb817;
        }
        &.two {
          background: #807e6f;
        }
        &.one {
          background: #17fcff;
        }
      }

      .label {
        width: 100px;
        text-align: left;
        &.three {
          color: #feb817;
        }
        &.two {
          color: #807e6f;
        }
        &.one {
          color: #17fcff;
        }
      }

      .value {
        margin-right: 32px;
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
