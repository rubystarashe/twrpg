<template>
  <div class="usedaralist">
    <div class="guide" v-if="!c_userdata || !c_userdata.length">
      <div class="title">감지된 세이브 파일이 없습니다</div>
      <div class="description">게임에서 -save 명령어를 입력하시면 자동으로 인식해 불러옵니다</div>
    </div>
    <div class="userdata" v-for="([ account, account_data ]) in c_userdata">
      <div class="account">{{ account }}</div>
      <div class="jobs">
        <div class="job" v-for="([job, { date, items }]) in f_sort_accounts(account_data)"
          @click="e_select({ account, job })"
        >
          <div class="jobname">{{ job }}</div>
          <div class="updatedAt">{{ new Date(date).toLocaleDateString() }}</div>
          <div class="score">
              <div class="unit">장비점수</div>
              <div class="data">{{ f_getScore(items) }}</div>
            </div>
          <div class="items">
            <div class="item"
              v-for="{ name, type, grade } in f_getEquips(items)"
            >
              <div class="grade" :class="`grade_${grade}`"/>
              <div class="meta">
                <div class="type"><span class="gradename" :class="`gradename_${grade}`">{{ grades[grade] }}</span> {{ type }}</div>
                <div class="name">{{ name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const p_userdata = defineProp('userdata')

const s_database = useState('database')

const grades = ['일반', '델티라마', '넵티노스', '그노시스', '알테이아', '아르카나']

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
  return equips
}

const e_select = defineEmit('selected')

const f_getScore = items => {
  const equips = items.slice(0, 6).map(e => ({ id: e, ...s_database.value.items[e] })).filter(e => types.find(t => t == e.type)).sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
  for (let i = equips.length - 1; i >= 0; i--) {
    const index = equips.findIndex(e => e.type == equips[i].type)
    if (index >= 0 && index != i) {
      equips.splice(i, 1)
      break
    }
  }
  return equips.reduce((p, c) => p += c.grade, 0)
}
const c_userdata = computed(() => {
  return Object.entries(p_userdata.value)
    .sort((a, b) => Object.values(b[1]).reduce((p, c) => p = c.date > p ? c.date : p, 0) - Object.values(a[1]).reduce((p, c) => p = c.date > p ? c.date : p,0))
})
const f_sort_accounts = accounts => {
  return Object.entries(accounts).sort((a, b) => b[1].date - a[1].date).sort((a, b) => f_getScore(b[1].items) - f_getScore(a[1].items))
}
</script>

<style lang="scss" scoped>
.usedaralist {
  padding: 20px 50px;
  .guide {
    margin-top: 30px;
    .title {
      font-size: 24px;
      opacity: .5;
    }
    .description {
      font-size: 14px;
      opacity: 1;
      margin-top: 5px;
    }
  }
  .userdata {
    .account {
      font-size: 30px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .jobs {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      .job {
        position: relative;
        margin-right: 10px;
        margin-bottom: 10px;
        background: rgb(30, 31, 34);
        padding: 20px;
        border-radius: 5px;
        transition: background .3s;
        min-width: 230px;
        cursor: pointer;
        &:hover {
          background: rgb(38, 39, 42);
          .items {
            .item {
              background: rgb(59, 60, 65);
            }
          }
        }
        .jobname {
          font-size: 20px;
        }
        .updatedAt {
          font-size: 11px;
          margin-bottom: 20px;
        }
        .score {
          position: absolute;
          top: 20px;
          right: 20px;
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
        .items {
          .item {
            display: flex;
            align-items: center;
            background: rgb(43, 45, 49);
            border-radius: 5px;
            box-sizing: border-box;
            padding: 10px 15px;
            margin-top: 10px;
            transition: background .3s;
            .grade {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: gray;
              margin-right: 10px;
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
            .meta {
              .type {
                font-size: 12px;
                color: rgb(182, 186, 192);
                .gradename {
                  color: gray;
                  &.gradename_1 {
                    color: rgb(0, 158, 37);
                  }
                  &.gradename_2 {
                    color: rgb(81, 143, 187);
                  }
                  &.gradename_3 {
                    color: rgb(184, 28, 28);
                  }
                  &.gradename_4 {
                    color: rgb(166, 207, 0);
                  }
                  &.gradename_5 {
                    color: rgb(115, 60, 190);
                  }
                }
              }
              .name {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
  
}
</style>
