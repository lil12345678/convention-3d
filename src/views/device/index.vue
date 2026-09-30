<!-- 综合态势 -->
<template>
  <div class="layout-container">
    <div class="left-panel">
      <DeviceStatic />
      <Warn />
      <WarnNum />>
    </div>

    <div class="right-panel">
      <WorktypeNum />
      <Top />
      <WorkList />
    </div>
  </div>
</template>

<script setup>
import DeviceStatic from '@/components/device/deviceStatic.vue'
import Warn from '@/components/device/warn.vue'
import WarnNum from '@/components/device/warnNum.vue'
import WorktypeNum from '@/components/device/worktypeNum.vue'
import Top from '@/components/device/top5.vue'
import WorkList from '@/components/device/workList.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/style/layout-container.scss';
</style>
