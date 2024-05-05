<template>
  <table class="farming">
    <tr class="test">
      <td/>
      <td v-for="(_, grade) in c_grids">{{ grades[grade] || '기타' }}</td>
    </tr>
    <tr class="mob" v-for="{ name, items } in c_mobs"
      v-show="Object.keys(items).length"
    >
      <td class="meta">
        <div>{{ name }}</div>
      </td>
      <td class="items" v-for="(_, grade) in c_grids">
        <div v-for="{ name, target, target_nearest } in items[grade]">{{ name }} {{ target_nearest.name }}</div>
      </td>
    </tr>
  </table>
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
    if (p_handle.value.find(e => e == target.id)) return false
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
          // mats.push({
          //   ...item,
          //   target: origintarget,
          //   target_grade: origintarget.grade,
          //   target_tree: tree.slice(1),
          //   handle: true
          // })
        }
        else if (item.type != '기타' || tree.length == 1) deepcheck(item, handlecache, origintarget, [ item, ...tree ])
      })
    } else {
      if (handlecache.includes(target.id)) {
        handlecache.splice(handlecache.indexOf(target.id), 1)
        // mats.push({
        //   ...target,
        //   target: origintarget,
        //   target_grade: origintarget.grade,
        //   target_tree: tree.slice(1),
        //   handle: true
        // })
      }
      else mats.push({
        ...target,
        target: origintarget,
        target_grade: origintarget.grade,
        target_tree: tree.slice(1),
        target_nearest: tree[1],
        target_nearest_grade: tree[1].grade
      })
    }
  }
  targets.sort((a, b) => a.grade - b.grade).forEach(item => {
    if (!p_handle.value.find(e => e == item.id)) deepcheck(item, handlecache, item, [ item ])
  })

  mats = mats.filter(e => e.target_tree.filter(t => t.type == '기타').length < 2)

  const res = []
  Object.values(mobs).forEach(({ name, drops }, index) => {
    const items = mats.filter(e => drops.find(d => d.item == e.id))
    res.push({
      name,
      items: items.reduce((p, c) => {
        if (!p[c.target_nearest_grade]) p[c.target_nearest_grade] = []
        p[c.target_nearest_grade].push(c)
        return p
      }, {})
    })
  })

  return res.sort((a, b) => {
    const aa = Object.keys(a.items).sort((a, b) => a - b)[0] || 0
    const bb = Object.keys(b.items).sort((a, b) => a - b)[0] || 0
    return aa - bb
  })
})

const c_grids = computed(() => {
  const res = {}
  c_mobs.value.forEach(e => {
    Object.keys(e.items).forEach(g => res[g] = [])
  })
  return res
})
</script>

<style lang="scss" scoped>
.farming {
  border-collapse: collapse;
  td {
    border: 1px solid black;
    vertical-align: top;
    text-align: left;
  }
  width: 100%;
  .test {
    position: sticky;
    top: -40px;
  }
  .mob {

  }
}
</style>
