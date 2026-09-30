<!-- 综合态势 -->
<template>
  <div class="layout-container">
    <div class="left-panel">
      <HallOverview />
      <HallInfo />
    </div>

    <div class="right-panel">
      <AlarmStatistics />
      <EnergyStatistics />
      <WorkStatistics />
      <!-- 右侧内容 -->
    </div>
  </div>
</template>

<script setup>
import HallOverview from '@/components/comSituation/hallOverview.vue'
import HallInfo from '@/components/comSituation/hallInfo.vue'
import AlarmStatistics from '@/components/comSituation/alarmStatistics.vue'
import EnergyStatistics from '@/components/comSituation/energyStatistics.vue'
import WorkStatistics from '@/components/comSituation/workStatistics.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/style/layout-container.scss';
</style>
