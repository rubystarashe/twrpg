<template>
  <div class="usedaralist">
    <div class="userdata" v-for="(account_data, account) in p_userdata">
      <div class="account">{{ account }}</div>
      <div class="jobs">
        <div class="job" v-for="({ date, items }, job) in account_data"
          @click="e_select({ account, job })"
        >
          <div class="jobname">{{ job }}</div>
          <div class="updatedAt">{{ new Date(date).toLocaleDateString() }}</div>
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
  return items.slice(0, 6).map(e => s_database.value.items[e]).filter(e => types.find(t => t == e.type))
}

const e_select = defineEmit('selected')
</script>

<style lang="scss" scoped>
.usedaralist {
  padding: 20px 50px;
  .userdata {
    .account {
      font-size: 30px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .jobs {
      display: flex;
      flex-wrap: wrap;
      .job {
        margin-right: 10px;
        margin-bottom: 10px;
        background: rgb(30, 31, 34);
        padding: 20px;
        border-radius: 5px;
        transition: background .3s;
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
        .items {
          .item {
            display: flex;
            align-items: center;
            background: rgb(43, 45, 49);
            border-radius: 5px;
            box-sizing: border-box;
            padding: 10px 20px;
            margin-top: 10px;
            transition: background .3s;
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
            .meta {
              .type {
                font-size: 13px;
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

              }
            }
          }
        }
      }
    }
  }
  
}
</style>
