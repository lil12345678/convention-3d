<!-- 能源管理系统 -->
<template>
  <div class="layout-container">
    <div class="left-panel">
      <PowerUse />
      <PropStat />
      <WaterUse />
      <WaterTop />
    </div>

    <div class="right-panel">
      <Alarm />
      <WorkList />
      <analysis />
      <Number />
    </div>
  </div>
</template>

<script setup>
import PowerUse from '@/components/energy/powerUse.vue'
import PropStat from '@/components/energy/propStat.vue'
import WaterUse from '@/components/energy/waterUse.vue'
import WaterTop from '@/components/energy/waterTop.vue'
import Alarm from '@/components/energy/alarm.vue'
import WorkList from '@/components/energy/workList.vue'
import analysis from '@/components/energy/analysis.vue'
import Number from '@/components/energy/number.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/style/layout-container.scss';
</style>
