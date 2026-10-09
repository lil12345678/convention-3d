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
            <div class="value">{{ num2 }}<span>个</span></div>
            <div class="label">展馆数量</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num3 }}<span>个</span></div>
            <div class="label">登录厅数量</div>
          </div>
        </div>
        <div class="energy-cards">
          <div class="card">
            <img src="../../assets/img/c4.png" alt="" class="img" />
            <div class="value">{{ num4 }}<span>场</span></div>
            <div class="label">展会场次</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c5.png" alt="" class="img" />
            <div class="value">{{ num5 }}<span>人</span></div>
            <div class="label">参展人次</div>
          </div>
          <div class="card">
            <img src="../../assets/img/c6.png" alt="" class="img" />
            <div class="value">{{ num6 }}<span>人</span></div>
            <div class="label">在馆人数</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="chart-header">
          <div class="title">展会状态</div>
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
import { formatInt, getCrowd, getExhibitions, getHalls, percent } from '@/utils/screenStats'
const num1 = ref('--') //
const num2 = ref('--') //
const num3 = ref('--') //
const num4 = ref('--') //
const num5 = ref('--') //
const num6 = ref('--') //

const progresstitle1 = ref('进行中占比')
const progresstitle2 = ref('已结束占比')
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
onMounted(async () => {
  const [halls, exhibitions, crowd] = await Promise.all([getHalls(), getExhibitions(), getCrowd()])
  const area = halls.reduce((total, item) => total + Number(item.area_sqm || 0), 0)
  num1.value = formatInt(area)
  num2.value = halls.filter((item) => item.hall_type === '展馆').length
  num3.value = halls.filter((item) => item.hall_type === '登录厅').length
  num4.value = exhibitions.length
  num5.value = formatInt(exhibitions.reduce((total, item) => total + item.visitors, 0))
  num6.value = formatInt(crowd.total)
  percentage1.value = percent(exhibitions.filter((item) => item.status === '进行中').length, exhibitions.length)
  percentage2.value = percent(exhibitions.filter((item) => item.status === '已结束').length, exhibitions.length)
})
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
