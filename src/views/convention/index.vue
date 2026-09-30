<!-- 会展信息 -->
<template>
  <div class="layout-container">
    <div class="left-panel">
      <Info />
    </div>

    <div class="right-panel">
      <Static />
      <Server />
      <!-- 右侧内容 -->
    </div>
  </div>
</template>

<script setup>
import Info from '@/components/convention/info.vue'
import Static from '@/components/convention/static.vue'
import Server from '@/components/convention/server.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/style/layout-container.scss';
</style>
