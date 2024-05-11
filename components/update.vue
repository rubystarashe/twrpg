<template>
  <div class="update">
    <div class="text">업데이트 중</div>
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
    opacity: .2;
  }
}
</style>
