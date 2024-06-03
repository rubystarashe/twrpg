<template>
<div>
  <div class="legacy"
    :ref="r => (m_moblist = r, m_navi['파밍 루트 요약'] = { ref: r })"
  >
    <div class="mob" v-for="({ name, items, id: mobid }) in c_mobs"
      v-show="f_gettofarming(items)"
    >
      <div class="name">{{ name }}</div>
      <div class="needsitems">
        <div class="item" v-for="item in c_compress_mob_items(items)"
          @mouseover.stop="s_f_setFloatingData(item.id)"
          @mouseleave.stop="s_f_setFloatingData()"
        >
          <div class="itemname">{{ item.name }}</div>
          <div class="counts"><span class="handle">{{ item.handle }}</span><span class="slash">/</span>{{ item.count }}</div>
        </div>
      </div>
    </div>
  </div>
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
        v-show="f_gettofarming(items)"
        :ref="r => m_navi[s_database.mobs[mobid].name] = { type: 'mob', ref: r }"
      >
      <!-- <tr class="mob" v-for="({ name, items, id: mobid }) in c_mobs"
      > -->
        <td class="mobmeta">
          <div class="mobmetawrapper">
            <div class="name">{{ name }}</div>
            <div class="needsitems">
              <div class="item" v-for="item in c_compress_mob_items(items)">
                <div class="itemname">{{ item.name }}</div>
                <div class="counts"><span class="handle">{{ item.handle }}</span><span class="slash">/</span>{{ item.count }}</div>
              </div>
            </div>
          </div>
        </td>
        <td class="items" v-for="(_, grade) in c_grids">
          <div class="itemwrapper">
            <div class="itemarea">
              <!-- <div class="item"
                v-for="(arr, id) in f_compress_items(items[grade])"
                v-show="f_getNeedsCount(arr)"
              > -->
              <div class="item"
                v-for="(arr, id) in f_compress_items(items[grade])"
              >
                <div class="meta"
                  :class="{ full: f_getNeedsCount(arr) <= 0 }"
                  @mouseover.stop="s_f_setFloatingData(id)"
                  @mouseleave.stop="s_f_setFloatingData()"
                >
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
                  <!-- <div class="count" v-if="f_getHandleCount(arr)"><ruby class="ruby">{{ f_getNeedsCount(arr) }}<span class="unit">개</span><rt>{{ f_getHandleCount(arr) }} 개 보유</rt></ruby></div> -->
                  <!-- <div class="count" v-if="f_getHandleCount2(id)"><ruby class="ruby">{{ f_getNeedsCount(arr) }}<span class="unit">개</span><rt>{{ f_getHandleCount2(id) }} 개 보유</rt></ruby></div>
                  <div class="count" v-else>{{ f_getNeedsCount(arr) }}<span class="unit">개</span></div> -->
                  <!-- <div class="count"><ruby class="ruby">{{ f_getNeedsCount(arr) }}<span class="unit">개</span><rt>필요</rt></ruby></div> -->
                  <div class="count" v-if="f_getHandleCount2(id)"><ruby class="ruby"><span class="needs">{{ f_getHandleCount(arr) }}</span><span class="slash">/</span>{{ (f_getHandleCount(arr) + f_getNeedsCount2(arr)) || f_getHandleCount(arr) }}<rt>{{ f_getHandleCount2(id) }} 개 보유중</rt></ruby></div>
                  <div class="count" v-else><span class="needs">{{ f_getHandleCount(arr) }}</span><span class="slash">/</span>{{ f_getHandleCount(arr) + f_getNeedsCount2(arr) }}</div>
                </div>
                <div class="tree">
                  <PathFinderFarmTree
                    v-for="{ target_tree, sub } in arr"
                    :mob="mobid"
                    :sub="sub"
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
</div>
</template>

<script setup>
const s_f_setFloatingData = useState('floatingInfo:f_setData')
const p_handle = defineProp('handle')
const p_targets = defineProp('targets')
const p_float = defineProp('float')

const s_database = useState('database')

const types = reactive(['무기', '방어구', '날개', '장신구', '머리보호구'])
const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']


