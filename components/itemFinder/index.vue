<template>
  <Transition name="fade">
    <div class="background_item_finder" v-show="m_visible">
      <div class="close" @click="m_visible = false">빈 공간을 클릭하면 닫힙니다</div>
      <div class="item_finder" ref="r_finder" @mousedown.self="m_visible = false">
        <div class="title" @click="m_visible = false">
          <div class="account">{{ p_account }}</div>
          <div class="job">{{ p_job }}</div>
          <div class="target">{{ p_target.name }}</div>
          <div class="type">{{ p_target.tags?.map(e => '#' + e).join(' ') }}</div>
        </div>
        <div class="section_title" @click.self="m_visible = false">목표 아이템</div>
        <div class="targetlist" @click.self="m_visible = false" ref="r_targetlist">
          <div
            class="typelist"
            v-for="(items, type) in c_targetitems_by_type"
            @click.self="m_visible = false"
          >
            <div class="type">{{ type }}</div>
            <div class="items"
              @click.self="m_visible = false"
            >
              <div
                class="item"
                v-for="{ id, name, description, grade, droprates } in items"
                :class="{ selected: c_targetitems[id], handled: c_handleitems[id] }"
                @mouseover="s_f_setFloatingData(id)"
                @mouseleave="s_f_setFloatingData()"
              >
                <div class="meta">
                  <div v-if="c_handleitems[id]" class="handle">보유중</div>
                  <div class="grade" :class="`grade_${grade}`">{{ grades[grade] }}</div>
                  <div class="name">{{ name }} <span v-if="droprates?.length" class="tags">완제</span></div>
                  <div class="description" v-html="description"/>
                  <!-- <div class="droprates">{{ droprates }}</div> -->
                </div>
                <div class="delete" @click="f_delete_target(id)">삭제</div>
              </div>
            </div>
          </div>
        </div>
        <div class="section_title" @click.self="m_visible = false">아이템 찾기</div>
        <div class="floating_top">
          <div
            class="mini_targetlist_areabox"/>
        </div>
        <div class="main"
          @click.self="m_visible = false"
          ref="r_itemlist"
        >
          <div class="left">
            <div class="search">
              <input @input="_search = $event.target.value" placeholder="아이템 검색">
            </div>
            <div class="filter" @click.self="m_visible = false"
              :class="{ searching: _search }"
            >
              <div class="types">
                <div
                  v-for="type in types"
                  class="type"
                  :class="{ selected: _type_filter == type }"
                  @click="_type_filter = type"
                >{{ type }}</div>
              </div>
              <div class="attrs">
                <div class="attr" v-for="{ name, filters } in attrs">
                  <div class="attrtype">{{ name }}</div>
                  <div class="attrfilter" v-for="(filter, attr) in filters"
                    :class="{ selected: _attr_filters[attr] }"
                    @click="_attr_filters[attr] ? delete _attr_filters[attr] : _attr_filters[attr] = filter"
                  >{{ attr }}</div>
                </div>
              </div>
              <div class="grades">
                <div
                  v-for="(grade, index) in grades"
                  class="grade"
                  :class="{ selected: _grade_filters[index] }"
                  @click="_grade_filters[index] = !_grade_filters[index]"
                >{{ grade }}</div>
              </div>
            </div>
          </div>
          <div class="itemlist" @click.self="m_visible = false">
            <div
              v-for="(items, grade) in c_grade_items"
              class="gradelist"
              @click.self="m_visible = false"
            >
              <div class="grade">{{ grade }}</div>
              <div class="items"
                @click.self="m_visible = false"
              >
                <div
                  class="item"
                  v-for="{ id, name, description, grade, droprates } in items"
                  :class="{ selected: c_targetitems[id], handled: c_handleitems[id] }"
                  @click="c_targetitems[id] ? f_delete_target(id) : f_add_target(id)"
                  @mouseover="s_f_setFloatingData(id)"
                  @mouseleave="s_f_setFloatingData()"
                >
                  <div v-if="c_handleitems[id]" class="handle">보유중</div>
                  <div v-if="c_targetitems[id]" class="target">목표 아이템</div>
                  <div class="itemgrade" :class="`grade_${grade}`">{{ grades[grade] }}</div>
                  <div class="name">{{ name }} <span v-if="droprates?.length" class="tags">완제</span></div>
                  <div class="description" v-html="description"/>
                  <!-- <div class="droprates">{{ droprates }}</div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mini_targetlist"
        :class="{ visible: _visible_mini_targetlist }"
        ref="r_mini_targetlist"
      >
        <div
          class="typelist"
          v-for="(items, type) in c_targetitems_by_type"
          @click.self="m_visible = false"
        >
          <div class="type">{{ type }}</div>
          <div class="items"
            @click.self="m_visible = false"
          >
            <div
              class="item"
              v-for="{ id, name, description, grade, droprates } in items"
              :class="{ selected: c_targetitems[id], handled: c_handleitems[id] }"
              @mouseover="s_f_setFloatingData(id)"
              @mouseleave="s_f_setFloatingData()"
            >
              <div class="grade" :class="`grade_${grade}`"/>
              <div class="name">{{ name }} <span v-if="droprates?.length" class="tags">완제</span></div>
              <div class="delete" @click="f_delete_target(id)">삭제</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const p_handle = defineProp('handle')
