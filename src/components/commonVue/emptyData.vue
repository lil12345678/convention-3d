<template>
  <div class="empty-box">
    <img src="../../assets/img/no-data.png" alt="" class="empty-img" />
    <div class="empty-text">暂无数据</div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.empty-box {
  position: absolute;
  top: 40%; // 垂直居中;
  left: 50%; // 水平居中;
  transform: translate(-50%, -40%); // 居中对齐;
  .empty-img {
    width: 160px;
    height: auto;
  }
  .empty-text {
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