const c_mats = computed(() => {
  const handlecache = p_handle.value.reduce((p, c) => {
    if (!p[c]) p[c] = 1
    else p[c]++
    return p
  }, {})

  const targets = []
  Object.values(p_targets.value).forEach(items => {
    Object.values(items)?.forEach(item => {
      if (item.type == '아이콘') targets.push({ ...item, type: '기타', grade: 99 })
      else if (item.type == '곡괭이') targets.push({ ...item, type: '기타', grade: 99 })
      else if (item.type == '기타') targets.push({ ...item, type: '기타', grade: 99 })
      else targets.push(item)
    })
  })

  const recipies = {}
  const targethandlecache = [ ...p_handle.value ]
  const deepc = (target, origintarget, tree) => {
    if (target.recipies) {
      if (targethandlecache.includes(target.id)) {
        targethandlecache.splice(targethandlecache.indexOf(target.id), 1)
      }
      else {
        const items = {}
        target.recipies.forEach(recipy => {
          recipy.forEach(e => {
            if (!items[e.item]) items[e.item] = {
              id: e.item,
              count: e.count || 1,
              stack: 1
            }
            else {
              items[e.item].stack++
            }
          })
        })
        const itemsarr = Object.values(items).map(e => ({ ...e, sub: target.recipies.length > e.stack ? true : false }))
        const recipy_array = itemsarr.map(e => ({
          ...s_database.value.items[e.id],
          sub: e.sub ? itemsarr.find(i => i.sub && e.id != i.id)?.id : null,
          target: origintarget,
          target_grade: origintarget.grade,
          target_tree: tree,
          target_nearest: tree[0],
          target_nearest_grade: tree[0].grade,
          need_counts: e.count || 1
        }))
        if (!recipies[target.grade]) recipies[target.grade] = []
        recipies[target.grade].push({ ...target, recipy_array })
        // if (target.name.indexOf('아이콘') < 0) recipy_array.forEach(e => {
        //   deepc(e, origintarget, [ e, ...tree ])
        // })
        recipy_array.forEach(e => {
          if (e.name.indexOf('아이콘') < 0) deepc(e, origintarget, [ e, ...tree ])
        })
      }
    }
  }
  let mats = []
  targets.sort((a, b) => a.mobindex - b.mobindex).forEach(item => {
    if (!p_handle.value.find(e => e == item.id)) {
      deepc(item, item, [ item ])
    }
    if (!item.recipies) {
      mats.push({
        ...item,
        target: item,
        target_grade: item.grade,
        target_tree: [],
        target_nearest: item,
        target_nearest_grade: item.grade,
        need_counts: 1,
        handle: 0
      })
    }
  })
  Object.entries(recipies).forEach(([ grade, recipy ]) => {
    recipy.forEach(r => {
      r.recipy_array.forEach(e => {
        mats.push({ ...e, target_grade: grade })
      })
    })
  })
  // mats = mats.sort((a, b) => a.target_nearest_grade - b.target_nearest_grade).filter(e => {
  //   if (handlecache[e.id]) {
  //     handlecache[e.id]--
  //     if (e.sub) {
  //       handlecache[e.sub]--
  //     }
  //   } else {
  //     return true
  //   }
  // })
  mats = mats.sort((a, b) => a.target_nearest_grade - b.target_nearest_grade)
  mats.forEach((e, i) => {
    if (handlecache[e.id] > 0) {
      handlecache[e.id]--
      if (e.sub) {
        if (handlecache[e.sub] > 0) {
          // console.log(e)
          // e.need_counts--
          // if (!e.sub_counts) e.sub_counts = 0
          e.sub_counts++
          // console.log(e.sub, mats.findIndex(m => m.id == e.sub))
          mats[mats.findIndex(m => m.id == e.sub)].need_counts--
        } else {
          // mats[mats.findIndex(m => m.id == e.sub)].need_counts--
        }
        // handlecache[e.id]++
        // handlecache[e.sub]--
      }
      if (!mats[i].handle) e.handle = 0
      mats[i].handle++
    }
  })
  return mats
})
const c_mobs = computed(() => {
  
  const mobs = { ...s_database.value.mobs }
  delete mobs['etc']

  const res = []
  Object.entries(mobs).forEach(([ mobid, { name, drops } ]) => {
    const items = c_mats.value.filter(e => drops.find(d => d.item == e.id))
    res.push({
      id: mobid,
      name,
      items: items.reduce((p, c) => {
        const grade = c.target.type == '기타' ? 99 : c.target_nearest_grade
        if (!p[grade]) p[grade] = []
        p[grade].push(c)
        return p
      }, {})
    })
  })

  return res
  // return res.sort((a, b) => {
  //   const aa = Object.keys(a.items).sort((a, b) => a - b)[0] || 0
  //   const bb = Object.keys(b.items).sort((a, b) => a - b)[0] || 0
  //   return aa - bb
  // })
})

