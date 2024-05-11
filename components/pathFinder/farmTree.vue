<template>
  <div class="farm_tree" v-if="p_tree[0]">
    <!-- <div class="name" :class="{ willmakeable: c_makeable.willmakeable, makeable: c_makeable.makeable && !p_parentnotready }"> -->
    <div class="name" :class="{ willmakeable: p_isStart ? f_iswillmakable(p_tree[0]?.id) == 1 : c_makeable.willmakeable, makeable: c_makeable.makeable && !p_parentnotready }"
      @mouseover.stop="s_f_setFloatingData(p_tree[0]?.id)"
      @mouseleave.stop="s_f_setFloatingData()"
    >
      {{ p_tree[0]?.name }}
      <span class="target" v-if="p_tree.length == 1">목표</span>
      <span class="sub" v-if="sub"><ruby>{{ s_database.items[sub].name }}<rt>교차재료</rt></ruby></span>
    </div>
    <div class="child" v-if="p_tree.length > 1">
      <div class="treeicon"/>
      <PathFinderFarmTree
        :mat="p_tree[0].id"
        :tree="p_tree.slice(1)"
        :handle="[ ...p_handle, p_tree[0].id ]"
        :parentnotready="!c_makeable.makeable"
      />
    </div>
  </div>
</template>

<script setup>
const s_f_setFloatingData = useState('floatingInfo:f_setData')
const s_database = useState('database')

const p_tree = defineProp('tree')
const p_isStart = defineProp('isStart')
const p_handle = defineProp('handle')
const p_mat = defineProp('mat')
const p_sub = defineProp('sub')
const p_parentnotready = defineProp('parentnotready')

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
const c_makeable = computed(() => {
  const items = Object.values(p_tree.value?.[0]?.recipies?.reduce((p, c) => {
    c.forEach(({ item, count }) => {
      if (!p[item]) p[item] = {
        id: item,
        count: count,
        stack: 1
      }
      else {
        p[item].stack++
      }
    })
    return p
  }, {}) || []).map(e => {
    if (e.stack < p_tree.value[0].recipies.length) e.sub = true
    delete e.stack
    return e
  })
  if (!items) return {}
  const makeable = items.every(e => {
    if (p_handle.value.filter(h => h == e.id).length >= e.count) return true
    else {
      if (e.sub && p_handle.value.find(h => h == items.find(i => i.sub && i.id != e.id)?.id)) return true
      else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
    }
  })
  const willmakeable = items.every(e => {
    if ([ ...p_handle.value, p_mat.value ].filter(h => h == e.id).length >= e.count) return true
    else if (e.sub && [ ...p_handle.value, p_mat.value ].find(h => h == items.find(i => i.sub && i.id != e.id)?.id)) return true
    else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
  })
  return { willmakeable, makeable }
})
</script>

<style lang="scss" scoped>
.farm_tree {
  margin-bottom: 1px;
  flex-shrink: 0;
  .name {
    margin-bottom: 3px;
    color: rgb(182, 186, 192);
    display: flex;
    align-items: center;
    font-size: 12px;
    flex-shrink: 0;
    word-break: keep-all;
    &.willmakeable {
      color: rgb(94, 103, 234);
      word-break: keep-all;
    }
    &.makeable {
      color: rgb(173, 255, 47);
      word-break: keep-all;
    }
    .sub {
      color: rgb(94, 103, 234);
      margin-left: 5px;
      font-size: 10px;
      word-break: keep-all;
      rt {
        font-size: 8px;
        word-break: keep-all;
      }
    }
    .target {
      color: rgb(217, 94, 71);
      margin-left: 5px;
      font-size: 10px;
      flex-shrink: 0;
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