const p_target = defineProp('target')

const m_visible = defineModel('visible')

const s_database = useState('database')

const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']
const _grade_filters = reactive([false, false, false, false, true, true])

const types = reactive(['전체', '무기', '방어구', '날개', '장신구', '머리보호구'])
const _type_filter = $ref('전체')

const attrs = [
  {
    name: '스탯',
    filters: {
      '힘': [ '힘 +' ],
      '민첩성': [ '민첩성 +' ],
      '지능': [ '지능 +' ],
      '주 스탯': [ '주 스탯 +' ],
      '모든 스탯': [ '방어력 +' ]
    }
  },
  {
    name: '공격',
    filters: {
      '스킬 데미지': [ '스킬 데미지 +', '스킬 데미지 &' ],
      '공격력': [ '공격력 +' ],
      '공격 속도': [ '공격 속도 +' ],
      '치명타 확률': [ '치명타 확률 +' ],
      '치명타 배수': [ '치명타 배수 +' ],
      '지속 데미지': [ '지속 데미지 +' ],
      '공격 강화': [ '스킬 시전 시 다음 공격을', '거리 이동 시' ],
      '방어력 감소': [ '방어력 감소' ],
      '최대 마나': [ 'MP +' ],
      '속성 효율': [ '속성 효율 ' ]
    }
  },
  {
    name: '방어',
    filters: {
      '최대 체력': [ 'HP +' ],
      '방어력': [ '방어력 +' ],
      '피해 감소': [ '받는 데미지 -', '데미지 감소률 ', '데미지 감소율 ' ],
      '마법 피해 감소': [ '마법 방어력 ' ],
      '마법 방어': [ '주기 마법 방어' ]
    }
  },
  {
    name: '보조',
    filters: {
      '회복량': [ '회복량 +', '회복량 1' ],
      '아군 강화': [ '주변 아군' ],
      '이동 속도': [ '이동 속도 +' ],
      '일정 주기 강화': [ '초마다' ],
      '소환': [ ' 소환' ]
    }
  }
]
const _attr_filters = reactive({})

const c_grade_items = computed(() => {
  return Object.entries(s_database.value.items).filter(([id, item]) => {
    const search = _search?.trim().replace(/ /g, '')
    if (search) {
      const searchstring = (item.name + item.searchstring)?.trim().replace(/ /g, '')
      if (searchstring.indexOf(search) >= 0 && types.find(e => e == item.type)) return true
    } else if (_grade_filters[item.grade] && (item.type == _type_filter || _type_filter == '전체')) {
      if (!Object.keys(_attr_filters).length) return true
      else {
        return Object.values(_attr_filters).some(e => item.description.indexOf(e) >= 0)
      }
    }
  }).map(([id, item]) => ({ id, ...item })).sort((a, b) => b.grade - a.grade).reduce((p, c) => {
    if (!p[grades[c.grade]]) p[grades[c.grade]] = {}
    p[grades[c.grade]][c.id] = c
    return p
  }, {})
})

const c_handleitems = computed(() => {
  return p_handle.value?.reduce((p, c) => (p[c] ? p[c]++ : p[c] = 1, p), {}) || {}
})
const c_targetitems = computed(() => {
  return p_target.value?.items?.reduce((p, c) => (p[c] = true, p), {}) || {}
})

const c_targetitems_by_type = computed(() => {
  return p_target.value?.items?.sort((a, b) => types.indexOf(s_database.value.items[a].type) - types.indexOf(s_database.value.items[b].type)).reduce((p, c) => {
    if (!p[s_database.value.items[c]?.type]) p[s_database.value.items[c]?.type] = []
    p[s_database.value.items[c]?.type].push({ id: c, ...s_database.value.items[c] })
    p[s_database.value.items[c]?.type].sort((a, b) => b.grade - a.grade)
    return p
  }, {})
})

const p_account = defineProp('account')
const p_job = defineProp('job')
const p_targetIndex = defineProp('targetIndex')
const i_f_update_usertdata_target = inject('app:f_update_usertdata_target')

