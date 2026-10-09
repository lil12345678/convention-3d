<!-- 会展信息 -->
<template>
  <div class="con-info left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">会展信息</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="title">展会排期</div>
        <img src="../../assets/img/c11.png" alt="" class="img" />
        <div class="top-box">
          <img :src="src" alt="" class="left-img" v-if="src" />
          <img src="../../assets/img/no-data.png" class="left-img" v-else />

          <div class="tag">今日会展</div>
          <div class="text-box">
            <div class="text-title">{{ title }}</div>
            <div class="text-date">{{ date }}</div>
            <div
              class="btn"
              :style="{ backgroundColor: title == '暂无数据' ? '#cfcfcf' : '#419eef' }"
            >
              {{ btn }}
            </div>
          </div>
        </div>

        <!-- 月份选择器 -->
        <div class="month-select">
          <div class="month-scroll">
            <div
              v-for="month in 12"
              :key="month"
              :class="['month', { active: activeMonth === month }]"
              @click="selectMonth(month)"
            >
              {{ month.toString().padStart(2, '0') }}月
            </div>
          </div>
        </div>
        <div class="info-left">
          <div class="scroll-container" v-if="list.length">
            <div class="hall-item" v-for="(item, index) in list" :key="index">
              <img src="../../assets/img/build.png" alt="" class="hall-icon" />
              <div class="hall-text">
                <div class="hall-name">
                  {{ item.name }}
                </div>
                <div class="hall-date">{{ item.date }}</div>
                <!-- <div class="line"></div> -->
              </div>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>

      <div class="right">
        <div class="title">会议安排</div>
        <div class="timeline-container">
          <div class="timeline" v-if="timelineData.length">
            <div class="timeline-item" v-for="(item, index) in timelineData" :key="index">
              <div class="type">{{ item.type }}</div>
              <div class="time-point">
                <div class="line"></div>
                <div class="point"></div>
              </div>
              <div class="meeting-info">
                <div class="meeting-card">
                  <div class="meeting-time">{{ item.time }}</div>
                  <div class="meeting-title">{{ item.title }}</div>
                  <div class="meeting-location">{{ item.location }}</div>
                  <div class="meeting-date flex items-center">
                    <div>{{ item.room }}</div>
                    <div>{{ item.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Empty from '@/components/commonVue/emptyData.vue'
import { getExhibitionEvents, getExhibitions } from '@/utils/screenStats'

const src = ref(null)
const title = ref('暂无数据')
const date = ref('--')
const btn = ref('暂无场馆')
const activeMonth = ref(new Date().getMonth() + 1)
const list = ref([])
const timelineData = ref([])
let exhibitions = []
let events = []

const applyMonth = () => {
  const year = new Date().getFullYear()
  const rows = exhibitions.filter((item) => item.year === year && item.month === activeMonth.value)
  list.value = rows.map((item) => ({
    name: `${item.name}（${item.hall_name}）`,
    date: `${item.start_date} - ${item.end_date}`,
  }))
  const current = rows[0] || exhibitions.find((item) => item.status === '进行中')
  if (current) {
    title.value = current.name
    date.value = `${current.start_date} - ${current.end_date}`
    btn.value = current.hall_name
  }
  const ids = new Set(rows.map((item) => item.id))
  timelineData.value = events
    .filter((item) => !rows.length || ids.has(item.exhibition_id))
    .map((item) => ({
      type: item.event_type,
      time: item.start_time,
      title: item.title,
      location: item.location,
      room: item.room,
      date: item.hall_name,
    }))
}
const selectMonth = (month) => {
  activeMonth.value = month
  applyMonth()
}

onMounted(async () => {
  ;[exhibitions, events] = await Promise.all([getExhibitions(), getExhibitionEvents()])
  applyMonth()
})
</script>

<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/month.scss';
@use '@/assets/style/leftRight.scss';
.con-info {
  .title {
    margin-top: 10px;
  }
  .left {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .img {
      position: absolute;
      top: 54px;
      height: 140px;
      // border: 1px dashed rgba(255, 255, 255, 0.5);
      margin: 10px 0;
    }
    .top-box {
      height: 140px;
      margin-bottom: 26px;
      position: relative;
      left: 16px;
      top: 14px;
      display: flex;
      align-items: center;
      // justify-content: space-between;
      gap: 10px;
      padding-right: 42px;
      .tag {
        position: absolute;
        top: 20px;
        left: 0;
        width: 76px;
        height: 28px;
        background: linear-gradient(
          270deg,
          rgba(0, 222, 255, 0.8) 0%,
          #5dabff 50%,
          rgba(0, 63, 150, 0.8) 100%
        );
        font-family: MicrosoftYaHei, MicrosoftYaHei;
        font-size: 12px;
        color: #ffffff;
        line-height: 28px;
        text-align: center;
        border-radius: 0 20px 20px 0;
      }
      .left-img {
        width: 160px;
        height: 120px;
        object-fit: cover;
        margin-top: 20px;
      }
      .text-box {
        text-align: left;
        margin-top: 20px;
        .text-title {
          width: 230px;
          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #00b4ff;
        }
        .btn {
          width: 54px;
          background: #06b3f3;
          border-radius: 4px;
          font-family: MicrosoftYaHei;
          font-size: 12px;
          color: #ffffff;
          padding: 4px 6px;
          text-align: center;
          margin-top: 20px;
        }
        .text-date {
          font-family: MicrosoftYaHei;
          font-size: 13px;
          color: #ffffff;
        }
      }
    }

    .info-left {
      height: 590px; // 固定高度，显示6个项目
      width: 100%;
      position: relative;
      .scroll-container {
        height: 100%;
        overflow-y: auto;
        padding-right: 10px;

        /* 自定义滚动条样式 */
        &::-webkit-scrollbar {
          width: 0;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 170, 255, 0.5);
          border-radius: 2px;
        }
      }

      .hall-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        .hall-icon {
          width: 80px;
          height: 60px;
          // margin-left: 10px;
        }

        .hall-text {
          flex: 1;
          text-align: left;
          border-bottom: 1px solid #4c5973;
          padding: 10px 0;
          .hall-name {
            font-size: 14px;
            margin-bottom: 4px;
            color: #00b4ff;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .hall-date {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
  .right {
    padding-bottom: 20px;
    .timeline-container {
      height: 760px;
      overflow-y: auto;
      padding: 20px 10px;
      margin-top: 20px;
      position: relative;
      &::-webkit-scrollbar {
        width: 0;
      }
      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 170, 255, 0.5);
        border-radius: 2px;
      }
    }

    .timeline {
      position: relative;
      padding-left: 20px;
      .timeline-item {
        display: flex;

        margin-bottom: 20px;
        position: relative;
        .type {
          position: absolute;
          left: -26px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
        }
        .time-point {
          position: absolute;
          left: 58px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;

          .point {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #00b4ff;
            border: 3px solid #ffffff;
            border-radius: 50%;
            z-index: 9;
          }

          .line {
            position: absolute;
            left: 8px; // 居中对齐
            width: 2px;
            height: 166px; // 延伸整个容器
            background: #b0e8ff;
            z-index: 0;
          }
        }

        .meeting-info {
          width: 100%;
          margin-left: 100px;
          .meeting-time {
            font-family: DINAlternate, DINAlternate;
            font-weight: bold;
            font-size: 16px;
            color: #ffffff;
            margin-bottom: 10px;
          }

          .meeting-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px;
            text-align: left;
            .meeting-title {
              font-family: MicrosoftYaHei;
              font-size: 14px;
              color: #00b4ff;
              margin-bottom: 4px;
            }

            .meeting-location {
              font-family: MicrosoftYaHei;
              font-size: 13px;
              color: #ffffff;
              margin-bottom: 10px;
            }

            .meeting-date {
              color: rgba(255, 255, 255, 0.6);
              font-size: 12px;
              div {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                margin-right: 10px;
                padding: 2px 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
