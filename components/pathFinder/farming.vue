<template>
  <table class="farming">
    <tbody class="tbody">
      <tr class="floating">
        <td/>
        <td
          v-for="(_, grade) in c_grids"
        >
          <div class="guide_wrapper">
            <div class="guide" :class="`grade_${grade}`">{{ grades[grade] || '기타' }}</div>
          </div>
        </td>
      </tr>
      <tr class="mob" v-for="({ name, items, id: mobid }) in c_mobs"
        v-show="Object.keys(items).length"
      >
        <td class="mobmeta">
          <div class="mobmetawrapper">
            <div class="name">{{ name }}</div>
          </div>
        </td>
        <td class="items" v-for="(_, grade) in c_grids">
          <div class="itemwrapper">
            <div class="itemarea">
              <div class="item" v-for="(arr, id) in f_compress_items(items[grade])">
                <div class="meta">
                  <div class="info">
                    <div class="grade" :class="`grade_${s_database.items[id].grade}`"/>
                    <div class="name">
                      <div>{{ s_database.items[id].name }}</div>
                      <div class="drops">
                        <div class="drop" v-for="{ rate, wishrate } in f_getdrops(s_database.items[id], mobid)">
                          <span class="rate">{{ rate }}%</span>
                          <span class="wishrate" v-if="wishrate">소원시 {{ wishrate }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="count">{{ arr.length }}<span>개</span></div>
                </div>
                <div class="tree">
                  <PathFinderFarmTree
                    v-for="{ target_tree } in arr"
                    :mat="id"
                    :handle="p_handle"
                    :tree="target_tree"
                    :isStart="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const p_handle = defineProp('handle')
const p_targets = defineProp('targets')
const p_float = defineProp('float')

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
  Object.entries(mobs).forEach(([ mobid, { name, drops } ]) => {
    const items = mats.filter(e => drops.find(d => d.item == e.id))
    res.push({
      id: mobid,
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


const f_compress_items = items => {
  return items?.reduce((p, c) => {
    if (!p[c.id]) p[c.id] = []
    p[c.id].push(c)
    return p
  }, {})
}

const f_getdrops = (item, mob) => {
  return item.droprates.filter(e => e.group == mob)
}

const c_width = computed(() => {
  return 100 + Object.keys(c_grids.value).length * 200 + 'px'
})
</script>

<style lang="scss" scoped>
.farming {
  border-collapse: collapse;
  td {
    border: 1px solid rgb(63, 64, 70);
    vertical-align: top;
    text-align: left;
    border-left: none;
    border-right: none;
  }
  width: 100%;
  min-width: v-bind('c_width');
  .floating {
    position: sticky;
    top: v-bind('p_float');
    td {
      border: 1px solid transparent;
      .guide_wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .guide {
          padding: 10px 30px;
          font-size: 16px;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(50, 51, 56, .5);
          border-radius: 20px;
          backdrop-filter: blur(5px);
          &.grade_1 {
            color: rgb(0, 158, 37);
          }
          &.grade_2 {
            color: rgb(81, 143, 187);
          }
          &.grade_3 {
            color: rgb(184, 28, 28);
          }
          &.grade_4 {
            color: rgb(166, 207, 0);
          }
          &.grade_5 {
            color: rgb(115, 60, 190);
          }
        }
      }
    }
  }
  .mob {
    .mobmeta {
      position: sticky;
      left: -80px;
      z-index: 10;
      .mobmetawrapper {
        width: 180px;
        height: 100%;
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        align-items: flex-start;
        .name {
          padding: 10px 20px;
          font-size: 14px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          background: rgba(50, 51, 56, .5);
          border-radius: 20px;
          backdrop-filter: blur(5px);
          opacity: .7;
        }
      }
    }
    .meta {
      width: 100px;
    }
    .items {
      .itemwrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        margin-top: 10px;
        margin-bottom: 5px;
      }
      .itemarea {
        padding: 5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .item {
        width: auto;
        margin-bottom: 5px;
        .meta {
          background: rgb(43, 45, 49);
          box-sizing: border-box;
          padding: 6px 10px;
          margin-right: 5px;
          margin-bottom: 5px;
          border-radius: 10px;
          border: 1px solid transparent;
          width: auto;
          min-width: 180px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          .info {
            display: flex;
            align-items: center;
            .grade {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              margin-right: 7px;
              background: gray;
              flex-shrink: 0;
              &.grade_1 {
                background: rgb(0, 158, 37);
              }
              &.grade_2 {
                background: rgb(81, 143, 187);
              }
              &.grade_3 {
                background: rgb(184, 28, 28);
              }
              &.grade_4 {
                background: rgb(166, 207, 0);
              }
              &.grade_5 {
                background: rgb(115, 60, 190);
              }
            }
            .name {
              font-size: 12px;
              color: rgb(182, 186, 192);
              flex-shrink: 0;
            }
          }
          .count {
            font-size: 13px;
            margin-left: 10px;
            flex-shrink: 0;
            .unit {
              font-size: 10px;
              margin-left: 3px;
            }
          }
        }
        .drops {
          width: 100%;
          display: flex;
          box-sizing: border-box;
          .drop {
            font-size: 10px;
            opacity: .7;
            .wishrate {
              margin-left: 10px;
            }
          }
        }
        .tree {
          box-sizing: border-box;
          padding: 0 10px;
        }
      }
    }
  }
}
</style>
