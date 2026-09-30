<!-- 环状进度 -->
<template>
  <div class="circle-progress-wrapper">
    <img
      src="../../assets/img/circle-data2.png"
      class="circle-outer"
      v-if="props.imgFlag == 'blue'"
    />
    <img src="../../assets/img/circle-data1.png" class="circle-outer" v-else />
    <svg viewBox="0 0 100 100">
      <circle class="progress-background" cx="50" cy="50" r="45"></circle>
      <circle
        class="progress-bar"
        cx="50"
        cy="50"
        r="45"
        :style="{
          strokeDasharray: circumference,
          strokeDashoffset: props.progressOffset,
          stroke: color,
        }"
      ></circle>
    </svg>
    <div class="num" :class="[props.innertitle != '' ? 'num2' : 'num']">
      {{ props.percentage }}<span v-if="typeof props.percentage === 'number'">%</span>
    </div>
    <div class="innertitle">{{ props.innertitle }}</div>
    <div class="text" :style="{ color: props.fontColor }">{{ props.title }}</div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  percentage: {
    type: [Number, String],
    required: true,
    default: 0,
  },
  progressOffset: {
    type: Number,
    required: true,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#aefecb',
  },
  imgFlag: {
    type: String,
    default: 'yellow',
  },
  fontColor: {
    type: String,
    default: '#00d0ff',
  },
  innertitle: {
    type: String,
    default: '',
  },
})
const circumference = 2 * Math.PI * 45
</script>
<style lang="scss" scoped>
.circle-progress-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin-right: 10px;
  .num {
    line-height: 110px;
    font-family: DINAlternate;
    font-weight: bold;
    font-size: 26px;
    color: #ffffff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .num2 {
    // top: 4%;
  }
  .innertitle {
    position: absolute;
    top: 59%;
    left: 30%;
    font-size: 12px;
  }
  .text {
    font-size: 14px;
    color: #00d0ff;
    margin-top: 20px;
  }
  .circle-outer {
    width: 140px;
    height: 140px;
    position: absolute;
    left: 0;
    top: 0;
  }
  svg {
    width: 72%;
    height: 72%;
    transform: rotate(-90deg);
    margin-top: 20px;
    circle {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
    }

    .progress-background {
      stroke: rgba(255, 255, 255, 0.1);
    }

    .progress-bar {
      stroke: #aefecb;
      transition: stroke-dashoffset 0.3s ease;
    }
  }
}
</style>