const f_delete_target = id => {
  const targets = p_target.value.items
  targets.splice(targets.indexOf(id), 1)
  i_f_update_usertdata_target(p_account.value, p_job.value, p_targetIndex.value, { ...p_target.value, items: targets })
}
const f_add_target = id => {
  const targets = p_target.value.items
  targets.push(id)
  i_f_update_usertdata_target(p_account.value, p_job.value, p_targetIndex.value, { ...p_target.value, items: targets })
}

let r_finder = $ref()
const scroll = useScroll(() => r_finder)

let r_targetlist = $ref()
let _visible_mini_targetlist = $ref(false)

let r_mini_targetlist = $ref()
let _mini_targetlist_size = $ref(0)
watch(scroll.y, n => {
  // _visible_mini_targetlist = r_targetlist.offsetTop + r_targetlist.offsetHeight - _mini_targetlist_size + 100 < n
  _visible_mini_targetlist = 200 < n
})
onMounted(async() => {
  await nextTick()
  _mini_targetlist_size = r_mini_targetlist.offsetHeight
})
watchOnce(m_visible, async n => {
  if (n) {
    await nextTick()
    _mini_targetlist_size = r_mini_targetlist.offsetHeight
  }
})
watch(c_targetitems, async () => {
  await nextTick()
  _mini_targetlist_size = r_mini_targetlist.offsetHeight
})
const c_mini_targetlist_margin = computed(() => '-' + _mini_targetlist_size + 'px')
const c_mini_targetlist_size = computed(() => _mini_targetlist_size + 'px')
const c_menu_margin = computed(() => _mini_targetlist_size - 25 + 50 + 'px')

let r_itemlist = $ref()
watch(() => _type_filter, () => {
  const to = r_itemlist.offsetTop - _mini_targetlist_size - 100
  if (scroll.y.value >to) r_finder.scrollTo({
    top: to,
    left: 0,
    behavior: "smooth"
  })
})
watch(_attr_filters, () => {
  const to = r_itemlist.offsetTop - _mini_targetlist_size - 100
  if (scroll.y.value >to) r_finder.scrollTo({
    top: to,
    left: 0
  })
})

let _search = $ref('')
watch(() => _search, n => {
  if (n) {
    const to = r_itemlist.offsetTop - _mini_targetlist_size - 100
    if (scroll.y.value >to) r_finder.scrollTo({
      top: to,
      left: 0,
      behavior: "smooth"
    })
  }
})

