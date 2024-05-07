<template>
<div class="mat_tree">
  <div class="name"
    :class="{ usedby: !p_tree.under, makable: f_ismakable(s_database.items[p_tree.target]) }"
  ><span v-if="p_isTarget" class="target">목표</span>{{ s_database.items[p_tree.target].name }}<span v-if="!p_tree.under" class="mat">재료</span></div>
  <div class="child" v-if="p_tree.under">
    <div class="treeicon"/>
    <PathFinderMatTree
      :tree="p_tree.under"
      :handle="[ ...p_handle, p_tree.target ]"
    />
  </div>
</div>
</template>

<script setup>
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
    else if (s_database.value.items[e.id].recipies && f_deepcheck(s_database.value.items[e.id].recipies)) return true
  })
}
const f_ismakable = item => {
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
    else if (s_database.value.items[e.id].recipies && f_deepcheck(s_database.value.items[e.id].recipies)) return true
  })
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
      color: white;
    }
    &.makable {
      color: rgb(173, 255, 47);
    }
    .target {
      color: rgb(217, 94, 71);
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
