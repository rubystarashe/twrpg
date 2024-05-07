<template>
  <div class="req_tree">
    <div class="item" v-for="{ id, name, grade, type, sub, count, handle, recipies } in c_recipies">
      <div class="card">
        <!-- <div>{{ grade }}</div> -->
        <div class="sub" v-if="sub">선택</div>
        <div class="name" :class="{ handle, makeable: f_ismakable(id) }">{{ name }}</div>
        <div class="count" v-if="count > 1">{{ count }}개</div>
      </div>
      <div class="handlecount" v-if="handle && handle != count">{{ handle }}개 보유</div>
      <div class="child" v-if="recipies && !handle && type != '아이콘'">
        <div class="treeicon"/>
        <PathFinderReqTree
          :target="id"
          :handle="p_handle"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const p_target = defineProp('target')
const p_handle = defineProp('handle')

const s_database = useState('database')

const c_target = computed(() => s_database.value.items[p_target.value])
const c_recipies = computed(() => {
  if (!c_target?.value?.recipies) return []
  return Object.values(c_target.value.recipies.reduce((p, c) => {
    c.forEach(({ item, count }) => {
      if (!p[item]) p[item] = {
        id: item,
        name: s_database.value.items[item].name,
        type: s_database.value.items[item].type,
        grade: s_database.value.items[item].grade,
        droprates: s_database.value.items[item].droprates,
        recipies: s_database.value.items[item].recipies,
        handle: p_handle.value.filter(e => e == item).length,
        count: count,
        stack: 1
      }
      else {
        p[item].stack++
      }
    })
    return p
  }, {})).map(e => {
    if (e.stack < c_target.value.recipies.length) e.sub = true
    delete e.stack
    return e
  })
  .sort((a, b) => a.recipies ? 1 : -1)
  .sort((a, b) => a.sub ? 1 : -1)
  .sort((a, b) => b.grade - a.grade)
})

// const c_makeable = computed(() => {
//   return c_recipies.value.map(e => e.id).some(e => p_handle.value.find(h => h == e))
// })
// const f_makeable = recipies => {
//   if (!recipies) return false
//   return  Object.values(recipies.reduce((p, c) => {
//     c.forEach(({ item, count }) => {
//       if (!p[item]) p[item] = {
//         id: item,
//         name: s_database.value.items[item].name,
//         type: s_database.value.items[item].type,
//         grade: s_database.value.items[item].grade,
//         droprates: s_database.value.items[item].droprates,
//         recipies: s_database.value.items[item].recipies,
//         handle: p_handle.value.filter(e => e == item).length,
//         count: count,
//         stack: 1
//       }
//       else {
//         p[item].stack++
//       }
//     })
//     return p
//   }, {})).map(e => {
//     if (e.stack < recipies.length) e.sub = true
//     delete e.stack
//     return e
//   })
//   .sort((a, b) => a.recipies ? 1 : -1)
//   .sort((a, b) => a.sub ? 1 : -1)
//   .sort((a, b) => b.grade - a.grade)
//   .map(e => e.id).every(e => p_handle.value.find(h => h == e))
// }

const f_ismakable = id => {
  const item = s_database.value.items[id]
  if (!item.recipies) return false
  const req = {}
  item.recipies.forEach(recipy => {
    recipy.forEach(e => {
      if (!req[e.item]) req[e.item] = {
        id: e.item,
        count: 1
      }
      else req[e.item].count++
    })
  })
  const arr = Object.values(req).reduce((p, c) => {
    if (c.count < item.recipies.length) p.push({ ...c, sub: true })
    else p.push(c)
    return p
  }, [])
  return arr.every(e => {
    if (p_handle.value.includes(e.id)) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && p_handle.value.includes(a.id))) return true
    }
    else if (s_database.value.items[e.id].recipies && f_ismakable(e.id)) return true
  })
}
</script>

<style lang="scss" scoped>
.req_tree {
  margin-bottom: 1px;
  .item {
    .card {
      display: flex;
      align-items: center;
      margin-bottom: 3px;
      font-size: 12px;
      color: rgb(182, 186, 192);
      .name {
        display: flex;
        align-items: center;
        &.makeable {
          color: rgb(173, 255, 47);
        }
        &.handle {
          color: white;
        }
      }
      .count {
        margin-left: 5px;
      }
      .sub {
        color: rgb(94, 103, 234);
        margin-right: 5px;
        font-size: 10px;
      }
    }
    .handlecount {
      font-size: 10px;
      margin-bottom: 3px;
      margin-top: -3px;
    }
    .child{
      padding-left: 5px;
      display: flex;
      .treeicon {
        width: 5px;
        height: 5px;
        border-bottom: 1px solid rgb(43, 45, 49);
        border-left: 1px solid rgb(43, 45, 49);
        margin-top: 4px;
        margin-right: 5px;
      }
    }
  }
}
</style>
