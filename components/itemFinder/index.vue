<template>
  <Transition name="fade">
    <div class="background_item_finder" v-show="m_visible">
      <div class="item_finder" ref="r_finder" @click.self="m_visible = false">
        <div class="title">
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
              >
                <div class="meta">
                  <div v-if="c_handleitems[id]" class="handle">보유중</div>
                  <div class="grade" :class="`grade_${grade}`">{{ grades[grade] }}</div>
                  <div class="name">{{ name }} <span v-if="droprates?.length" class="tags">완제</span></div>
                  <div class="description" v-html="description"/>
                  <!-- <div class="droprates">{{ droprates }}</div> -->
                </div>
                <div class="delete" @click="f_delete_target(id)">d</div>
              </div>
            </div>
          </div>
        </div>
        <div class="section_title" @click.self="m_visible = false">목표 아이템 관리</div>
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
                >
                  <div v-if="c_handleitems[id]" class="handle">보유중</div>
                  <div v-if="c_targetitems[id]" class="target">목표 아이템</div>
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
            >
              <div class="grade" :class="`grade_${grade}`"/>
              <div class="name">{{ name }} <span v-if="droprates?.length" class="tags">완제</span></div>
              <div class="delete" @click="f_delete_target(id)">d</div>
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
const _grade_filters = reactive([false, false, false, false, false, true])

const types = reactive(['무기', '방어구', '날개', '장신구', '머리보호구'])
const _type_filter = $ref('무기')

const c_grade_items = computed(() => {
  return Object.entries(s_database.value.items).filter(([id, item]) => {
    const search = _search?.trim().replace(/ /g, '')
    if (search) {
      const searchstring = (item.name + item.searchstring)?.trim().replace(/ /g, '')
      if (searchstring.indexOf(search) >= 0 && types.find(e => e == item.type)) return true
    } else if (_grade_filters[item.grade] && item.type == _type_filter) return true
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
const c_menu_margin = computed(() => _mini_targetlist_size - 25 + 20 + 'px')

let r_itemlist = $ref()
watch(() => _type_filter, () => {
  const to = r_itemlist.offsetTop - _mini_targetlist_size - 100
  if (scroll.y.value >to) r_finder.scrollTo({
    top: to,
    left: 0,
    behavior: "smooth"
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
  r_finder.scrollTo({
    top: 0,
    left: 0
  })
})
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
  bottom: 10px;
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
            width: 20px;
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
    top: 40px;
    left: 0;
    right: 15px;
    pointer-events: none;
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
            width: 20px;
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
