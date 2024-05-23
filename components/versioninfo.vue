<template>
  <div class="versioninfo">
    <div class="title">다음 버전에 추가될 기능</div>
    <pre class="list">
- 아이템 필요한 재화 개수 표시
- 드랍률 계산 디테일 체크박스
- 아이템 검색창, 옵션 디테일
- 다국어 지원
- 직업, 보스별 이미지배너
- 만들수있는 아이템과 재료 하나 남은 아이템들을 인터페이스 중앙 하단에 고정으로 표시
- 공유기능
- 다른 여러 세이브 함께 보기 (파티 파밍루트 계산용)
- 공략 게시판 (Notion 활용)
    </pre>
  </div>
</template>

<script setup>
const p_version = defineProp('version')
</script>

<style lang="scss" scoped>
.versioninfo {
  padding: 20px 50px;
  .title {
    font-size: 16px;
    opacity: .7;
  }
  .list {
    font-family: none;
    font-size: 13px;
    line-height: 24px;
    opacity: .8;
  }
}
</style>
