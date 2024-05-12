<template>
  <div class="floating_info"
    :style="c_position"
    v-if="_data"
  >
    <div class="content" ref="r_floating_info">
      <div class="meta">
        <div class="grade" :class="`grade_${c_data.grade}`">{{ grades[c_data.grade] }}</div>
        <div class="type">{{ c_data.type }}</div>
        <div class="name" :class="{ willmakeable: f_iswillmakable(c_data.id) == 1, makeable: f_ismakable(c_data.id) }">{{ c_data.name }}</div>
        <div class="detail">
          <PathFinderReqTree
            class="tree"
            :target="_data"
            :handle="c_handle"
          />
          <div class="description">
            <div v-html="c_data.description"/>
          </div>
        </div>
      </div>
      <div class="targets" v-if="f_targetgearlist(_data).length">
        <div class="line" v-if="f_targetgearlist(_data).length"/>
        <div class="targetarea">
          <div class="targettitle">관련 목표 조합</div>
          <div class="targetlist">
            <div class="target" v-for="target in f_targetgearlist(_data)">
              <div class="name" :class="{ willmakeable: f_iswillmakable(target.id) == 1, makeable: f_ismakable(target.id) }">{{ target.name }}</div>
              <PathFinderReqTree
                class="tree"
                :target="target.id"
                :handle="c_handle"
                :iconview="true"
                :mat="_data"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const _mouse = useMouse()
const _windowSize = useWindowSize()
let r_floating_info = $ref()
const _elementSize = useElementSize(() => r_floating_info)
const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']
const c_position = computed(() => {
  const width = _elementSize.width.value
  const height = _elementSize.height.value
  const w_width = _windowSize.width.value
  const w_height = _windowSize.height.value
  const mouse_x = _mouse.x.value
  const mouse_y = _mouse.y.value

  const res = {}
  if (w_width - mouse_x - 30 > width) res.left = mouse_x + 'px'
  else res.right = w_width - mouse_x + 'px'
  if (w_height - mouse_y - 30  > height) res.top = mouse_y + 'px'
  else res.bottom = w_height - mouse_y + 'px'

  if (res.bottom && w_height - mouse_y + height > w_height - 50) {
    delete res.bottom
    res.top = '40px'
  }

  if (res.right && w_width - mouse_x + width > w_width - 50) {
    delete res.right
    res.left = '0px'
  }

  return res
})

let _data = $ref()
const f_setData = data => {
  _data = data
}
useState('floatingInfo:f_setData', () => f_setData)




const p_icons = defineProp('icons')
const p_handle = defineProp('handle')
const s_database = useState('database')
const p_targets = defineProp('targets')
const p_targetIndexes = defineProp('targetIndexes')
const p_iconfarming = defineProp('iconfarming')

const c_data = computed(() => s_database.value.items[_data])

const c_handle = computed(() => {
  let icons = [ ...p_icons.value ]
  const getlowericons = ic => {
    ic.forEach(e => {
      s_database.value.items[e].recipies?.forEach(r => {
        const arr = r.map(e => e.item).filter(e => s_database.value.items[e].type =='아이콘')
        icons = icons.concat(arr)
        getlowericons(arr)
      })
    })
  }
  getlowericons(icons)
  
  return [ ...p_handle.value, ...icons ]
})
const c_targets = computed(() => {
  const res = {}
  p_targetIndexes.value.forEach(index => {
    p_targets.value[index]?.items?.forEach(item => {
      res[item] = s_database.value.items[item]
    })
  })
  if (!p_handle.value.includes('I0OO')) res['I0OO'] = s_database.value.items['I0OO']
  if (p_iconfarming.value) res['I02T'] = s_database.value.items['I02T']
  return res
})

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
    if (c_handle.value.filter(h => h == e.id).length >= e.count) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && c_handle.value.includes(a.id))) return true
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
  arr.forEach(e => {
    if (c_handle.value.filter(h => h == e.id).length >= e.count) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && c_handle.value.includes(a.id))) return true
    }
    else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
    else {
      counts += e.count - c_handle.value.filter(h => h == e.id).length
    }
  })
  return counts
}

const f_isNeeded = (id, target) => {
  if (s_database.value.items[target].recipies) {
    if (s_database.value.items[target].recipies.some(r => r.some(re => id == re.item))) return true
    else return s_database.value.items[target].recipies.some(r => r.some(re => c_handle.value.includes(re.item) ? false : f_isNeeded(id, re.item)))
  }
  return false
}
const f_targetgearlist = (id) => {
  const res = Object.values(c_targets.value)
    .filter(e => {
      if (e.recipies) {
        return f_isNeeded(id, e.id)
      }
    })
  return res
}
</script>

<style lang="scss" scoped>
.floating_info {
  position: fixed;
  pointer-events: none;
  .content {
    background: rgba(54, 55, 60, .7);
    backdrop-filter: blur(10px);
    box-sizing: border-box;
    padding: 10px;
    border-radius: 7px;
    height: 100%;
    display: flex;
    .meta {
      flex-shrink: 0;
      flex-shrink: 0;
      .grade {
        font-size: 14px;
        color: gray;
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
      .type {
        font-size: 16px;
        color: rgb(182, 186, 192);
      }
      .name {
        font-size: 18px;
        margin-bottom: 10px;
        color: rgb(228, 230, 233);
        &.willmakeable {
          color: rgb(94, 103, 234);
        }
        &.makeable {
          color: rgb(173, 255, 47);
        }
      }
      .detail {
        display: flex;
        .tree {
          flex-shrink: 0;
          margin: 5px;
        }
        .description {
          flex-shrink: 0;
          max-width: 300px;
          margin: 5px;
          margin-left: 20px;
          font-size: 11px;
          color: rgb(182, 186, 192);
        }
      }
    }
    .line {
      margin: 10px;
      width: 1px;
      height: 100%;
      background: white;
      flex-shrink: 0;
      opacity: .5;
      margin-left: 15px;
    }
    .targets {
      display: flex;
      flex-shrink: 0;
      .targetarea {
        flex-shrink: 0;
        .targettitle {
          font-size: 16px;
        }
        .targetlist {
          display: flex;
          .target {
            flex-shrink: 0;
            margin: 5px;
            .name {
              font-size: 14px;
              margin-bottom: 5px;
              color: rgb(228, 230, 233);
              &.willmakeable {
                color: rgb(94, 103, 234);
              }
              &.makeable {
                color: rgb(173, 255, 47);
              }
            }
          }
        }
      }
    }
  }
}
</style>
