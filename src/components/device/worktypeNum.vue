<!-- 设备告警 -->
<template>
  <div class="device-warn left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">设备工单</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">工单数量</div>

        <circleProgress
          :percentage="percentage"
          :title="progresstitle"
          :color="'#aefecb'"
          :progressOffset="progressOffset"
        />

        <div class="statistics">
          <div class="data-row">
            <div class="card">
              <img src="../../assets/img/c5.png" alt="" class="img" />
              <div class="value">{{ num1 }}<span>个</span></div>
              <div class="label">今日工单</div>
            </div>
            <div class="card">
              <img src="../../assets/img/c4.png" alt="" class="img" />
              <div class="value">{{ num2 }}<span>个</span></div>
              <div class="label">工单总数</div>
            </div>
          </div>
          <div class="status-row">
            <div class="status-item" v-for="(i, index) in list" :key="index">
              <span class="label">{{ i.label }}</span>
              <span class="value">{{ i.value }} 个</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">工单类型占比</div>
        <div class="flex-box flex around items-center">
          <CirclePercentage :data="rightdata" :total="righttotal" :text="rightdata[0].label" />
          <div class="statistics">
            <div class="stat-item" v-for="(item, index) in rightdata" :key="index">
              <span class="dot" :class="item.type"></span>
              <span class="label" :class="item.type">{{ item.label }}</span>
              <div class="value">
                {{ item.percentage }}
                <span v-if="!isNaN(item.percentage) && typeof item.percentage === 'number'">%</span>
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
import CirclePercentage from '@/components/commonVue/circlePercentage.vue'
import { getWorkOrderView } from '@/utils/screenStats'

const percentage = ref('--')
const progresstitle = ref('工单完成率')
const circumference = 2 * Math.PI * 45
const progressOffset = computed(() => {
  const per = Number(percentage.value)
  if (!isNaN(per) && typeof per === 'number') {
    return circumference * (1 - percentage.value / 100)
  } else {
    return circumference * (1 - 0 / 100)
  }
})
const list = ref([
  { label: '待处理', value: '--' },
  { label: '处理中', value: '--' },
  { label: '已处理', value: '--' },
  { label: '已超期', value: '--' },
])
const num1 = ref('--') // 今日工单
const num2 = ref('--') // 工单总数

const rightdata = ref([
  { percentage: '--', color: '#17fcff', type: 'danger', label: '维修工单' }, // 一般
  { percentage: '--', color: '#4a17ff', type: 'warning', label: '报事工单' }, // 较急
  { percentage: '--', color: '#feb817', type: 'normal', label: '投诉工单' }, // 紧急
  { percentage: '--', color: '#f33e3e', type: 'best', label: '巡更工单' }, // 特急
  { percentage: '--', color: '#cd17ff', type: 'five', label: '咨询工单' }, // 特急
])
const righttotal = ref('--')
onMounted(async () => {
  const data = await getWorkOrderView()
  percentage.value = data.completion
  num1.value = data.today
  num2.value = data.total
  list.value = [
    { label: '待处理', value: data.statuses[0].count },
    { label: '处理中', value: data.statuses[1].count },
    { label: '已处理', value: data.statuses[2].count },
    { label: '已超期', value: data.overdue },
  ]
  const colors = ['#17fcff', '#4a17ff', '#feb817', '#f33e3e', '#cd17ff']
  const types = ['danger', 'warning', 'normal', 'best', 'five']
  rightdata.value = data.types.map((item, index) => ({
    percentage: item.percentage,
    color: colors[index],
    type: types[index],
    label: item.name,
  }))
  righttotal.value = data.total
})
const getData = () => {
  percentage.value = 80
  const data = 12390

  let roundedData = data.toString()
  const formattedData = roundedData.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  num1.value = formattedData
  num2.value = formattedData
  list.value = [
    { label: '待处理', value: 85 },
    { label: '处理中', value: 74 },
    { label: '已处理', value: 61 },
    { label: '已超期', value: 10 },
  ]
}
const getRightdata = () => {
  righttotal.value = 100
  rightdata.value = [
    { percentage: 10, color: '#17fcff', type: 'danger', label: '维修工单' }, // 一般
    { percentage: 20, color: '#4a17ff', type: 'warning', label: '报事工单' }, // 较急
    { percentage: 30, color: '#feb817', type: 'normal', label: '投诉工单' }, // 紧急
    { percentage: 40, color: '#f33e3e', type: 'best', label: '巡更工单' }, // 特急
    { percentage: 40, color: '#cd17ff', type: 'five', label: '咨询工单' }, // 特急
  ]
}
</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/tabs.scss';
@use '@/assets/style/leftRight.scss';
.device-warn {
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
  .title {
    margin-bottom: 32px;
  }
  .left {
    position: relative;
    .title {
      margin-bottom: 20px;
    }
    .statistics {
      position: absolute;
      right: 0;
      top: 48px;
      padding: 20px 10px 0 20px;
      .data-row {
        display: flex;
        gap: 10px;
        padding-bottom: 20px;
      }
      .card {
        width: 130px;
        position: relative;
        color: #fff;
        .img {
          width: 130px;
          height: 80px;
          position: absolute;
          top: 0;
          left: 0;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .value {
          font-size: 26px;
          margin-top: 10px;
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
          color: #fff;
        }
        .img-icon {
          width: 80px;
        }
      }

      .status-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding-top: 20px;
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;

          .label {
            color: #00d0ff;
          }

          .value {
            color: #fff;
            font-family: DINAlternate;
          }
        }
      }
    }
  }
  .right {
    position: relative;
    .title {
      font-family: MicrosoftYaHei;
      font-size: 14px;
      color: #ffffff;
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
        &.five {
          background: #cd17ff;
        }
      }

      .label {
        // width: 40px;
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
        &.five {
          color: #cd17ff;
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
