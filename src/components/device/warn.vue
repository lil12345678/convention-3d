<!-- 设备告警 -->
<template>
  <div class="dev-warn left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">设备告警</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="relative">
          <div class="title">告警数</div>
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
              <span
                :class="['tab-item', { active: activeTab === '年' }]"
                @click="handleTabClick('年')"
                >年</span
              >
            </div>
          </div>
        </div>
        <div class="left-item">
          <span>同比</span>
          <span class="up"
            >{{ num1 }}<span v-if="!isNaN(num1) && typeof num1 === 'number'">%</span></span
          >
          <img src="../../assets/img/up1.png" alt="" v-if="upStatus" />
          <img src="../../assets/img/down.png" alt="" v-if="downStatus" />
        </div>
        <div class="flex-box">
          <div class="circle-wrapper">
            <img src="../../assets/img/circle-data3.png" class="circle-outer" />
            <div class="circle-inner">
              <div class="num">{{ num2 }}</div>
              <div class="text">告警数(件)</div>
            </div>
          </div>
          <div class="statistics">
            <div class="stat-item" v-for="(i, index) in legentdata" :key="index">
              <span class="dot" :class="i.type"></span>
              <span class="label" :class="i.type">{{ i.label }}</span>
              <div class="value">{{ i.value }} 件</div>
              <div class="percent">
                {{ i.percentage
                }}<span v-if="!isNaN(i.percentage) && typeof i.percentage === 'number'">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">告警处置</div>

        <circleProgress
          :percentage="percentage"
          :title="progresstitle"
          :color="'#aefecb'"
          :progressOffset="progressOffset"
          :innertitle="innertitle"
        />
        <div class="progress">
          <div class="progress-item">
            <div class="progress-item" v-for="(item, index) in progressData" :key="index">
              <div class="progress-row">
                <span class="label">{{ item.label }}</span>
                <el-progress
                  :percentage="item.percentage"
                  :show-text="false"
                  :stroke-width="15"
                  :color="item.color"
                />
                <div class="value-box">
                  <span>{{ item.value }} 件</span>
                  <!-- <span class="percentage">{{ item.percentage }}%</span> -->
                </div>
              </div>
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

const num1 = ref('--')
const upStatus = ref(false)
const downStatus = ref(false)
const num2 = ref('--')
const legentdata = ref([
  { percentage: '--', value: '--', color: '#03a30e', type: 'normal', label: '在线' },
  { percentage: '--', value: '--', color: '#ffb800', type: 'warning', label: '离线' },
  { percentage: '--', value: '--', color: '#ff4d4f', type: 'danger', label: '故障' },
])

const percentage = ref('--')
const progresstitle = ref('')
const innertitle = ref('告警处置率')
const circumference = 2 * Math.PI * 45
const progressOffset = computed(() => {
  const per = Number(percentage.value)
  if (!isNaN(per) && typeof per === 'number') {
    return circumference * (1 - percentage.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
const progressData = ref([
  { label: '处理中', percentage: 1, value: '--', color: '#00B4FF' },
  { label: '已处理', percentage: 1, value: '--', color: '#AFFFCC' },
  { label: '未处理', percentage: 1, value: '--', color: '#FFB800' },
])
const activeTab = ref('月')

onMounted(() => {
  // getPer()
  // getData()
})
const handleTabClick = (tab) => {
  activeTab.value = tab
  getData()
}

const getData = () => {
  num1.value = 10
  upStatus.value = true
  downStatus.value = false

  const data = Math.round(12323.43)

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num2.value = formattedData

  legentdata.value = [
    { percentage: 10, value: 123, color: '#03a30e', type: 'normal', label: '在线' },
    { percentage: 32, value: 563, color: '#ffb800', type: 'warning', label: '离线' },
    { percentage: 51, value: 12356, color: '#ff4d4f', type: 'danger', label: '故障' },
  ]
}
const getPer = () => {
  const data = 29.2918
  if (data > 100) {
    percentage.value = 100
  } else {
    percentage.value = Math.round(data)
  }
  progressData.value = [
    { label: '处理中', percentage: 70, value: 4675, color: '#00B4FF' },
    { label: '已处理', percentage: 50, value: 4675, color: '#AFFFCC' },
    { label: '未处理', percentage: 20, value: 4675, color: '#FFB800' },
  ]
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.dev-warn {
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  .title {
    margin-bottom: 32px;
  }
  .left {
    position: relative;
    .flex-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .left-item {
      margin-left: 42%;
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 14px;
      span {
        color: #00d0ff;
      }
      img {
        width: 14px;
      }
      .up {
        color: #fff;
      }
    }
    .circle-wrapper {
      position: relative;
      width: 130px;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;

      .circle-outer {
        position: absolute;
        top: -12px;
        width: 130px;
      }

      .circle-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: -20px;
        .num {
          font-family: DINAlternate;
          font-weight: bold;
          font-size: 26px;
          color: #ffffff;
          position: relative;
        }

        .text {
          font-family: MicrosoftYaHei;
          font-size: 12px;
          color: #ffffff;
          line-height: 16px;
          position: relative;
        }
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
          &.normal {
            background: #03a30e;
          }
          &.warning {
            background: #ffb800;
          }
          &.danger {
            background: #ff4d4f;
          }
        }

        .label {
          width: 40px;
          margin-right: 60px;
          &.normal {
            color: #03a30e;
          }
          &.warning {
            color: #ffb800;
          }
          &.danger {
            color: #ff4d4f;
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
    position: relative;
  }
}
.progress {
  position: absolute;
  right: 10px;
  top: 108px;
  padding-bottom: 0;
  .progress-item {
    margin-bottom: 15px;
    .progress-row {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        width: 50px;
        color: #00d0ff;
        font-size: 14px;
      }

      .el-progress {
        width: 130px;
        // flex: 1;
      }

      .value-box {
        padding-left: 12px;
        // width: 120px;
        display: flex;
        gap: 10px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        span {
          padding-right: 12px;
        }
        .percentage {
          color: #fff;
        }
      }
    }
  }

  :deep(.el-progress-bar__outer) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px;
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 6px;
  }
}
</style>
