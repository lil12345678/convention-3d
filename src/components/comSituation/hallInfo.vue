<!-- 场馆总览2 -->
<template>
  <div class="hall-info left-right-content">
    <div class="model-header">
      <img src="../../assets/img/title2.png" alt="" class="model-img-title" />
      <div class="model-head-title">展馆总览</div>
    </div>
    <div class="content">
      <div class="left">
        <div class="l-tilte">会展信息</div>
        <!-- 年份选择器 -->
        <div class="year-select">
          <div class="select-box" @click="showYearOptions = !showYearOptions">
            <span>{{ selectedYear }}年</span>
            <img
              src="../../assets/img/arrow-down.png"
              alt=""
              :class="{ rotate: showYearOptions }"
              class="arrow-icon"
            />
          </div>
          <div class="year-options" v-show="showYearOptions">
            <div class="year-item" v-for="year in yearList" :key="year" @click="selectYear(year)">
              {{ year }}年
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
                <div class="hall-name">{{ item.name }}</div>
                <div class="hall-date">{{ item.date }}</div>
                <div class="line"></div>
              </div>
            </div>
          </div>
          <Empty v-else />
        </div>
      </div>

      <div class="right">
        <div class="r-tilte">通行统计</div>
        <div class="info-right">
          <div class="stat-box">
            <img src="../../assets/img/card1.png" alt="" class="stat-icon" />
            <div class="stat-num">{{ num1 }}</div>
            <div class="stat-text">总车位</div>
          </div>
          <div class="stat-box">
            <img src="../../assets/img/card2.png" alt="" class="stat-icon" />
            <div class="stat-num">{{ num2 }}</div>
            <div class="stat-text">已使用</div>
          </div>
          <div class="stat-box">
            <img src="../../assets/img/card3.png" alt="" class="stat-icon" />
            <div class="stat-num">{{ num3 }}</div>
            <div class="stat-text">剩余车位</div>
          </div>
        </div>
        <div class="record-list">
          <div class="table-header">
            <span>序号</span>
            <span>展位号</span>
            <span>出口名称</span>
            <span>通行状况</span>
            <span>通行时间</span>
          </div>
          <div class="table-body" v-if="adataList.length">
            <div class="record-item" v-for="(item, index) in adataList" :key="index">
              <span>{{ item.sort || '--' }}</span>
              <span>{{ item.name || '--' }}</span>
              <span>{{ item.aa || '--' }}</span>
              <span>{{ item.unit || '--' }}</span>
              <span>{{ item.date2 || '--' }}</span>
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
import { getCrowd, getExhibitions, getParking } from '@/utils/screenStats'

const showYearOptions = ref(false)
const selectedYear = ref(2026)
const yearList = ref([2026, 2025])
const activeMonth = ref(new Date().getMonth() + 1)

const list = ref([])
const adataList = ref([])
const num1 = ref('--')
const num2 = ref('--')
const num3 = ref('--')
let exhibitions = []

onMounted(async () => {
  const [rows, parking, crowd] = await Promise.all([getExhibitions(), getParking(), getCrowd()])
  exhibitions = rows
  yearList.value = [...new Set(rows.map((item) => item.year))].sort((a, b) => b - a)
  if (yearList.value.length) selectedYear.value = yearList.value[0]
  num1.value = parking.total_spaces
  num2.value = parking.used_spaces
  num3.value = parking.free_spaces
  adataList.value = (crowd.items || []).map((item, index) => ({
    sort: String(index + 1).padStart(2, '0'),
    name: item.hall_name,
    aa: '馆内',
    unit: `${item.headcount}人`,
    date2: '实时',
  }))
  applyList()
})

const selectMonth = (month) => {
  activeMonth.value = month
  applyList()
}
const selectYear = (year) => {
  selectedYear.value = year
  showYearOptions.value = false
  applyList()
}
const applyList = () => {
  list.value = exhibitions
    .filter((item) => item.year === selectedYear.value && item.month === activeMonth.value)
    .map((item) => ({
      name: `${item.name}（${item.hall_name}）`,
      date: `${item.start_date} - ${item.end_date}`,
      id: item.id,
    }))
}
const getData = () => {
  list.value = [
    {
      name: '中国（中原）工业博览会展示会',
      date: '2024.12.06 - 2024.12.08',
      id: '1',
    },
    {
      name: '中国（中原）工业博览会展示会',
      date: '2024.12.06 - 2024.12.08',
      id: '2',
    },
    {
      name: '中国（中原）工业博览会展示会',
      date: '2024.12.06 - 2024.12.08',
      id: '3',
    },
  ]
}
const getNum = () => {
  num1.value = 100
  num2.value = 80
  num3.value = 20
}
const getListData = () => {
  adataList.value = [
    { id: '11', sort: '01', name: '展A1245A', aa: 'B1出入口', unit: '人', date2: '2024.12.06-08' },
    { id: '22', sort: '02', name: '展A1245A', aa: 'B1出入口', unit: '人', date2: '2024.12.06-08' },
  ]
}
</script>