const c_grids = computed(() => {
  const res = {}
  c_mobs.value.forEach(e => {
    Object.keys(e.items).forEach(g => res[g] = [])
  })
  return res
})

const c_compress_mob_items = items => {
  let res = {}
  Object.values(items).forEach(m => {
    m.forEach(e => {
      if (!res[e.id]) res[e.id] = { ...e, count: 1, handle: e.handle || 0 }
      else {
        res[e.id].count++
        res[e.id].handle += (e.handle || 0)
      }
    })
  })
  return Object.values(res).filter(e => e.handle < e.count)
}

const f_compress_items = items => {
  const res = items?.reduce((p, c) => {
    if (!p[c.id]) p[c.id] = []
    p[c.id].push(c)
    return p
  }, {})
  return res
}
const f_gettofarming = items => {
  let count = 0
  Object.values(items)?.forEach(e => {
    count += f_getNeedsCount2(e)
  })
  return count
}

const f_getdrops = (item, mob) => {
  return item.droprates.filter(e => e.group == mob)
}

const c_width = computed(() => {
  return 100 + Object.keys(c_grids.value).length * 200 + 'px'
})

const f_getNeedsCount = (arr = []) => {
  return arr.reduce((p, c) => {
    p += (c.need_counts - (c.handle || 0))
    // if (c.sub_counts) p -= c.sub_counts
    return p
  }, 0)
}
const f_getNeedsCount2 = (arr = []) => {
  return arr.reduce((p, c) => {
    p += (c.need_counts - (c.handle || 0))
    if (c.sub_counts) p -= c.sub_counts
    return p
  }, 0)
}
const f_getHandleCount = (arr = []) => {
  return arr.reduce((p, c) => (p += (c.handle || 0), p), 0)
}
const f_getHandleCount2 = id => {
  return p_handle.value.filter(e => e == id).length
}

const m_navi = defineModel('navi')
const m_moblist = defineModel('moblist')
</script>

<style lang="scss" scoped>
.legacy {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 40px;
  .mob {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    word-break: keep-all;
    flex-direction: column;
    border: 1px solid rgb(182, 186, 192);
    margin-bottom: 10px;
    margin-right: 10px;
    .name {
      font-size: 14px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      background: rgba(50, 51, 56, .5);
      backdrop-filter: blur(5px);
      opacity: .7;
      margin: 10px;
      margin-bottom: 5px;
    }
    .needsitems {
      box-sizing: border-box;
      padding: 15px;
      padding-top: 0px;
      padding-bottom: 10px;
      width: 100%;
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 3px;
        opacity: .7;
        .itemname {
          font-size: 12px;
          color: rgb(182, 186, 192);
          flex-shrink: 0;
        }
        .counts {
          font-size: 13px;
          margin-left: 10px;
          flex-shrink: 0;
          .handle {
            color: rgb(182, 186, 192);
          }
          .slash {
            margin: 0 3px;
            font-size: 10px;
            opacity: .3;
          }
        }
      }
    }
  }
}
.farming {
  border-collapse: collapse;
  td {
    vertical-align: top;
    text-align: left;
    border-left: none;
    border-right: none;
    border-top: 1px solid rgb(63, 64, 70);
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
          background: rgba(43, 45, 49, .5);
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
        word-break: keep-all;
        flex-direction: column;
        .name {
          padding: 10px 20px;
          font-size: 16px;
          line-height: 20px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          background: rgba(50, 51, 56, .5);
          border-radius: 20px;
          backdrop-filter: blur(5px);
          opacity: .7;
        }
        .needsitems {
          margin-top: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 20px;
          .item {
            opacity: .7;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3px;
            .itemname {
              font-size: 12px;
              color: rgb(182, 186, 192);
              flex-shrink: 0;
            }
            .counts {
              font-size: 13px;
              margin-left: 10px;
              flex-shrink: 0;
              .handle {
                color: rgb(182, 186, 192);
              }
              .slash {
                margin: 0 3px;
                font-size: 10px;
                opacity: .3;
              }
            }
          }
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
          &.full {
            border-color: white;
          }
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
            .needs {
              color: rgb(182, 186, 192);
            }
            .unit {
              font-size: 10px;
              margin-left: 3px;
            }
            .slash {
              margin: 0 3px;
              font-size: 10px;
              opacity: .3;
            }
            rt {
              opacity: .3;
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
