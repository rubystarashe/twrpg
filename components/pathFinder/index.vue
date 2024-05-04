<template>
  <Transition name="fade">
    <div class="background_pathfinder" v-show="m_visible">
      <div class="pathfinder">
        <div class="meta">
          <div class="account">
            <div class="banner"></div>
            <div>{{ p_account }}</div>
            <div>{{ p_job }}</div>
            <div>{{ p_date }}</div>
          </div>
          <div class="equips">
            <div
              class="equip"
              v-for="{ name, grade, type, description } in f_getEquips(p_handle).equips"
            >
              <div><span>{{ grades[grade] }}</span> {{ type }}</div>
              <div>{{ name }}</div>
              <div>
                <template v-html="description"/>
              </div>
            </div>
            <div class="coins">
              <div class="coin" v-for="{ id, count } in p_coins">
                <div class="grade">{{ grades[s_database.items[id].grade] }}</div>
                <div class="name">{{ s_database.items[id].name }} <span class="count">{{ count }}개</span></div>
              </div>
            </div>
            <div class="pickaxes">
              <div v-for="{ name, grade } in f_getEquips(p_handle).pickaxes">
                <div class="grade">{{ grades[grade] }}</div>
                <div>{{ name }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="section_title">인벤토리 ({{ f_getEquips(p_handle).counts }}/60)</div>
        <div class="inventory">
          <div class="category">장비류</div>
          <div class="gearlist">
            <div class="geargroup" v-for="(items, type) in f_getEquips(p_handle).inventory_gears">
              <div class="type">{{ type }}</div>
              <div class="gears">
                <div class="gear" v-for="{ name, grade, id } in items"
                  :class="{ targeted: c_targets[id] }"
                >
                  <div class="grade" :class="`grade_${grade}`"/>
                  <div class="name">{{ name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="category">조합 재료</div>
          <div class="matlist">
            <div class="matgroup" v-for="(items, mob) in f_getEquips(p_handle).inventory_mats">
              <div class="mob">{{ s_database.mobs[mob]?.name }}</div>
              <div class="items">
                <div class="item" v-for="{ id, name, grade, count } in items"
                  :class="{ targeted: c_targets[id], noneeds: !c_targets[id] && !f_getUsedby(id) }"
                >
                  <div class="itemmeta">
                    <div class="info">
                      <div class="grade" :class="`grade_${grade}`"/>
                      <div class="name">{{ name }}</div>
                    </div>
                    <div class="count">{{ count }}<span class="unit">개</span></div>
                  </div>
                  <PathFinderMatTree v-if="f_getUsedby(id)" v-for="tree in f_getUsedby(id)"
                    class="tree"
                    :isTarget="true"
                    :tree="tree"
                  />
                  <div class="trash" v-if="!c_targets[id] && (!f_getUsedby(id) || Object.keys(f_getUsedby(id)).length < count)">!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="section_title">목표 아이템 그룹 선택</div>
        {{ p_targetIndexes }} {{c_targets}}
        <div v-for="({ name, items }, index) in p_targets"
          :class="{ selected: p_targetIndexes.find(e => e == index) }"
          @click="f_select_targetIndex(index)"
        >
          <div>{{ name }}</div>
          <div>{{ items }}</div>
          <div @click.stop="e_call_itemfinder({ account: p_account, job: p_job, index })">edit</div>
        </div>
        <div>아이콘 파밍</div>
        <div @click="f_update_iconfarming(!p_iconfarming)">{{ p_iconfarming }}</div>
        <div>{{ p_icons }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const m_visible = defineModel('visible')

const s_database = useState('database')

const p_account = defineProp('account')
const p_job = defineProp('job')
const p_date = defineProp('date')
const p_history = defineProp('history')
const p_handle = defineProp('handle')
const p_coins = defineProp('coins')
const p_targets = defineProp('targets')
const p_targetIndexes = defineProp('targetIndexes')
const p_iconfarming = defineProp('iconfarming')
const p_icons = defineProp('icons')

const e_call_itemfinder = defineEmit('callFinder')
const e_refresh = defineEmit('refresh')

const i_f_update_usertdata_targetIndexes = inject('app:f_update_usertdata_targetIndexes')
const f_select_targetIndex = index => {
  const i = p_targetIndexes.value.indexOf(index)
  let indexes = [ ...p_targetIndexes.value ]
  if (i >= 0) indexes.splice(i, 1)
  else indexes.push(index)
  i_f_update_usertdata_targetIndexes(p_account.value, p_job.value, indexes)
  e_refresh()
}
const i_f_update_usertdata_icons = inject('app:f_update_usertdata_icons')
const i_f_update_usertdata_iconfarming = inject('app:f_update_usertdata_iconfarming')
const f_select_icon = icon => {
  const i = p_icons.value.indexOf(icon)
  let indexes = [ ...p_icons.value ]
  if (i >= 0) indexes.splice(i, 1)
  else indexes.push(icon)
  i_f_update_usertdata_icons(p_account.value, p_job.value, indexes)
  e_refresh()
}
const f_update_iconfarming = boolean => {
  i_f_update_usertdata_iconfarming(p_account.value, p_job.value, boolean)
  e_refresh()
}


const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']

const usedby = {}
Object.values(s_database.value.items).forEach(({ id, recipies }) => {
  if (recipies) {
    recipies.forEach(recipy => {
      recipy.forEach(e => {
        if (!usedby[e.item]) usedby[e.item] = {}
        usedby[e.item][id] = e.count
      })
    })
  }
})

const c_targets = computed(() => {
  const res = {}
  p_targetIndexes.value.forEach(index => {
    p_targets.value[index]?.items?.forEach(item => {
      res[item] = s_database.value.items[item]
    })
  })
  res['I0OO'] = s_database.value.items['I0OO']
  return res
})
const types = reactive(['무기', '방어구', '날개', '장신구', '머리보호구'])
const f_getEquips = items => {
  const equips = items.slice(0, 6).map(e => ({ id: e, ...s_database.value.items[e] })).filter(e => types.find(t => t == e.type))
  const inventories = items.filter(e => !equips.find(q => q.id == e)).map(e => ({ id: e, ...s_database.value.items[e] }))
  const pickaxes = inventories.filter(e => e.type == '곡괭이').sort((a, b) => b.grade - a.grade).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
  const inventory_gears = inventories.filter(e => types.find(t => e.type == t)).sort((a, b) => b.grade - a.grade).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
    .reduce((p, c) => {
      if (!p[c.type]) p[c.type] = {}
      if (p[c.type][c.id]) p[c.type][c.id].count++
      else p[c.type][c.id] = { ...c, count: 1 }
      return p
    }, {})
  
  const inventory_mats = inventories.filter(e => !c_targets.value[e.id] && ((!types.find(t => e.type == t) && e.type != '재화') || usedby[e.id])).sort((a, b) => b.grade - a.grade)
    .sort((a, b) => {
      if (!a.droprates?.[0]?.group) return 1
      else if (!b.droprates?.[0]?.group) return -1
      else s_database.value.mobs[a.droprates?.[0]?.group]?.index - s_database.value.mobs[b.droprates?.[0]?.group]?.index
    })
    .reduce((p, c) => {
      const category = c.droprates?.[0]?.group ? c.droprates?.[0]?.group : 'etc'
      if (!p[category]) p[category] = {}
      if (p[category][c.id]) p[category][c.id].count++
      else p[category][c.id] = { ...c, count: 1 }
      return p
    }, {})
  const counts = equips.length + inventories.length + p_coins.value.length
  return {
    equips,
    inventories,
    inventory_gears,
    inventory_mats,
    pickaxes,
    counts
  }
}

const f_deepcheck = (id, target, handlecache) => {
  if (!s_database.value.items[target]?.recipies) return false
  let res = null
  s_database.value.items[target].recipies.forEach(recipy => {
    recipy.forEach(mat => {
      if (mat.item == id) {
        res = { target }
      }
      if (!handlecache[mat.item]) {
        const under = f_deepcheck(id, mat.item, handlecache)
        if (under) {
          res = { target, under }
        }
      } else {
        delete handlecache[mat.item]
      }
    })
  })
  return res
}
const f_getUsedby = id => {
  const res = {}
  const handlecache = p_handle.value.reduce((p, c) => (p[c] = true, p), {})
  Object.keys(c_targets.value).forEach(target => {
    const req = f_deepcheck(id, target, handlecache)
    if (req) res[target] = req
  })
  return Object.keys(res).length ? res : null
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.background_pathfinder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(50, 51, 56);
  border-radius: 10px;
  .pathfinder {
    position: fixed;
    top: 45px;
    bottom: 10px;
    left: 0;
    right: 4px;
    padding: 0 80px;
    padding-top: 20px;
    box-sizing: border-box;
    overflow-y: scroll;
    .meta {
      display: flex;
      .account {
        flex-shrink: 0;
      }
      .equips {
        display: flex;
        flex-wrap: wrap;
      }
    }
    .section_title {
      font-size: 24px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .inventory {
      .category {
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 10px;
      }
      .gearlist {
        display: flex;
        flex-wrap: wrap;
        .geargroup {
          margin-right: 5px;
          margin-bottom: 5px;
          .type {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .gears {
            .gear {
              background: rgb(43, 45, 49);
              box-sizing: border-box;
              padding: 10px;
              margin-right: 5px;
              margin-bottom: 5px;
              border-radius: 10px;
              min-width: 150px;
              display: flex;
              align-items: center;
              border: 1px solid transparent;
              &.targeted {
                border-color: rgb(89, 159, 98);
              }
              .grade {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                margin-right: 5px;
                background: gray;
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
              }
            }
          }
        }
      }
      .matlist {
        display: flex;
        flex-wrap: wrap;
        .matgroup {
          margin-right: 5px;
          margin-bottom: 5px;
          .mob {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .items {
            .item {
              position: relative;
              .trash {
                position: absolute;
                top: -2px;
                right: 2px;
                background: rgb(217, 94, 71);
                width: 13px;
                height: 13px;
                border-radius: 50%;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 11px;
              }
              &.noneeds {
                .itemmeta {
                  opacity: .5;
                }
              }
              &.targeted {
                .itemmeta {
                  border-color: rgb(89, 159, 98);
                }
              }
              .itemmeta {
                background: rgb(43, 45, 49);
                box-sizing: border-box;
                padding: 10px;
                margin-right: 5px;
                margin-bottom: 5px;
                border-radius: 10px;
                border: 1px solid transparent;
                min-width: 170px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .info {
                  display: flex;
                  align-items: center;
                  .grade {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    margin-right: 5px;
                    background: gray;
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
                  }
                }
                .count {
                  font-size: 13px;
                  margin-left: 10px;
                  .unit {
                    font-size: 10px;
                    margin-left: 3px;
                  }
                }
              }
              .tree {
                padding: 0 5px;
                &:last-child {
                  margin-bottom: 8px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
