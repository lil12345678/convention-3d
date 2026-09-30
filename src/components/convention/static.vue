<!-- 展会信息 -->
<template>
  <div class="con-static left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">展会信息</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">展会统计</div>
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c4.png" alt="" class="img" />
            <div class="value">{{ num1 }}<span>m²</span></div>
            <div class="label">展览面积</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c5.png" alt="" class="img" />
            <div class="value">{{ num2 }}<span>m²</span></div>
            <div class="label">标摊面积</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num3 }}<span>m²</span></div>
            <div class="label">特装面积</div>
          </div>
        </div>
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c4.png" alt="" class="img" />
            <div class="value">{{ num4 }}<span>家</span></div>
            <div class="label">参展商家</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c5.png" alt="" class="img" />
            <div class="value">{{ num5 }}<span>人</span></div>
            <div class="label">专业观众</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num6 }}<span>人</span></div>
            <div class="label">普通观众</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">展会满意度</div>
          <div class="flex items-center between circle-box">
            <circleProgress
              :percentage="percentage1"
              :title="progresstitle1"
              :color="'#00D0FF'"
              :progressOffset="progressOffset1"
              :imgFlag="'blue'"
              :fontColor="'#fff'"
            />
            <circleProgress
              :percentage="percentage2"
              :title="progresstitle2"
              :color="'#29FFD1'"
              :progressOffset="progressOffset2"
              :imgFlag="'blue'"
              :fontColor="'#fff'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import circleProgress from '../commonVue/circleProgress.vue'
const num1 = ref('--') //
const num2 = ref('--') //
const num3 = ref('--') //
const num4 = ref('--') //
const num5 = ref('--') //
const num6 = ref('--') //

const progresstitle1 = ref('观众满意度')
const progresstitle2 = ref('展商满意度')
const percentage1 = ref('--')
const percentage2 = ref('--')
const circumference = 2 * Math.PI * 45
const progressOffset1 = computed(() => {
  const percentage = Number(percentage1.value)
  if (!isNaN(percentage) && typeof percentage === 'number') {
    return circumference * (1 - percentage1.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
const progressOffset2 = computed(() => {
  const percentage = Number(percentage2.value)
  if (!isNaN(percentage) && typeof percentage === 'number') {
    return circumference * (1 - percentage2.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
onMounted(() => {
  // getNum()
  // getPercent1()
  // getPercent2()
})
const getNum = () => {
  const data = 1234

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  num2.value = formattedData
  num3.value = formattedData
  num4.value = formattedData
  num5.value = formattedData
  num6.value = formattedData
}
const getPercent1 = () => {
  const data = 29.2918
  if (data > 100) {
    percentage1.value = 100
  } else {
    percentage1.value = Math.round(data)
  }
}
const getPercent2 = () => {
  const data = 40
  if (data > 100) {
    percentage1.value = 100
  } else {
    percentage2.value = Math.round(data)
  }
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.con-static {
  margin-bottom: 0;
  border-radius: 24px 24px 0 0;
  .left {
    .energy-cards {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-top: 10px;
      padding-bottom: 10px;
      .card {
        width: 140px;
        height: 90px;
        position: relative;
        color: #fff;
        .img {
          width: 140px;
          height: 90px;
          position: absolute;
          top: 0;
          left: 0;
        }
        .value {
          font-size: 26px;
          margin-top: 12px;
          position: relative;
          z-index: 1;
          font-family: DINAlternate;
          span {
            font-size: 14px;
            margin-left: 5px;
          }
        }

        .label {
          position: relative;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 10px;
        }
        .img-icon {
          width: 80px;
        }
      }
    }
  }

  .right {
    .circle-box {
      // margin-top: 20px;
      padding: 20px 30px 0 30px;
    }
  }
}
.circle-progress-wrapper {
  .text {
    color: #fff;
  }
}
</style>
