<!-- 安防态势 -->
<template>
  <div class="layout-container">
    <div class="left-panel">
      <AllOverview />
      <OverView />
      <AlarmAnalys />
    </div>

    <div class="right-panel">
      <VideoBox />
      <TransMng />
      <Contingency />
      <!-- 右侧内容 -->
    </div>
  </div>
</template>

<script setup>
import AllOverview from '@/components/secSituation/allView.vue'
import OverView from '@/components/secSituation/overView.vue'
import AlarmAnalys from '@/components/secSituation/alarmAnalys.vue'
import VideoBox from '@/components/secSituation/video.vue'
import TransMng from '@/components/secSituation/transMng.vue'
import Contingency from '@/components/secSituation/contingency.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/style/layout-container.scss';
</style>
