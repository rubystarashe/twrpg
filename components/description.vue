<template>
<div class="hoverdesc" v-show="hover" :style="{ top: mouseposition.y + 'px', left: mouseposition.x + 'px' }">
  <div class="item" v-if="itemlist[hover]">{{itemlist[hover]}}</div>
  <div class="descarea">
    <div class="desc" v-if="descriptions[hover]" v-html="`<div>`+descriptions[hover]+`</div>`"/>
    <div class="highorder" v-if="recipieslist[hover]">
      <div class="orderitem" v-for="(d, key) in recipieslist[hover]" :class="{ target: targetlist[key] }">{{itemlist[key]}}</div>
    </div>
  </div>
</div>
</template>

<script setup>
const props = defineProps(['itemlist', 'descriptions', 'hover', 'recipies'])
const { target } = store('usersetting').toRefs()

const targetlist = computed(() => {
  const res = {}
  Object.keys(target.value).forEach(e => {
    res[e] = true
    const check = id => {
      if (!props.recipies[id]) return
      props.recipies[id].forEach(e => {
        res[e.item] = true
        check(e.item)
      })
    }
    check(e)
  })
  return res
})

// const checkisneed = item => {
//   const list = {}

//   const ready = {}
//   targetsave.value.items?.forEach(e => {
//     if (!ready[e]) ready[e] = 0
//     ready[e]++
//   })

//   const targets = Object.keys(target.value).map(e => recipies.value[e])
//   targets.forEach(e => {
//     if (e) e.forEach(e => {
//       if (ready[e.item]) return list[e.item] = itemlist.value[e.item]
      
//       const check = e => {
//         if (recipies.value[e.item]) {
//           recipies.value[e.item].forEach(e => {
//             if (ready[e.item]) return list[e.item] = itemlist.value[e.item]
//             check(e)
//           })
//         }
//       }
//       check(e)
//     })
//   })
//   return list[item]
// }


const mouseposition = ref({
  x: 0,
  y: 0
})

const recipieslist = computed(() => {
  const res = {}
  const recipies = props.recipies
  Object.keys(recipies).forEach(item => {
    recipies[item].forEach(e => {
      if (!res[e.item]) res[e.item] = {}
      res[e.item][item] = true
    })
  })
  return res
})

onMounted(() => {
  window.addEventListener('mousemove', e => {
    const { clientX, clientY } = e
    if (props.hover) {
      mouseposition.value.x = clientX,
      mouseposition.value.y = clientY
    }
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', {})
})
</script>

<style lang="scss" scoped>
.hoverdesc {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  margin: 5px;
  background: rgba(0, 0, 0, .8);
  color: white;
  .item {
    margin: 10px;
  }
  .descarea {
    display: flex;
    margin: 10px;
    margin-top: 5px;
    .desc {

    }
    .highorder {
      margin-left: 15px;
      .orderitem {
        font-size: .8em;
        margin: 2px;  
      }
      .target {
        background: blue;
      }
    }
  }
}
</style>
