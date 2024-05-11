<template>
  <div class="update">
    <div class="text">업데이트 다운로드 중</div>
    <!-- <div class="speed">{{ p_progress?.bytesPerSecond }}</div> -->
    <div class="percent">{{ p_progress?.percent?.toFixed(0) || 0 }}%</div>
  </div>
</template>

<script setup>
const p_progress = defineProp('progress')
</script>

<style lang="scss" scoped>
.update {
  position: fixed;
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: rgb(50, 51, 56);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .text {
    font-size: 30px;
    opacity: .1;
  }
  .percent {
    font-size: 70px;
    opacity: .3;
    font-weight: bold;
  }
}
</style>
