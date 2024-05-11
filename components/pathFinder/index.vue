<template>
  <Transition name="fade">
    <div class="background_pathfinder" v-show="m_visible">
      <div class="pathfinder" ref="r_finder">
        <div class="sticky_wrapper">
          <div class="accountmeta">
            <div class="left">
              <div class="account" @click="m_visible = false">
                <div class="banner"></div>
                <div class="name">{{ p_account }}</div>
                <div class="job">{{ p_job }}</div>
                <div class="updatedAt">{{ new Date(p_date).toLocaleString() }}</div>
                <div class="score">
                  <div class="unit">장비점수</div>
                  <div class="data">{{ f_getScore(f_getEquips(p_handle).equips) }}</div>
                </div>
              </div>
              <div class="back" @click="m_visible = false">다른 캐릭터 선택</div>
            </div>
            <div>
              <div class="section_title">장비 아이템</div>
              <div class="equips">
                <div
                  class="equip"
                  :class="`grade_${grade}`"
                  v-for="{ name, grade, type, description } in f_getEquips(p_handle).equips"
                >
                  <div class="grade">{{ grades[grade] }}</div>
                  <div class="type">{{ type }}</div>
                  <div class="name">{{ name }}</div>
                  <div class="description">
                    <div v-html="description"/>
                  </div>
                </div>
                <div class="etcs">
                  <div class="etcitem pickaxe" v-for="{ name, grade } in f_getEquips(p_handle).pickaxes">
                    <div class="etcmeta">
                      <div class="grade" :class="`grade_${grade}`">{{ grades[grade] }}</div>
                      <div class="name">{{ name }}</div>
                    </div>
                  </div>
                  <div class="etcitem" v-for="{ id, count } in p_coins.sort((a, b) => s_database.items[b.id].grade - s_database.items[a.id].grade)">
                    <div class="etcmeta">
                      <div class="grade" :class="`grade_${s_database.items[id].grade}`">{{ grades[s_database.items[id].grade] }}</div>
                      <div class="name">{{ s_database.items[id].name }}</div>
                    </div>
                    <div class="count">{{ count }}<span class="unit">개</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="line"/>
          <div class="section_title">보유 장비</div>
          <div class="gearlist">
            <div class="geargroup" v-for="(items, type) in f_getEquips(p_handle).inventory_gears">
              <div class="type">{{ type }}</div>
              <div class="gears">
                <div class="gear" v-for="({ name, grade, id }, i) in items"
                  :class="{ targeted: c_targets[id], equiped: f_getEquips(p_handle).equips.find(e => e.id == id) }"
                  @mouseover="s_f_setFloatingData(id)"
                  @mouseleave="s_f_setFloatingData()"
                >
                  <div class="grade" :class="`grade_${grade}`"/>
                  <div class="name">{{ name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="line"/>
          <div class="section_title">목표 아이템 그룹 선택</div>
          <div class="targets">
            <div v-for="({ name, tags, items }, index) in p_targets"
              class="target"
              :class="{ enabled: p_targetIndexes.findIndex(e => e == index) >= 0 }"
              @click="f_select_targetIndex(index)"
            >
              <div class="target_meta">
                <div class="radio">
                  <div class="ball"/>
                </div>
                <div class="name">{{ name }}</div>
                <div class="tags">
                  <div class="tag" v-for="tag in tags">#{{ tag }}</div>
                </div>
              </div>
              <div class="items">
                <div class="item" v-for="item in f_sort_items(items)"
                  @mouseover="s_f_setFloatingData(item)"
                  @mouseleave="s_f_setFloatingData()"
                >
                  <div class="grade" :class="`grade_${s_database.items[item].grade}`"/>
                  <div class="item_meta">
                    <div class="type">{{ s_database.items[item].type }}</div>
                    <div class="name">{{ s_database.items[item].name }}</div>
                  </div>
                </div>
                <div class="edit_wrapper">
                  <div class="edit" @click.stop="e_call_itemfinder({ account: p_account, job: p_job, index })">수정하기</div>
                </div>
              </div>
              <div class="reset" @click.stop="e_reset_targets(p_account, p_job, index)">초기화</div>
            </div>
          </div>
          <div class="iconfarming"
            :class="{ enabled: p_iconfarming, finished: p_icons.includes('I02T') }"
            @click="!p_icons.includes('I02T') ? f_update_iconfarming(!p_iconfarming, true) : null"
            ref="r_iconfarming"
          >
            <div class="target_meta">
              <div class="radio">
                <div class="ball"/>
              </div>
              <div class="name">아이콘 파밍<span v-if="p_icons.includes('I02T')"> 완료</span></div>
              <div class="description" v-if="!p_icons.includes('I02T')">
                레전드 아이콘을 목표로 파밍 루트를 추가합니다
              </div>
              <div class="description" v-else>
                같은 계정의 다른 캐릭터에도 적용됩니다
              </div>
            </div>
            <div class="iconsection" v-if="p_iconfarming || p_icons.includes('I02T')">
              <div class="iconsection_title">보유중인 아이콘을 체크하세요</div>
              <div class="iconlist">
                <div v-for="(icons, grade) in _iconlist"
                  v-show="grade == '레전드' || (!c_hasgrandicon)"
                >
                  <div class="grade" v-if="grade != '레전드'">{{ grade }}</div>
                  <div class="icons">
                    <div v-for="{ id, name, grade } in icons"
                      class="icon"
                      :class="{ handled: f_iconhandled(id) }"
                      @click.stop="f_select_icon(id)"
                    >{{ name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky_wrapper">
          <div class="line"/>
          <div class="section_title">파밍 루트</div>
        </div>

        <div ref="r_farming">

          <PathFinderFarming
            :handle="c_handle"
            :targets="c_targetgearlist"
            :float="_mini_targets_size"
          />
        </div>

        <div class="sticky_wrapper">
          <div class="line"/>
          <div class="section_title">목표 장비 대시보드</div>
          <div class="targetitemlist">
            <div class="targetgroup" v-for="(items, type) in c_targetgearlist">
              <div class="group">{{ type }}</div>
              <div class="items" :class="{ limit: type == '기타' }">
                <div class="item"
                  v-for="{ id, grade, name, handle, recipies } in items"
                  :class="{
                    handled: handle,
                    willmakeable: f_iswillmakable(id) == 1,
                    makeable: f_ismakable(id)
                  }"
                >
                  <div class="itemmeta"
                    @mouseover.stop="s_f_setFloatingData(id)"
                    @mouseleave.stop="s_f_setFloatingData()"
                  >
                    <div class="grade" :class="`grade_${grade}`"/>
                    <div class="name">{{ name }}</div>
                  </div>
                  <PathFinderReqTree v-if="!handle"
                    class="tree"
                    :target="id"
                    :handle="c_handle"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="line"/>
          <div class="section_title">인벤토리 관리 ({{ f_getEquips(p_handle).counts }}/60)</div>
          <div class="inventory">
            <!-- <div class="category">보유 조합 재료</div> -->
            <div class="matlist">
              <div class="matgroup" v-for="(items, mob) in f_getEquips(p_handle).inventory_mats"
                :class="{ etc: mob == 'etc' }"
              >
                <div class="mob">{{ s_database.mobs[mob]?.name }}</div>
                <div class="items">
                  <div class="item" v-for="{ id, name, grade, count } in items"
                    :class="{ targeted: c_targets[id], noneeds: !c_targets[id] && (!f_getUsedby(id).counts || !f_getUsedby(id)?.tree) }"
                  >
                    <div class="itemmeta"
                      @mouseover.stop="s_f_setFloatingData(id)"
                      @mouseleave.stop="s_f_setFloatingData()"
                    >
                      <div class="info">
                        <div class="grade" :class="`grade_${grade}`"/>
                        <div class="name">{{ name }}</div>
                      </div>
                      <div class="count" v-if="count > 1">{{ count }}<span class="unit">개</span></div>
                    </div>
                    <PathFinderMatTree v-if="f_getUsedby(id)?.tree" v-for="tree in f_getUsedby(id)?.tree"
                      class="tree"
                      :isTarget="true"
                      :tree="tree"
                      :handle="p_handle"
                    />
                    <div class="margin"/>
                    <div class="trash" v-if="(!f_getUsedby(id) || f_getUsedby(id).counts < count) || !f_getUsedby(id)?.tree">!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Transition name="fade">
        <div class="mini_targets" v-show="_visible_mini_targets"
          :class="{ visible: _visible_mini_targets }"
          ref="r_mini_targets"
        >
          <div class="title">인벤토리 ({{ f_getEquips(p_handle).counts }}/60)</div>
          <div class="list">
            <div v-for="({ name }, index) in p_targets"
              class="item"
              :class="{ enabled: p_targetIndexes.findIndex(e => e == index) >= 0 }"
              @click="f_select_targetIndex(index)"
            >{{ name }}</div>
            <div
              class="item iconfarming"
              :class="{ enabled: p_iconfarming, finished: p_icons.includes('I02T') }"
              @click="!p_icons.includes('I02T') ? f_update_iconfarming(!p_iconfarming) : (f_select_icon('I02T'), f_update_iconfarming(!p_iconfarming))"
            >아이콘 파밍</div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
const m_visible = defineModel('visible')

const s_database = useState('database')
const s_userdata = useState('userdata')

const p_account = defineProp('account')
const p_job = defineProp('job')
const p_date = defineProp('date')
const p_handle = defineProp('handle')
const p_coins = defineProp('coins')
const p_targets = defineProp('targets')
const p_targetIndexes = defineProp('targetIndexes')
const p_iconfarming = defineProp('iconfarming')
const p_icons = defineProp('icons')

const e_call_itemfinder = defineEmit('callFinder')
const e_refresh = defineEmit('refresh')
const e_reset_targets = defineEmit('resetTarget')

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
let r_iconfarming = $ref()
const f_select_icon = async icon => {
  const i = p_icons.value.indexOf(icon)
  let indexes = [ ...p_icons.value ]
  if (i >= 0) indexes.splice(i, 1)
  else indexes.push(icon)

  if (icon == 'I02T') {
    Object.entries(s_userdata.value?.[p_account.value]).forEach(([job, { icons }]) => {
      let indexes = [ ...icons ]
      if (i >= 0) indexes.splice(indexes.indexOf('I02T'), 1)
      else indexes.push('I02T')
      i_f_update_usertdata_icons(p_account.value, job, indexes)
    })
  } else if (icon == 'I0MD') {
    Object.entries(s_userdata.value?.[p_account.value]).forEach(([job, { icons }]) => {
      let indexes = [ ...icons ]
      if (i >= 0) indexes.splice(indexes.indexOf('I0MD'), 1)
      else indexes.push('I0MD')
      i_f_update_usertdata_icons(p_account.value, job, indexes)
    })
  } else i_f_update_usertdata_icons(p_account.value, p_job.value, indexes)
  e_refresh()
}
const f_update_iconfarming = async (boolean, scrollmove) => {
  const lastscroll = scroll.y.value
  i_f_update_usertdata_iconfarming(p_account.value, p_job.value, boolean)
  e_refresh()

  await nextTick()
  r_finder.scrollTo({
    left: 0,
    top: lastscroll
  })
  setTimeout(() => {
    if (scroll.y?.value > r_iconfarming.offsetTop && scrollmove) {
      r_finder.scrollTo({
        left: 0,
        top: lastscroll
      })
    }
  })
}

const icons = [
  '레전드 아이콘',
  '그랜드마스터 아이콘',
  '마스터 아이콘',
  '아가레스 아이콘',
  '해신 아이콘',
  '화신 아이콘',
  '뇌신 아이콘',
  '데스 핀드 아이콘',
  '암흑룡 아이콘',
  '주천사 아이콘',
  '에인션트 엔트 아이콘',
  '좀비 로드 아이콘',
  '해골 왕 아이콘',
  '본 드래곤 아이콘',
  '터틀 로드 아이콘',
  '플레임 나이트메어 아이콘',
  '커럽터 아이콘',
  '스피릿 비스트 아이콘',
  '매드 클라운 아이콘',
  '마왕 아이콘',
  '거미 제왕 아이콘',
  '서리한 아이콘',
  '타천사 아이콘',
  '능천사 아이콘',
  '문지기 아이콘',
  '데드렉트 아이콘',
  '마법사 왕 아이콘',
  '잭 아이콘',
  '백작 아이콘',
  '마나 에인션트 아이콘',
  '자이언트 골렘 아이콘',
  '라그나스 아이콘',
  '촉수 지배자 아이콘',
  '하이드라 아이콘'
]

const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']
const _iconlist = Object.values(s_database.value.items).filter(e => e.type == '아이콘' && icons.find(i => i == e.name)).sort((a, b) => icons.indexOf(a.name) - icons.indexOf(b.name))
  .map(e => {
    let grade = 1
    const index = icons.indexOf(e.name)
    if (!index) grade = 6
    else if (index <= 2) grade = 5
    else if (index <= 7) grade = 4
    else if (index <= 13) grade = 3
    else if (index <= 21) grade = 2
    return { ...e, grade }
  })
  .reduce((p, c) => {
    if (c.id == 'I02T') return (p['레전드'] = [ c ], p)
    if (!p[grades[c.grade]]) p[grades[c.grade]] = []
    p[grades[c.grade]].push(c)
    return p
  }, {})

const c_hasgrandicon = computed(() => {
  return !!Object.values(s_userdata.value?.[p_account.value] || {}).find(e => e.icons.find(e => e == 'I02T'))
})

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
  if (!p_handle.value.includes('I0OO')) res['I0OO'] = s_database.value.items['I0OO']
  if (p_iconfarming.value) res['I02T'] = s_database.value.items['I02T']
  return res
})
const types = reactive(['무기', '방어구', '날개', '장신구', '머리보호구'])
const f_getEquips = items => {
  const equips = items.slice(0, 6).map(e => ({ id: e, ...s_database.value.items[e] })).filter(e => types.find(t => t == e.type)).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
  for (let i = equips.length - 1; i >= 0; i--) {
    const index = equips.findIndex(e => e.type == equips[i].type)
    if (index >= 0 && index != i) {
      equips.splice(i, 1)
      break
    }
  }
  const inventories = items.filter(e => !equips.find(q => q.id == e)).map(e => ({ id: e, ...s_database.value.items[e] }))
  const pickaxes = inventories.filter(e => e.type == '곡괭이').sort((a, b) => b.grade - a.grade).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
  const inventory_gears = items.map(e => ({ id: e, ...s_database.value.items[e] })).filter(e => types.find(t => e.type == t)).sort((a, b) => b.grade - a.grade).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
    .reduce((p, c) => {
      if (!p[c.type]) p[c.type] = {}
      if (p[c.type][c.id]) p[c.type][c.id].count++
      else p[c.type][c.id] = { ...c, count: 1 }
      return p
    }, {})
  
  const inventory_mats = items.map(e => ({ id: e, ...s_database.value.items[e] }))
    .filter(e => e.id != 'I0OO' && ((!types.find(t => e.type == t) && e.type != '재화') || usedby[e.id])).sort((a, b) => b.grade - a.grade)
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
const f_deepcheck = (id, target, handlecache, counts) => {
  if (c_handle.value.find(e => e == target)) return false
  if (!s_database.value.items[target]?.recipies) return false
  let res = null
  s_database.value.items[target].recipies.forEach(recipy => {
    recipy.forEach(mat => {
      if (mat.item == id) {
        res = { target }
      }
      // if (!handlecache[mat.item]) {
      //   const under = f_deepcheck(id, mat.item, handlecache)
      //   if (under) {
      //     res = { target, under }
      //   }
      // } else {
      //   if (s_database.value.items[mat.item].type != '아이콘') delete handlecache[mat.item]
      // }
      if (!handlecache.includes(mat.item)) {
        const under = f_deepcheck(id, mat.item, handlecache, counts)
        if (under) {
          res = { target, under }
        }
      } else {
        if (!counts[mat.item]) counts[mat.item] = 1
        else counts[mat.item]++
        if (s_database.value.items[mat.item].type != '아이콘') handlecache.splice(handlecache.indexOf(mat.item), 1)
      }
    })
  })
  return res
}
const f_deepcheck2 = (id, target, origintarget, handlecache, counts) => {
  // if (c_handle.value.find(e => e == target)) return false
  if (!s_database.value.items[target]?.recipies) return false
  let res = null
  s_database.value.items[target].recipies.forEach(recipy => {
    recipy.forEach(mat => {
      if (mat.item == id) {
        res = { target }
      }
      if (!handlecache.includes(mat.item)) {
        const under = f_deepcheck2(id, mat.item, origintarget, handlecache, counts)
        if (under) {
          res = { target, under }
        }
      } else {
        if (s_database.value.items[mat.item].type != '아이콘') handlecache.splice(handlecache.indexOf(mat.item), 1)
      }
    })
  })
  return res
}
const f_getUsedby = id => {
  const res = {}
  // const handlecache = c_handle.value.reduce((p, c) => (p[c] = true, p), {})
  const handlecache = [ ...c_handle.value ]
  c_mats.value.filter(e => e.id == id).forEach(mat => {
    const r = ([ ...mat.target_tree ]).reverse()
    // console.log(mat.target_tree[0])
    res[mat.target_nearest.id] = r
  })
  return { tree: Object.keys(res).length ? res : null, counts: c_mats.value.filter(e => e.id == id).length }
}

const c_mats = computed(() => {
  const handlecache = c_handle.value.reduce((p, c) => {
    if (!p[c]) p[c] = 1
    else p[c]++
    return p
  }, {})

  const targets = []
  Object.values(c_targets.value).forEach(item => {
    if (item.type == '아이콘') targets.push({ ...item, type: '기타', grade: 99 })
    else if (item.type == '곡괭이') targets.push({ ...item, type: '기타', grade: 99 })
    else if (item.type == '기타') targets.push({ ...item, type: '기타', grade: 99 })
    else targets.push(item)
  })

  const recipies = {}
  const targethandlecache = [ ...c_handle.value ]
  const deepc = (target, origintarget, tree) => {
    if (target.recipies) {
      if (targethandlecache.includes(target.id)) {
        if (origintarget.name.indexOf('아이콘') < 0) targethandlecache.splice(targethandlecache.indexOf(target.id), 1)
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
          deepc(e, origintarget, [ e, ...tree ])
        })
      }
    }
  }
  let mats = []
  targets.sort((a, b) => a.grade - b.grade).forEach(item => {
    if (!c_handle.value.find(e => e == item.id)) {
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

const f_getScore = items => {
  return items.reduce((p, c) => p += c.grade, 0)
}

const f_sort_items = items => {
  return [ ...items ].filter(e => s_database.value.items[e]).sort((a, b) => s_database.value.items[b].grade - s_database.value.items[a].grade)
  .sort((a, b) => types.indexOf(s_database.value.items[a].type) - types.indexOf(s_database.value.items[b].type))
}

const c_targetgearlist = computed(() => {
  const res = Object.values(c_targets.value)
    .map(e => {
      const res = { ...e }
      if (c_handle.value.find(h => h == e.id)) res.handle = true
      return res
    })
    .map(e => {
      const res = { ...e }
      if (e.type == '곡괭이') res.type = '기타'
      return res
    })
    .sort((a, b) => b.grade - a.grade)
    .sort((a, b) => {
      if (a.type == '기타') return -1
      return types.indexOf(a.type) - types.indexOf(b.type)
    })
    .reduce((p, c) => {
      if (!p[c.type]) p[c.type] = {}
      p[c.type][c.id] = c
      return p
    }, {})
  if (res['아이콘']) {
    delete res['아이콘']
    if (p_iconfarming.value && !p_icons.value.includes('I02T')) icons.map(e => s_database.value.item_names[e]).filter(e => !c_handle.value.find(h => h == e.id))
      .filter(e => e.recipies)
      .forEach(e => {
        if (!res['기타']) res['기타'] = {}
        res['기타'][e.id] = e
      })
  }
  return res
})

let r_finder = $ref()
const scroll = useScroll(() => r_finder)
let r_farming = $ref()
let _visible_mini_targets = $ref(false)
let r_mini_targets = $ref()
let _mini_targets_size = $ref(0)
let _watching_table = $ref('hidden')
watch([p_account, p_job], async () => {
  await nextTick()
  r_finder.scrollTo({
    top: 0,
    left: 0
  })
  _mini_targets_size = 0
  _watching_table = 'hidden'
})
watch(scroll.y, n => {
  _visible_mini_targets = r_farming.offsetTop - 500 < n
  _mini_targets_size = r_mini_targets.offsetHeight - 40 + 'px'
  if (r_farming.offsetTop - r_finder.clientHeight < n && r_farming.offsetHeight + r_farming.offsetTop > n) {
    _watching_table = 'auto'
  } else _watching_table = 'hidden'
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
  let subcache = 0
  arr.forEach(e => {
    if (c_handle.value.filter(h => h == e.id).length >= e.count) return true
    else if (e.sub) {
      if (arr.some(a => a.sub && c_handle.value.includes(a.id))) {
        return true
      } if (!subcache) {
        subcache = 1
        counts++
      }
    }
    else if (s_database.value.items[e.id]?.recipies && f_ismakable(e.id)) return true
    else {
      counts += e.count - c_handle.value.filter(h => h == e.id).length
    }
  })
  return counts
}

const f_iconhandled = id => {
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
  return icons.includes(id)
}

const s_f_setFloatingData = useState('floatingInfo:f_setData')
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
  .line {
    width: 100%;
    margin: 30px 0;
    height: 1px;
    flex-shrink: 0;
    background: rgb(63, 64, 70);
  }
  .pathfinder {
    position: fixed;
    top: 45px;
    bottom: 5px;
    left: 5px;
    right: 4px;
    padding: 0 80px;
    padding-bottom: 100px;
    padding-top: 40px;
    box-sizing: border-box;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-x: v-bind('_watching_table');
    .accountmeta {
      display: flex;
      .back {
        color: rgb(182, 186, 192);
        font-size: 16px;
        margin-top: 10px;
        cursor: pointer;
        opacity: .7;
        transition: opacity .2s;
        &:hover {
          opacity: 1;
        }
      }
      .account {
        flex-shrink: 0;
        background: rgb(30, 31, 34);
        margin-right: 20px;
        box-sizing: border-box;
        padding: 10px;
        border-radius: 5px;
        height: 300px;
        min-width: 200px;
        position: relative;
        margin-top: 20px;
        padding-right: 60px;
        transition: background .3s;
        cursor: pointer;
        &:hover {
          background: rgb(38, 39, 42);
        }
        .name {
          font-size: 13px;
        }
        .job {
          font-size: 20px;
        }
        .updatedAt {
          font-size: 12px;
          margin-top: 5px;
        }
        .score {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .unit {
            font-size: 11px;
          }
          .data {
            font-size: 24px;
            margin-top: -2px;
          }
        }
      }
      .equips {
        display: flex;
        flex-wrap: wrap;
      }
    }
    .targets {
      display: flex;
      flex-wrap: wrap;
      .target {
        display: flex;
        background: rgb(43, 45, 49);
        border-radius: 5px;
        margin-right: 10px;
        margin-bottom: 10px;
        box-sizing: border-box;
        padding: 10px;
        transition: background .1s;
        border: 2px solid transparent;
        cursor: pointer;
        position: relative;
        &:has(.edit:hover) {
          background: rgb(43, 45, 49);
        }
        &.enabled {
          background: rgb(59, 60, 65);
          border-color: white;
          &:has(.edit:hover) {
            background: rgb(59, 60, 65);
          }
          .target_meta {
            color: white;
            .radio {
              border-color: white;
              .ball {
                background: white;
                opacity: 1;
              }
            }
          }
        }
        &:hover {
          background: rgb(67, 68, 74);
        }
        .target_meta {
          color: rgb(182, 186, 192);
          transition: color .1s;
          margin-right: 20px;
          margin-left: 5px;
          margin-top: 5px;
          .radio {
            transition: all .1s;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid rgb(182, 186, 192);
            display: flex;
            justify-content: center;
            align-items: center;
            .ball {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: rgb(182, 186, 192);
              opacity: 0;
            }
          }
          .name {
            font-size: 16px;
            margin: 10px 0;
          }
          .tags {
            opacity: 0.7;
            .tag {
              font-size: 12px;
            }
          }
        }
        .items {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          max-height: 250px;
          .item {
            background: rgb(38, 39, 42);
            box-sizing: border-box;
            padding: 10px;
            margin-right: 5px;
            margin-bottom: 5px;
            border-radius: 10px;
            border: 1px solid transparent;
            height: 50px;
            min-width: 170px;
            display: flex;
            align-items: center;
            .grade {
              font-size: 12px;
              background: gray;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              margin-right: 10px;
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
            .item_meta {
              .type {
                font-size: 10px;
                color: rgb(182, 186, 192);
              }
              .name {
                font-size: 13px;
                color: rgb(182, 186, 192);
              }
            }
          }
          .edit_wrapper {
            box-sizing: border-box;
            padding: 7px 20px;
            margin-right: 5px;
            margin-bottom: 5px;
            min-width: 170px;
            height: 50px;
            .edit {
              // background: rgb(78, 80, 87);
              background: rgb(76, 83, 189);
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 5px;
              border: 1px solid transparent;
              transition: background .1s;
              font-size: 13px;
              &:hover {
                // background: rgb(110, 111, 119);
                background: rgb(94, 103, 324);
              }
            }
          }
        }
        .reset {
          position: absolute;
          bottom: 10px;
          font-size: 11px;
          cursor: pointer;
          opacity: .3;
          &:hover {
            opacity: .8;
          }
        }
      }
    }
    .iconfarming {
      display: flex;
      background: rgba(227, 182, 76, .1);
      border-radius: 5px;
      margin-right: 10px;
      margin-bottom: 10px;
      box-sizing: border-box;
      padding: 10px;
      transition: background .1s;
      border: 2px solid transparent;
      cursor: pointer;
      margin-top: 20px;
      // &:has(.icon:hover) {
      //   background: rgba(227, 182, 76, .1);
      // }
      &.enabled {
        background: rgba(227, 182, 76, .2);
        border-color: rgb(227, 182, 76);
        // &:has(.icon:hover) {
        //   background: rgba(227, 182, 76, .2);
        // }
        .target_meta {
          color: white;
          .radio {
            border-color: rgb(227, 182, 76);
            .ball {
              background: rgb(227, 182, 76);
              opacity: 1;
            }
          }
        }
      }
      &:hover {
        background: rgba(227, 182, 76, .2);
      }
      &.finished {
        background: rgba(89, 159, 98, .2);
        border-color: rgba(89, 159, 98);
        .target_meta {
          color: white;
          .radio {
            border-color: rgb(89, 159, 98);
            .ball {
              background: rgb(89, 159, 98);
              opacity: 1;
            }
          }
        }
        .icon {
          background: rgb(89, 159, 98) !important;
        }
      }
      .target_meta {
        color: rgb(182, 186, 192);
        transition: color .1s;
        margin-right: 20px;
        margin-left: 5px;
        margin-top: 5px;
        min-width: 140px;
        .radio {
          transition: all .1s;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(227, 182, 76, .5);
          display: flex;
          justify-content: center;
          align-items: center;
          .ball {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(227, 182, 76, .5);
            opacity: 0;
          }
        }
        .name {
          font-size: 16px;
          margin: 10px 0;
        }
        .description {
          opacity: 0.7;
          font-size: 12px;
          margin-bottom: 10px;
          word-break: keep-all;
        }
      }
      .iconsection {
        .iconsection_title {
          font-size: 16px;
          margin: 10px 0;
        }
        .iconlist {
          .grade {
            font-size: 14px;
            opacity: .8;
            margin: 5px 0;
          }
          .icons {
            display: flex;
            flex-wrap: wrap;
            .icon {
              background: rgba(227, 182, 76, .2);
              box-sizing: border-box;
              padding: 7px 10px;
              margin-right: 5px;
              margin-bottom: 5px;
              border-radius: 5px;
              border: 1px solid transparent;
              display: flex;
              align-items: center;
              font-size: 13px;
              transition: background .1s;
              &.handled {
                background: rgba(227, 182, 76, .8);
              }
              &:hover {
                background: rgba(227, 182, 76, .6);
              }
            }
          }
        }
      }
    }
    .equips {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      .equip {
        margin-right: 10px;
        margin-bottom: 10px;
        background: rgb(43, 45, 49);
        color: white;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid gray;
        &.grade_1 {
          border-color: rgb(0, 158, 37);
          .grade {
            color: rgb(0, 158, 37);
          }
        }
        &.grade_2 {
          border-color: rgb(0, 158, 37);
          .grade {
            color: rgb(81, 143, 187);
          }
        }
        &.grade_3 {
          border-color: rgb(184, 28, 28);
          .grade {
            color: rgb(184, 28, 28);
          }
        }
        &.grade_4 {
          border-color: rgb(166, 207, 0);
          .grade {
            color: rgb(166, 207, 0);
          }
        }
        &.grade_5 {
          border-color: rgb(115, 60, 190);
          .grade {
            color: rgb(115, 60, 190);
          }
        }
        &:hover {
          background: rgb(67, 68, 74);
          color: white;
        }
        .grade {
          font-size: 14px;
          color: gray;
        }
        .type {
          font-size: 16px;
          color: rgb(182, 186, 192);
        }
        .name {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .description {
          font-size: 11px;
          color: rgb(182, 186, 192);
        }
      }
      .etcs {
        .etcitem {
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
          &.pickaxe {
            background: rgb(30, 31, 34);
          }
          .etcmeta {
            .grade {
              font-size: 12px;
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
            .name {
              font-size: 14px;
              color: rgb(182, 186, 192);
            }
          }
          .count {
            font-size: 16px;
            margin-left: 10px;
            .unit {
              font-size: 12px;
              margin-left: 3px;
            }
          }
        }
      }
    }
    .section_title {
      font-size: 24px;
      margin-top: 20px;
      margin-bottom: 30px;
    }
    .targetitemlist {
      display: flex;
      flex-wrap: wrap;
      .targetgroup {
        margin-right: 5px;
        margin-bottom: 5px;
        .group {
          margin-bottom: 10px;
          font-size: 14px;
          opacity: .8;
        }
        .items {
          display: flex;
          flex-direction: column;
          margin-right: 5px;
          margin-bottom: 5px;
          flex-wrap: wrap;
          max-height: 1300px;
          &.limit {
            flex-wrap: wrap;
            max-height: 750px;
          }
          .item {
            position: relative;
            margin-right: 5px;
            margin-bottom: 10px;
            &.willmakeable {
              .itemmeta {
                border-color: rgb(94, 103, 234);
                .name {
                  color: white;
                }
              }
            }
            &.makeable {
              .itemmeta {
                border-color: rgb(173, 255, 47);
                .name {
                  color: white;
                }
              }
            }
            &.handled {
              .itemmeta {
                border-color: rgb(89, 159, 98);
                .name {
                  color: white;
                }
              }
            }
          }
          .itemmeta {
            background: rgb(43, 45, 49);
            box-sizing: border-box;
            padding: 10px;
            margin-right: 10px;
            margin-bottom: 5px;
            border-radius: 10px;
            min-width: 150px;
            display: flex;
            align-items: center;
            border: 1px solid transparent;
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
          .tree {
            padding: 0 5px;
          }
        }
      }
    }
    .gearlist {
      display: flex;
      flex-wrap: wrap;
      .geargroup {
        margin-right: 15px;
        margin-bottom: 15px;
        .type {
          margin-bottom: 10px;
          font-size: 14px;
          opacity: .8;
        }
        .gears {
          display: flex;
          flex-direction: column;
          max-height: 250px;
          flex-wrap: wrap;
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
            &.equiped {
              // border-color: rgb(94, 103, 234);
              border-color: white;
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
    .category {
      font-size: 20px;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .inventory {
      .matlist {
        display: flex;
        flex-wrap: wrap;
        .matgroup {
          margin-right: 5px;
          margin-bottom: 5px;
          &.etc {
            .items {
              max-height: 400px;
            }
          }
          .mob {
            margin-bottom: 10px;
            font-size: 14px;
            opacity: .8;
          }
          .items {
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            margin-right: 10px;
            margin-bottom: 10px;
            .item {
              position: relative;
              margin-right: 5px;
              margin-bottom: 5px;
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
              }
              .margin {
                width: 1px;
                margin-bottom: 8px;
              }
            }
          }
        }
      }
    }
  }
}
.mini_targets {
  position: fixed;
  top: 40px;
  left: 0;
  right: 15px;
  background: rgb(43, 45, 49);
  background: rgb(30, 31, 34);
  padding: 20px 50px;
  padding-bottom: 15px;
  box-sizing: border-box;
  border-top: 1px solid rgb(63, 64, 70);
  pointer-events: none;
  &.visible {
    pointer-events: auto;
  }
  .title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .item {
      margin-right: 10px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid transparent;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      background: rgb(43, 45, 49);
      color: rgb(182, 186, 192);
      transition: background .1s;
      &.enabled {
        color: white;
        background: rgb(59, 60, 65);
        border-color: white;
      }
      &:hover {
        background: rgb(67, 68, 74);
      }
    }
    .iconfarming {
      background: rgba(227, 182, 76, .1);
      color: rgb(182, 186, 192);
      &.enabled {
        background: rgba(227, 182, 76, .3);
        border-color: rgb(227, 182, 76);
        color: white;
      }
      &:hover {
        background: rgba(227, 182, 76, .2);
      }
      &.finished {
        background: rgba(89, 159, 98, .4);
        border-color: rgba(89, 159, 98);
        color: white;
      }
    }
  }
}
.sticky_wrapper {
  position: sticky;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}
</style>