<style lang="scss" scoped>
@use '@/assets/style/model-header.scss';
@use '@/assets/style/month.scss';
@use '@/assets/style/leftRight.scss';
.hall-info {
  overflow: hidden;
  overflow-y: hidden;

  .content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    .left {
      position: relative;
      .l-tilte {
        font-size: 14px;
        margin: 10px 0;
      }
      .info-left {
        height: 368px; // 固定高度，显示6个项目
        margin-top: 30px;
        position: relative;
        .scroll-container {
          height: 100%;
          overflow-y: auto;
          padding-right: 10px;

          /* 自定义滚动条样式 */
          &::-webkit-scrollbar {
            width: 4px;
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
          display: flex;
          align-items: center;
          gap: 10px;
          height: 62px;
          .line {
            width: 377px;
            height: 1px;
            background: #4c5973;
            // margin-top: 10px;
          }
          .hall-icon {
            width: 40px;
            // height: 40px;
            // margin-left: 10px;
          }

          .hall-text {
            flex: 1;
            text-align: left;
            .hall-name {
              font-size: 14px;
              margin-bottom: 4px;
              color: #00b4ff;
            }

            .hall-date {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.6);
              padding-bottom: 8px;
            }
          }
        }
      }
    }

    .right {
      padding: 0 10px 10px 10px;
      .r-tilte {
        margin: 20px 0;
        font-size: 14px;
      }
      .info-right {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .stat-box {
        position: relative;
        text-align: center;
        padding: 10px 0 0 0;
        // width: 140px;
        height: 65px;
        // margin-bottom: 10px;
        .stat-icon {
          position: absolute;
          top: 0;
          left: 0;
          width: 140px;
          // height: 65px;
          // border: 1px dashed rgba(255, 255, 255, 0.5);
        }
        .stat-num {
          font-family: DINAlternate;
          font-weight: bold;
          font-size: 26px;
          color: #fff;
          position: relative;
          // margin-bottom: 4px;
        }
        .stat-text {
          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #ffffff;
          position: relative;
          margin-top: -5px;
        }
      }

      .record-list {
        // width: 100%;
        height: 354px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        border: 1px solid #516aa2;
        overflow: hidden;
        position: relative;
        .table-header {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr 1.2fr 0.8fr 1fr;
          padding: 10px;
          background: rgba(0, 137, 255, 0.5);
          font-size: 12px;
          color: #00b4ff;
          text-align: center;
        }

        .table-body {
          height: calc(100% - 20px);

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
            grid-template-columns: 0.8fr 1fr 1fr 0.8fr 1.4fr;
            padding: 0 10px;
            height: 44px;
            line-height: 44px;
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
  }
  .year-select {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 80px;
    height: 20px;
    // margin: 15px auto;

    .select-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      background: linear-gradient(
        270deg,
        rgba(0, 222, 255, 0.8) 0%,
        #5dabff 50%,
        rgba(0, 63, 150, 0.8) 100%
      );
      border-radius: 4px;
      cursor: pointer;
      // border: 1px solid rgba(255, 255, 255, 0.1);
      .rrow-icon {
        width: 12px;
      }
      span {
        color: #fff;
        font-size: 12px;
      }

      img {
        width: 16px;
        height: 16px;
        transition: transform 0.3s;

        &.rotate {
          transform: rotate(180deg);
        }
      }
    }

    .year-options {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: rgba(9, 104, 170, 0.9);
      border-radius: 4px;
      margin-top: 5px;
      z-index: 10;
      font-size: 12px;
      .year-item {
        padding: 8px 12px;
        cursor: pointer;
        text-align: center;

        &:hover {
          background: rgba(0, 170, 255, 0.3);
        }
      }
    }
  }
  // .empty-box {
  //   position: absolute;
  //   top: 40%; // 垂直居中;
  //   left: 50%; // 水平居中;
  //   transform: translate(-50%, -40%); // 居中对齐;
  //   .empty-img {
  //     width: 160px;
  //     height: auto;
  //   }
  //   .empty-text {
  //     color: rgba(255, 255, 255, 0.5);
  //   }
  // }
}
</style>
