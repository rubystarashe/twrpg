<template>
<div class="recipie">
  <div class="item" v-for="{ item, count } in recipies[target]">
    <div class="name" :class="{ ready: readyitems.find(e => e == item) }">
      <div class="text">{{itemlist[item]}}</div>
      <div class="rate" v-if="droptable[item]">{{droptable[item].rate}}%
      <span v-if="droptable[item] && droptable[item].wish">소원시{{droptable[item].wish}}%</span>
      </div>
    </div>
    <Recipie v-if="recipies[item] && !readyitems.find(e => e == item)" :itemlist="itemlist" :recipies="recipies" :droptable="droptable" :targetsave="targetsave" :target="item"/>
  </div>
</div>
</template>

<script setup>
const props = defineProps([
  'itemlist',
  'recipies',
  'droptable',
  'targetsave',
  'target'
])

const readyitems = computed(() => {
  return props.targetsave.items || []
})
</script>

<style lang="scss" scoped>
.recipie {
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 5px 10px;
  .item {
    .name {
      margin: 5px;
      font-size: .8em;
      display: flex;
      justify-content: space-between;
      .text {
        margin-right: 10px;
      }
      .rate {
        text-align: right;
      }
    }
    .ready {
      background: greenyellow;
    }
  }
}
</style>
