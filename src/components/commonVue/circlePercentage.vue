<!-- 环状百分比 -->
<template>
  <div class="circle-percentage-wrapper">
    <img src="../../assets/img/circle-data2.png" class="circle-outer" />
    <div class="progress-ring">
      <svg viewBox="0 0 100 100">
        <circle class="progress-ring-circle-bg" cx="50" cy="50" r="40" />
        <circle
          v-for="(item, index) in data"
          :key="index"
          class="progress-ring-circle"
          cx="50"
          cy="50"
          r="40"
          :style="{
            strokeDasharray: `${(() => {
              const pct = Number(item.percentage) || 0
              const total = data.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0)
              return total === 0 || pct < 0.0001 ? 0 : (pct / total) * 251.2
            })()} 251.2`,
            strokeDashoffset: getOffset(index),
            stroke: item.percentage < 0.0001 ? 'transparent' : item.color,
          }"
        />
      </svg>
      <div class="circle-inner">
        <div class="num" v-if="props.total">{{ props.total }}</div>
        <div class="num" v-if="props.per">{{ props.per }}</div>
        <div class="text">{{ text }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  total: {
    type: [Number, String],
    default: 0,
  },
  data: {
    type: Array,
    default: () => [],
  },
  text: {
    type: String,
    default: '',
  },
  per: {
    type: String,
    default: '',
  },
})
const getOffset = (index) => {
  const validData = props.data.map((item) => {
    const pct = Number(item.percentage)
    return isNaN(pct) ? 0 : pct // 非数字或NaN时置0
  })
  // 计算总百分比
  const total = validData.reduce((sum, pct) => sum + pct, 0)
  if (total === 0) return 0
  // 计算圆环周长
  const circumference = 251.2 // 使用与模板中相同的周长值

  let offset = 0
  for (let i = 0; i < index; i++) {
    // 根据每项占总数的比例计算偏移量
    offset += (validData[i] / total) * circumference
  }
  return -offset // 添加负号使圆环按顺时针方向显示
}
</script>
<style lang="scss" scoped>
.circle-percentage-wrapper {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  .circle-outer {
    position: absolute;
    // top: -12px;
    width: 140px;
  }
  .progress-ring {
    position: relative;
    width: 110px;
    height: 110px;

    svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    circle {
      fill: none;
      stroke-width: 10;
      stroke-linecap: butt;
    }

    .progress-ring-circle-bg {
      stroke: rgba(255, 255, 255, 0.1);
    }

    .progress-ring-circle {
      transition: stroke-dashoffset 0.3s;
    }

    .circle-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      .num {
        font-family: DINAlternate;
        font-weight: bold;
        font-size: 26px;
        color: #ffffff;
      }

      .text {
        font-family: DINAlternate;
        font-size: 12px;
        color: #ffffff;
      }
    }
  }
}
</style>