watch([p_account, p_job, p_targetIndex], async (v) => {
  await nextTick()
  _search = ''
  r_finder.scrollTo({
    top: 0,
    left: 0
  })
})

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
.background_item_finder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(50, 51, 56, .9);
  backdrop-filter: blur(5px);
  border-radius: 10px;
}
.close {
  position: fixed;
  top: 120px;
  right: 70px;
  font-size: 16px;
  cursor: pointer;
  opacity: .5;
  z-index: 2;
  transition: opacity .2s;
  &:hover {
    opacity: .8;
  }
}
.title {
  margin-top: 40px;
  padding: 0 50px;
  .account {
    font-size: 13px;
  }
  .job {
    font-size: 20px;
  }
  .target {
    font-size: 50px;
  }
}
.item_finder {
  position: fixed;
  top: 45px;
  bottom: 5px;
  left: 0;
  right: 4px;
  padding-top: 20px;
  box-sizing: border-box;
  overflow-y: scroll;
  .section_title {
    font-size: 28px;
    margin: 20px 0;
    margin-top: 40px;
    padding: 0 50px;
  }
  .targetlist {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 0 50px;
    padding-right: 40px;
    .typelist {
      .type {
        font-size: 20px;
        margin-bottom: 10px;
      }
      .items {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        margin-right: 10px;
        margin-bottom: 10px;
        .item {
          margin-right: 10px;
          margin-bottom: 10px;
          background: rgb(43, 45, 49);
          color: rgb(182, 186, 192);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid rgb(217, 94, 71);
          cursor: pointer;
          display: flex;
          .meta {
            .handle {
              font-size: 16px;
              color: rgb(89, 159, 98);
            }
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
            .name {
              font-size: 18px;
              .tags {
                font-size: 12px;
              }
              margin-bottom: 10px;
            }
            .description {
              font-size: 11px;
            }
          }
          .delete {
            margin-left: 10px;
            opacity: .5;
            height: 20px;
            width: 30px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
              opacity: 1;
              color: rgb(217, 94, 71);
            }
          }
        }
        .selected {
          background: rgb(67, 68, 74);
          color: white;
        }
        .handled {
          border-color: rgb(89, 159, 98);
        }
      }
    }
  }
  .floating_top {
    position: sticky;
    top: -50px;
    pointer-events: none;
  }
  .mini_targetlist_areabox {
    height: v-bind('c_mini_targetlist_size');
    width: 100%;
    margin-top: v-bind('c_mini_targetlist_margin');
    pointer-events: none;
  }
  .main {
    display: flex;
    position: sticky;
    .left {
      height: 100%;
      padding: 0 40px;
      padding-right: 30px;
      position: sticky;
      top: v-bind('c_menu_margin');
    }
  }
  .search {
    margin: auto;
    width: 250px;
    box-sizing: border-box;
    padding: 0 10px;
    input {
      width: 100%;
      height: 40px;
      background: rgb(30, 31, 34);
      border: none;
      outline: none;
      border-radius: 10px;
      font-size: 18px;
      color: white;
      box-sizing: border-box;
      padding: 5px 10px;
    }
    input::-webkit-input-placeholder {
      color: rgb(150, 155, 163);
    }
  }
  .filter {
    flex-shrink: 0;
    display: flex;
    transition-property: filter, opacity;
    transition-duration: .3s;
    width: 370px;
    &.searching {
      filter: blur(10px);
      pointer-events: none;
      opacity: 0;
    }
    .types {
      flex-shrink: 0;
      padding: 10px;
      box-sizing: border-box;
      .type {
        opacity: .5;
        margin: 5px;
        font-size: 18px;
        padding: 5px;
        cursor: pointer;
      }
      .selected {
        opacity: 1;
      }
    }
    .grades {
      display: flex;
      flex-shrink: 0;
      flex-direction: column-reverse;
      justify-content: flex-end;
      padding: 10px;
      box-sizing: border-box;
      .grade {
        opacity: .5;
        margin: 5px;
        font-size: 18px;
        padding: 5px;
        cursor: pointer;
      }
      .selected {
        opacity: 1;
      }
    }
    .attrs {
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      padding: 10px;
      box-sizing: border-box;
      .attrtype {
        opacity: .5;
        margin: 5px;
        font-size: 18px;
        padding: 5px;
        padding-bottom: 0px;
      }
      .attrfilter {
        opacity: .5;
        margin-left: 15px;
        font-size: 12px;
        padding: 2.5px;
        cursor: pointer;
      }
      .selected {
        opacity: 1;
      }
    }
  }
  .itemlist {
    padding-right: 40px;
    min-height: 100vh;
    .gradelist {
      margin-bottom: 40px;
      .grade {
        font-size: 24px;
        margin: 10px 0;
      }
      .items {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        .item {
          margin-right: 10px;
          margin-bottom: 10px;
          background: rgb(43, 45, 49);
          color: rgb(182, 186, 192);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid transparent;
          cursor: pointer;
          &:hover {
            background: rgb(59, 60, 65);
            color: rgb(220, 222, 225);
          }
          .handle {
            font-size: 16px;
            color: rgb(89, 159, 98);
          }
          .target {
            font-size: 14px;
            color: rgb(217, 94, 71);
          }
          .itemgrade {
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
          .name {
            font-size: 18px;
            .tags {
              font-size: 12px;
            }
            margin-bottom: 10px;
          }
          .description {
            font-size: 11px;
          }
        }
        .selected {
          background: rgb(67, 68, 74);
          border-color: rgb(217, 94, 71);
          color: white;
        }
        .handled {
          border-color: rgb(89, 159, 98);
        }
      }
    }
  }
}
  .mini_targetlist {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 20px 50px;
    padding-bottom: 15px;
    transition: background .3s;
    position: fixed;
    // top: 40px;
    top: 75px;
    left: 0;
    right: 15px;
    pointer-events: none;
    border-top: 1px solid rgb(63, 64, 70);
    z-index: 3;
    .typelist {
      opacity: 0;
      transition: opacity .3s;
      .type {
        font-size: 14px;
        margin-bottom: 5px;
      }
      .items {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        margin-right: 5px;
        margin-bottom: 5px;
        .item {
          margin-right: 10px;
          margin-bottom: 10px;
          background: rgb(43, 45, 49);
          color: rgb(182, 186, 192);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          .grade {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: gray;
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
          .name {
            font-size: 16px;
            .tags {
              font-size: 12px;
            }
          }
          .delete {
            margin-left: 10px;
            opacity: .5;
            height: 20px;
            width: 30px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
              opacity: 1;
              color: rgb(217, 94, 71);
            }
          }
        }
        .selected {
          background: rgb(67, 68, 74);
          color: white;
        }
        .selected {
          border-color: rgb(217, 94, 71);
        }
        .handled {
          border-color: rgb(89, 159, 98);
        }
      }
    }
    &.visible {
      background: rgb(30, 31, 34);
      pointer-events: auto;
      .typelist {
        opacity: 1;
      }
    }
  }
</style>
