<!-- 告警分析 -->
<template>
  <div class="alarmAnalys left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">告警分析</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">告警事件类型 TOP5</div>

        <div class="progress">
          <div class="progress-item" v-for="(item, index) in alarmList" :key="index">
            <div class="progress-row">
              <div class="label" :style="{ color: item.color }">
                <span>{{ item.rank }}</span
                ><span class="num">{{ item.num }}</span>
              </div>
              <div class="text">{{ item.name }}</div>
              <el-progress
                :percentage="item.percentage"
                :show-text="false"
                :stroke-width="15"
                color="#FFFDAF"
              />
              <div class="value-box">
                <span>{{ item.value }}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">安防事件列表</div>
        <div class="record-list">
          <div class="table-header">
            <span>序号</span>
            <span>等级</span>
            <span>事件类型</span>
            <span>时间</span>
            <span>状态</span>
          </div>
          <div class="table-body" v-if="list.length">
            <div class="record-item" v-for="(item, index) in list" :key="index">
              <span>{{ item.sort }}</span>
              <span>{{ item.level }}</span>
              <span>{{ item.type }}</span>
              <span>{{ item.time }}</span>
              <span>{{ item.status }}</span>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import Empty from '@/components/commonVue/emptyData.vue'
import { getAlarmView } from '@/utils/screenStats'

const alarmList = ref([])

const list = ref([])
onMounted(async () => {
  const data = await getAlarmView()
  const colors = ['#DD1D4E', '#FFAF28', '#00D0FF', '#AFFFCC', '#fff']
  alarmList.value = data.byType.slice(0, 5).map((item, index) => ({
    rank: 'TOP',
    num: index + 1,
    name: item.name,
    value: item.count,
    percentage: item.percentage,
    color: colors[index],
  }))
  list.value = data.alarms.slice(0, 8).map((item, index) => ({
    sort: String(index + 1).padStart(2, '0'),
    level: item.alarm_level,
    type: item.alarm_type,
    time: item.alarm_time,
    status: item.alarm_status,
  }))
})

</script>
<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/leftRight.scss';
.alarmAnalys {
  .left {
    .stat-item1 {
      width: 100%;
      text-align: center;
      margin-top: 20px;
      .up-icon {
        width: 130px;
        height: 18px;
      }
      .span-text {
        font-family: DINAlternate;
        font-weight: bold;
        font-size: 26px;
        color: #35b4ff;
        line-height: 30px;
        text-align: center;
      }
    }
  }
  .flex-box {
    display: flex;
    width: 100%;
  }
  .right {
    .record-list {
      // width: 100%;
      height: 210px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid #516aa2;
      overflow: hidden;
      margin-top: 20px;
      position: relative;
      .empty-box {
        padding-top: 40px;
      }
      .table-header {
        display: grid;
        grid-template-columns: 0.6fr 0.8fr 1.2fr 1.5fr 1fr;
        padding: 10px;
        background: rgba(0, 137, 255, 0.5);
        font-size: 12px;
        color: #00b4ff;
        text-align: center;
      }

      .table-body {
        height: calc(100% - 40px);

        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 0;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 170, 255, 0.5);
          border-radius: 2px;
        }

        .record-item {
          display: grid;
          grid-template-columns: 0.7fr 0.8fr 1.2fr 1.5fr 1fr;
          // padding: 0 10px;
          height: 45px;
          line-height: 45px;
          font-size: 14px;
          text-align: center;
          border-bottom: 1px solid rgba(76, 89, 115, 0.5);
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background: rgba(0, 170, 255, 0.1);
          }
        }
      }
    }
  }

  .progress {
    padding: 20px;
    padding-bottom: 0;
    .progress-item {
      margin-bottom: 6px;
      .progress-row {
        display: flex;
        align-items: center;
        gap: 10px;

        .label {
          // width: 60px;
          padding-right: 6px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 24px;
          font-family: Headlines-Bold;
        }
        .text {
          width: 80px;
          text-align: left;

          font-size: 14px;
          color: #ffffff;
          line-height: 19px;
          font-style: normal;
        }
        .num {
          font-family: Isemin;
        }
        .el-progress {
          flex: 1;
        }

        .value-box {
          width: 60px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          text-align: right;
          .percentage {
            color: #fff;
          }
        }
        .TOP1 {
          color: #dd1d4e;
        }
        .TOP2 {
          color: #ffaf28;
        }
        .TOP3 {
          color: #00d0ff;
        }
        .TOP4 {
          color: #afffcc;
        }
        .TOP5 {
          color: #fff;
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
}
</style>
