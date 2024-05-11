<template>
<div class="mat_tree" v-if="p_tree[0]">
  <div class="name"
    :class="{ usedby: !p_tree[1], willmakeable: f_iswillmakable(p_tree[0].id) == 1, makable: f_ismakable(p_tree[0].id) }"
    @mouseover.stop="s_f_setFloatingData(p_tree[0].id)"
    @mouseleave.stop="s_f_setFloatingData()"
  ><span v-if="p_isTarget" class="target">목표</span>{{ p_tree[0].name }}<span v-if="!p_tree.slice(1).length" class="mat">재료</span></div>
  <div class="child" v-if="p_tree.slice(1).length">
    <div class="treeicon"/>
    <PathFinderMatTree
      :tree="p_tree.slice(1)"
      :handle="p_handle"
    />
  </div>
</div>
</template>

<script setup>
const s_f_setFloatingData = useState('floatingInfo:f_setData')
const p_tree = defineProp('tree')
const p_isTarget = defineProp('isTarget')
const p_handle = defineProp('handle')

const s_database = useState('database')

const f_deepcheck = recipies => {
  const req = {}
  recipies.forEach(recipy => {
    recipy.forEach(e => {
      if (!req[e.item]) req[e.item] = {
        id: e.item,
        count: 1
      }
      else req[e.item].count++
    })
  })
  const arr = Object.values(req).reduce((p, c) => {
    if (c.count < recipies.length) p.push({ ...c, sub: true })
    else p.push(c)
    return p
  }, [])
  return arr.every(e => {
    if (p_handle.value.includes(e.id)) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && p_handle.value.includes(a.id))) return true
    }
    else if (s_database.value.items[e.id]?.recipies && f_deepcheck(s_database.value.items[e.id]?.recipies)) return true
  })
}
const f_ismakable = id => {
  const item = s_database.value.items[id]
  if (!item?.recipies) return false
  const req = {}
  item.recipies.forEach(recipy => {
    recipy.forEach(e => {
      if (!req[e.item]) req[e.item] = {
        id: e.item,
        count: e.count,
        stack: 1
      }
      else req[e.item].stack++
    })
  })
  const arr = Object.values(req).reduce((p, c) => {
    if (c.stack < item.recipies.length) p.push({ ...c, sub: true })
    else p.push(c)
    return p
  }, [])
  return arr.every(e => {
    if (p_handle.value.filter(h => h == e.id).length >= e.count) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && p_handle.value.includes(a.id))) return true
    }
    else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
  })
}
const f_iswillmakable = id => {
  const item = s_database.value.items[id]
  if (!item?.recipies) return false
  const req = {}
  item.recipies.forEach(recipy => {
    recipy.forEach(e => {
      if (!req[e.item]) req[e.item] = {
        id: e.item,
        count: e.count,
        stack: 1
      }
      else req[e.item].stack++
    })
  })
  const arr = Object.values(req).reduce((p, c) => {
    if (c.stack < item.recipies.length) p.push({ ...c, sub: true })
    else p.push(c)
    return p
  }, [])
  let counts = 0
  let subcache = 0
  arr.forEach(e => {
    if (p_handle.value.filter(h => h == e.id).length >= e.count) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && p_handle.value.includes(a.id))) {
        return true
      } if (!subcache) {
        subcache = 1
        counts++
      }
    }
    else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
    else {
      counts += e.count - p_handle.value.filter(h => h == e.id).length
    }
  })
  return counts
}
</script>

<style lang="scss" scoped>
.mat_tree {
  margin-bottom: 1px;
  .name {
    margin-bottom: 3px;
    color: rgb(182, 186, 192);
    display: flex;
    align-items: center;
    font-size: 12px;
    &.usedby {
      color: rgb(202, 205, 210);
      word-break: keep-all;
    }
    &.willmakeable {
      color: rgb(94, 103, 234);
      word-break: keep-all;
    }
    &.makable {
      color: rgb(173, 255, 47);
      word-break: keep-all;
    }
    .target {
      color: rgb(217, 94, 71);
      word-break: keep-all;
      margin-right: 5px;
      font-size: 10px;
    }
    .mat {
      color: rgb(94, 103, 234);
      margin-left: 5px;
      font-size: 10px;
    }
  }
  .child {
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
</style>
