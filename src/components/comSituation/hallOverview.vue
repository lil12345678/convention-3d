<!-- 场馆总览 -->
<template>
  <div class="hall-overview left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">展馆总览</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="ratio-item">
          <div class="ratio-title">场馆使用面积占比</div>

          <circleProgress
            :percentage="percentage1"
            :title="progresstitle1"
            :color="'#fdfaa1'"
            :progressOffset="progressOffset1"
          />

          <div>
            <li><span>A馆</span><span class="font-Fam"> -- / --</span></li>
            <li><span>B馆</span><span class="font-Fam"> -- / --</span></li>
          </div>
        </div>
        <div class="ratio-item">
          <div class="ratio-title">会议室使用率</div>
          <circleProgress
            :percentage="percentage2"
            :title="progresstitle2"
            :color="'#00D0FF'"
            :progressOffset="progressOffset2"
            :imgFlag="'blue'"
          />
          <div>
            <li><span>小会议室</span><span class="font-Fam"> -- / --</span></li>
            <li><span>中会议室</span><span class="font-Fam"> -- / --</span></li>
            <li><span>大会议室</span><span class="font-Fam"> -- / --</span></li>
          </div>
        </div>
      </div>
      <div class="statistics">
        <div class="stat">
          <div class="stat-item">
            <div class="h-text">展会累计(个)</div>
            <div class="span-text">{{ num1 }}</div>
            <img src="../../assets/img/up.png" alt="" class="up-icon" />
            <div class="bottom-text">
              <span class="blue-text">同比</span><span>{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof tNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />

              <span class="blue-text">环比</span><span>{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />
            </div>
          </div>
          <div class="line"></div>
          <div class="stat-item">
            <div class="h-text">本年展会(个)</div>
            <div class="span-text">{{ num2 }}</div>
            <img src="../../assets/img/up.png" alt="" class="up-icon" />
            <div class="bottom-text">
              <span class="blue-text">同比</span><span>{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof tNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />

              <span class="blue-text">环比</span><span>{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />
            </div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-item">
            <div class="h-text">累计参展(人次)</div>
            <div class="span-text">{{ num3 }}</div>
            <img src="../../assets/img/up.png" alt="" class="up-icon" />
            <div class="bottom-text">
              <span class="blue-text">同比</span><span>{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof tNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />

              <span class="blue-text">环比</span><span>{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />
            </div>
          </div>
          <div class="line"></div>
          <div class="stat-item">
            <div class="h-text">本年参展(人次)</div>
            <div class="span-text">{{ num4 }}</div>
            <img src="../../assets/img/up.png" alt="" class="up-icon" />
            <div class="bottom-text">
              <span class="blue-text">同比</span><span>{{ tNum }}</span>
              <span v-if="!isNaN(tNum) && typeof tNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />

              <span class="blue-text">环比</span><span>{{ hNum }}</span>
              <span v-if="!isNaN(hNum) && typeof hNum === 'number'">%</span>
              <img src="../../assets/img/up1.png" alt="" class="up1-icon margin" v-if="upStatus" />
              <img src="../../assets/img/down.png" alt="" class="up1-icon" v-if="downStatus" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import circleProgress from '../commonVue/circleProgress.vue'

const percentage1 = ref('--')
const progresstitle1 = ref(null)
const percentage2 = ref('--')
const progresstitle2 = ref(null)
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

const num1 = ref('--')
const num2 = ref('--')
const num3 = ref('--')
const num4 = ref('--')
const hNum = ref('--')
const tNum = ref('--')
const upStatus = ref(false)
const downStatus = ref(false)

onMounted(() => {
  // getPercent1()
  // getPercent2()
  // getNum()
})

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
const getNum = () => {
  const data = 1234567890

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  num2.value = formattedData
  num3.value = formattedData
  num4.value = formattedData

  const data1 = 0
  tNum.value = Math.round(data1)
  hNum.value = Math.round(data1)
  upStatus.value = true
  downStatus.value = false
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/leftRight.scss';
.hall-overview {
  margin-bottom: 10px;

  .content {
    width: 100%;
    justify-content: space-between;

    .left {
      display: flex;
      gap: 20px;
      padding: 10px 10px 0 10px;
      .ratio-item {
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        .ratio-title {
          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #fff;
          margin: 10px 0 20px 0;
        }

        .circle {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 10px auto;
          font-size: 24px;
          color: #ffffff;
          position: relative;
          width: 140px;
          height: 140px;
          font-family: DINAlternate;
          span {
            font-weight: bold;
            font-size: 26px;
            color: #ffffff;
            line-height: 30px;
            z-index: 9;
          }
        }
        .circle-icon {
          width: 140px;
          height: 140px;
          position: absolute;
          top: 0;
          left: 0;
        }
        p {
          font-size: 16px;
        }

        li {
          font-size: 14px;
          line-height: 28px;
          list-style: none;
          padding-left: 20px;
        }
        span {
          color: #00d0ff;
          padding-right: 40px;
        }
        .font-Fam {
          font-family: DINAlternate;
          color: #fff;
        }
      }
    }

    .statistics {
      width: 48%;
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 10px;
      .stat {
        display: flex;
        width: 100%;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
      }
      .line {
        width: 1px;
        height: 50px;
        background: #4c5973;
      }
      .stat-item {
        text-align: center;
        width: 50%;
        .h-text {
          margin-top: 20px;
          font-size: 14px;
          margin-bottom: 26px;
          font-family: MicrosoftYaHei;
        }
        .up-icon {
          width: 110px;
        }
        .span-text {
          font-family: DINAlternate;
          font-weight: bold;
          font-size: 26px;
          color: #ffffff;
          line-height: 30px;
          text-align: center;
          margin-bottom: -10px;
        }

        .bottom-text {
          font-size: 14px;
          padding: 0 20px 20px 20px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 90%;
        }
        .blue-text {
          color: #00d0ff;
          font-size: 14px;
        }
        .up1-icon {
          width: 16px;
        }
        .margin {
          margin-right: 20px;
        }
      }
    }
  }
}
.circle-outer {
  top: 0 !important;
}
</style>
