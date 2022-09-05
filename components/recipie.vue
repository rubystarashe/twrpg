<template>
<div class="recipie">
  <div class="item" v-for="{ item, count, multi, sub } in recipie">
    <div class="name" :class="{ ready: readyitems.find(e => e == item) }" @mouseover="$emit('hover', item)" @mouseleave="$emit('hover', null)">
      <div class="text">{{itemlist[item]}} <span v-if="sub" class="sub">교차가능</span> <span v-if="count > 1">{{count}}개</span></div>
      <div class="rate" v-if="droptable[item]">{{droptable[item].rate}}%
      <span v-if="droptable[item] && droptable[item].wish">소원시{{droptable[item].wish}}%
        <span v-if="droptable[item].alt" v-for="{ rate, wish } in droptable[item].alt">
          <br>{{rate}}% <span v-if="wish">소원시{{wish}}%</span>
        </span>
      </span>
      </div>
    </div>
    <Recipie v-if="recipies[item] && !readyitems.find(e => e == item)" :itemlist="itemlist" :recipies="recipies" :droptable="droptable" :targetsave="targetsave" :target="item"
      @hover="v => $emit('hover', v)"  
    />
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

const checkmulti = (multi) => {
  const recipie = props.recipies[props.target]
  multi = multi || 0
  return recipie.find(e => e.multi > multi)
}
const recipie = computed(() => {
  const recipie = props.recipies[props.target]
  return recipie.map(e => {
    return { ...e, sub: !!checkmulti(e.multi) }
  }).sort((a, b) => a.sub - b.sub)
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
    .sub {
      color: gray;
      font-size: .6em
    }
  }
}
</style>
