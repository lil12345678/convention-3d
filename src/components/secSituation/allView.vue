<!-- 安防总览 -->
<template>
  <div class="sec-view left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">安防总览</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">安防设备状态监测</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="data" :total="total" :text="perText1" />
          <div class="">
            <div class="stat-item1">
              <div class="span-text">{{ num1 }}</div>
              <div class="span-text2">安防设备总数(个)</div>
              <img src="../../assets/img/up.png" alt="" class="up-icon" />
            </div>
            <div class="statistics">
              <div class="stat-item" v-for="(item, index) in data" :key="index">
                <span class="dot" :class="item.type"></span>
                <span class="label" :class="item.type">{{ item.label }}</span>
                <div class="value">{{ item.percentage }}</div>
                <div class="percent">
                  {{ item.percentage }}
                  <span v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'"
                    >%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">安防事件等级占比</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="rightdata" :total="righttotal" :text="perText2" />
          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">{{ item.percentage }} 件</div>
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

const data = ref([
  { percentage: '--', color: '#40f0ff', type: 'normal', label: '在线' }, // 在线
  { percentage: '--', color: '#807e6f', type: 'warning', label: '离线' }, // 离线
  { percentage: '--', color: '#ffaf28', type: 'danger', label: '故障' }, // 故障
])
const rightdata = ref([
  { percentage: '--', color: '#17fcff', type: 'danger', label: '一般' }, // 一般
  { percentage: '--', color: '#4a17ff', type: 'warning', label: '较急' }, // 较急
  { percentage: '--', color: '#feb817', type: 'normal', label: '紧急' }, // 紧急
  { percentage: '--', color: '#f33e3e', type: 'best', label: '特急' }, // 特急
])
const righttotal = ref('--')
const total = ref('--')
const perText1 = ref('在线')
const perText2 = ref('一般')
const num1 = ref('--')
onMounted(() => {
  // getData()
  // getRightdata()
})
const getData = () => {
  total.value = 100

  const d = 13456
  let roundedData = d.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData

  const list = [
    { percentage: 10, color: '#40f0ff', type: 'normal', label: '在线' }, // 在线
    { percentage: 40, color: '#807e6f', type: 'warning', label: '离线' }, // 离线
    { percentage: 10, color: '#ffaf28', type: 'danger', label: '故障' }, // 故障
  ]
  // 校验list中percentage并转换为有效数字（处理字符串/NaN情况）
  const validData = list.map((item) => {
    const pct = Number(item.percentage)
    return isNaN(pct) ? 0 : pct // 非数字或NaN时置0
  })
  data.value = validData.map((pct, index) => ({
    ...list[index], // 保留原始对象的其他属性
    percentage: pct, // 更新百分比
  }))
}
const getRightdata = () => {
  righttotal.value = 100
  const list = [
    { percentage: '12', color: '#17fcff', type: 'danger', label: '一般' }, // 一般
    { percentage: 20, color: '#4a17ff', type: 'warning', label: '较急' }, // 较急
    { percentage: 30, color: '#feb817', type: 'normal', label: '紧急' }, // 紧急
    { percentage: 40, color: '#f33e3e', type: 'best', label: '特急' }, // 特急
  ]
  // 校验list中percentage并转换为有效数字（处理字符串/NaN情况）
  const validData = list.map((item) => {
    const pct = Number(item.percentage)
    return isNaN(pct) ? 0 : pct // 非数字或NaN时置0
  })
  rightdata.value = validData.map((pct, index) => ({
    ...list[index], // 保留原始对象的其他属性
    percentage: pct, // 更新百分比
  }))
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/leftRight.scss';
.sec-view {
  margin-bottom: 0px;
  border-radius: 24px 24px 0 0;
  .left {
    .flex-box {
      margin-top: 24px;
    }

    .stat-item1 {
      width: 100%;
      text-align: center;
      .up-icon {
        width: 110px;
      }
      .span-text {
        font-family: DINAlternate;
        font-weight: 600;
        font-size: 26px;
        color: #35b4ff;
        line-height: 30px;
        text-align: center;
      }
      .span-text2 {
        font-family: PingFangSC;
        font-size: 12px;
        color: #ffffff;
        margin-bottom: -10px;
      }
    }

    .statistics {
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
          &.normal {
            background: #40f0ff;
          }
          &.warning {
            background: #807e6f;
          }
          &.danger {
            background: #ffaf28;
          }
        }

        .label {
          width: 40px;
          margin-right: 60px;
          &.normal {
            color: #40f0ff;
          }
          &.warning {
            color: #807e6f;
          }
          &.danger {
            color: #ffaf28;
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
  .right {
    .flex-box {
      margin-top: 46px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
      font-size: 14px;
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 10px;
        border: 1px solid #ffffff;
        &.best {
          background: #f33e3e;
        }
        &.normal {
          background: #feb817;
        }
        &.warning {
          background: #4a17ff;
        }
        &.danger {
          background: #17fcff;
        }
      }

      .label {
        width: 40px;
        margin-right: 60px;
        &.best {
          color: #f33e3e;
        }
        &.normal {
          color: #feb817;
        }
        &.warning {
          color: #4a17ff;
        }
        &.danger {
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
