<template>
  <div class="farming">
    <div class="mob" v-for="(data, mob) in c_mobs"
      v-show="Object.keys(data).length"
    >
      <div>{{ mob }}</div>
      <div class="loots">
        <div class="grade" v-for="(items, grade) in data">
          <div>{{ grade }}</div>
          <div class="items">
            <div class="item" v-for="{ name, target, target_tree, handle } in items">
              {{ name }}
              {{ target.name }} {{ target_tree.map(e => e.name) }} {{ handle }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const p_handle = defineProp('handle')
const p_targets = defineProp('targets')

const s_database = useState('database')

const types = reactive(['무기', '방어구', '날개', '장신구', '머리보호구'])
const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']

const c_mobs = computed(() => {
  const handlecache = [ ...p_handle.value ]
  const mobs = { ...s_database.value.mobs }
  delete mobs['etc']

  const targets = []
  Object.values(p_targets.value).forEach(items => {
    Object.values(items).forEach(item => {
      if (item.type == '아이콘') targets.push({ ...item, type: '기타', grade: 99 })
      else if (item.type == '곡괭이') targets.push({ ...item, type: '기타', grade: 99 })
      else if (item.type == '기타') targets.push({ ...item, type: '기타', grade: 99 })
      else targets.push(item)
    })
  })
  let mats = []
  const deepcheck = (target, handlecache, origintarget, tree) => {
    if (p_handle.value.find(e => e == target)) return false
    if (origintarget.type == '아이콘') origintarget = { ...origintarget, type: '기타', grade: 99 }
    if (origintarget.type == '곡괭이') origintarget = { ...origintarget, type: '기타', grade: 99 }
    if (origintarget.type == '기타') origintarget = { ...origintarget, type: '기타', grade: 99 }
    if (s_database.value.items[target.id]?.recipies) {
      const items = {}
      s_database.value.items[target.id]?.recipies.forEach(recipy => {
        recipy.forEach(e => {
          if (!items[e.item]) items[e.item] = {
            id: e.item,
            count: e.count,
            stack: 1
          }
          else {
            items[e.item].stack++
          }
        })
      })
      const ritems = Object.values(items).map(e => ({ ...e, sub: s_database.value.items[target.id]?.recipies.length > e.stack ? true : false }))
      ritems.forEach(e => {
        let item = s_database.value.items[e.id]
        if (item.type == '아이콘') item = { ...item, type: '기타', grade: 99 }
        if (item.type == '곡괭이') item = { ...item, type: '기타', grade: 99 }
        if (item.type == '기타') item = { ...item, type: '기타', grade: 99 }
        if (handlecache.includes(item.id)) {
          handlecache.splice(handlecache.indexOf(item.id), 1)
          mats.push({
            ...item,
            target: origintarget,
            target_grade: origintarget.grade,
            target_tree: tree.slice(1),
            handle: true
          })
        }
        else if (item.type != '기타' || tree.length == 1) deepcheck(item, handlecache, origintarget, [ item, ...tree ])
      })
    } else {
      if (handlecache.includes(target.id)) {
        handlecache.splice(handlecache.indexOf(target.id), 1)
        mats.push({
          ...target,
          target: origintarget,
          target_grade: origintarget.grade,
          target_tree: tree.slice(1),
          handle: true
        })
      }
      else mats.push({
        ...target,
        target: origintarget,
        target_grade: origintarget.grade,
        target_tree: tree.slice(1)
      })
    }
  }
  targets.sort((a, b) => a.grade - b.grade).forEach(item => {
    deepcheck(item, handlecache, item, [ item ])
  })

  mats = mats.filter(e => e.target_tree.filter(t => t.type == '기타').length < 2)

  const res = {}
  Object.values(mobs).forEach(({ name, drops }) => {
    const items = mats.filter(e => drops.find(d => d.item == e.id))
    res[name] = items.reduce((p, c) => {
      if (!p[c.target_grade]) p[c.target_grade] = []
      p[c.target_grade].push(c)
      return p
    }, {})
  })

  return res
})
</script>

<style lang="scss" scoped>
.farming {
  .mob {
    .loots {
      display: flex;
      .grade {

      }
    }
  }
}
</style>
