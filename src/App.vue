<template>
  <LoginGate />
  <router-view />
</template>

<script setup>
import LoginGate from '@/components/commonVue/LoginGate.vue'
</script>

<style lang="css">
@import '@/assets/style/three-label.css';
@import '@/assets/style/common.css';
</style>
