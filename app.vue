<template>
  <div class="app">
    <div class="titlebar">

    </div>
    <div class="content">
      <UserDataList
        :userdata="s_userdata"
        @selected="f_call_pathFinder($event.account, $event.job)"
      />
      <PathFinder
        :account="_pathFinder_meta.account"
        :job="_pathFinder_meta.job"
        :date="_pathFinder_meta.date"
        :history="_pathFinder_meta.history"
        :handle="_pathFinder_meta.handle"
        :coins="_pathFinder_meta.coins"
        :targets="_pathFinder_meta.targets"
        :targetIndexes="_pathFinder_meta.targetIndexes"
        :icons="_pathFinder_meta.icons"
        :iconfarming="_pathFinder_meta.iconfarming"
        v-model:visible="_pathFinder_meta.visible"
        @callFinder="f_call_itemFinder($event.account, $event.job, $event.index)"
        @refresh="f_call_pathFinder(_pathFinder_meta.account, _pathFinder_meta.job)"
      />
      <ItemFinder
        :account="_itemFinder_meta.account"
        :job="_itemFinder_meta.job"
        :handle="_itemFinder_meta.handle"
        :targetIndex="_itemFinder_meta.targetIndex"
        :target="_itemFinder_meta.target"
        v-model:visible="_itemFinder_meta.visible"
      />
    </div>
  </div>
</template>

<script setup>
import targets from './generator/targets.json'
import { version, mobs, items } from './generator/data.json'
const item_names = Object.entries(items).reduce((p, c) => (p[c[1].name] = { id: c[0], ...c[1] }, p), {})
const s_database = useState('database', () => reactive({ version, mobs, items, item_names }))

const s_lang = useState('language', () => ref('ko'))

const s_userdata = useState('userdata', () => reactive(JSON.parse(localStorage.getItem('userdata')) || {}))
const f_update_userdata = data => {
  Object.assign(s_userdata.value, data || JSON.parse(localStorage.getItem('userdata')) || {})
  localStorage.setItem('userdata', JSON.stringify(s_userdata.value))
}
provide('app:f_update_userdata', f_update_userdata)

const f_update_usertdata_target = (account, job, targetIndex, target) => {
  s_userdata.value[account][job].targets[targetIndex] = target
  f_update_userdata(s_userdata.value)
}
provide('app:f_update_usertdata_target', f_update_usertdata_target)

const f_update_usertdata_targetIndexes = (account, job, targetIndexes) => {
  s_userdata.value[account][job].targetIndexes = targetIndexes
  f_update_userdata(s_userdata.value)
}
provide('app:f_update_usertdata_targetIndexes', f_update_usertdata_targetIndexes)

const f_update_usertdata_icons = (account, job, icons) => {
  s_userdata.value[account][job].icons = icons
  f_update_userdata(s_userdata.value)
}
provide('app:f_update_usertdata_icons', f_update_usertdata_icons)

const f_update_usertdata_iconfarming = (account, job, boolean) => {
  s_userdata.value[account][job].iconfarming = boolean
  f_update_userdata(s_userdata.value)
}
provide('app:f_update_usertdata_iconfarming', f_update_usertdata_iconfarming)

const s_selected_account = useState('selected_account', () => ref((localStorage.getItem('selected_account') || '').replace(/\"/g, '')))
const s_selected_job = useState('selected_job', () => ref((localStorage.getItem('selected_job') || '').replace(/\"/g, '')))

const f_update_select = (account, job) => {
  s_selected_account.value = account
  localStorage.setItem('selected_account', JSON.stringify(account))
  s_selected_job.value = job
  localStorage.setItem('selected_job', JSON.stringify(job))
}
provide('app:f_update_select', f_update_select)

const f_savefile_parser = txt => {
  const [n1, n2, n3, acccountstring, versionstring, vv, jobstring, l, ...itemsstring ] = txt.split('\n')

  const account = acccountstring.match(/(?<="아이디: )(.*)(?=")/)[0]
  const version = versionstring.match(s_lang.value == 'en' ? /(?<="Played Version: )(.*)(?=")/ : /(?<="플레이 버전: )(.*)(?=")/)[0]
  const job = jobstring.match(s_lang.value == 'en' ? /(?<="Class: )(.*)(?=")/ : /(?<="직업: )(.*)(?=")/)[0]
  const items = itemsstring.map(e => e.match(/(?<="[0-9]*\.\s)(.*)(?=")/)?.[0]).filter(e => e).map(e => item_names[e]?.id).filter(e => e)
  const coins = itemsstring.map(e => e.match(/(?<="[0-9]*\.\s)(.*)(?=")/)?.[0]).filter(e => e).map(e => ({ ...item_names[e.replace(/ x.*/g, '')], count: parseInt(e.match(/ x.*/g)?.[0]?.replace(' x', '') || 1) })).filter(e => e.type == '재화').map(e => ({ id: e.id, count: e.count }))

  const res = {}
  res[account] = { ...(s_userdata.value[account] || {}) }
  res[account][job] = {
    date: s_userdata.value?.[account]?.[job]?.date || new Date().getTime(),
    version,
    items,
    coins,
    targets: (s_userdata.value?.[account]?.[job]?.targets || Object.entries(targets[s_selected_job.value] || {}).map(([name, d]) => ({ name, items: d.items.map(e => s_database.value.item_names[e].id), tags: d.tags }))),
    targetIndexes: s_userdata.value?.[account]?.[job]?.targetIndexes || [0],
    iconfarming: s_userdata.value?.[account]?.[job]?.iconfarming || false,
    icons: s_userdata.value?.[account]?.[job]?.icons || [],
    added: (s_userdata.value?.[account]?.[job]?.added || []),
    removed: (s_userdata.value?.[account]?.[job]?.removed || []),
    history: (s_userdata.value?.[account]?.[job]?.history || [])
  }

  if (s_userdata.value?.[account]?.[job]) {
    const added = [ ...items ]
    s_userdata.value[account][job].items.forEach(e => {
      const index = added.indexOf(e)
      if (index >= 0) {
        added.splice(index, 1)
      }
    })

    const removed = [ ...s_userdata.value[account][job].items ]
    items.forEach(e => {
      const index = removed.indexOf(e)
      if (index >= 0) {
        removed.splice(index, 1)
      }
    })

    if (added.length || removed.length) {
      const now = new Date().getTime()
      res[account][job].date = now
      res[account][job].added = added
      res[account][job].removed = removed

      res[account][job].history.push({
        date: now,
        added,
        removed
      })
    }
  }

  f_update_select(account, job)
  f_update_userdata(res)

  if (_itemFinder_meta.visible) f_call_itemFinder(account, job, _itemFinder_meta.targetIndex)
  if (_pathFinder_meta.visible) f_call_pathFinder(account, job)
}

ipcRenderer.on('savefile', v => f_savefile_parser(v))


const c_accounts = computed(() => {
  return Object.keys(s_userdata.value)
})
const c_jobs = computed(() => {
  return Object.keys(s_userdata.value?.[s_selected_account.value] || {})
})
const c_data = computed(() => {
  return {
    account: s_selected_account.value,
    job: s_selected_job.value,
    ...s_userdata.value?.[s_selected_account.value]?.[s_selected_job.value]
  }
})
const f_data = (account, job) => ({ account, job, ...(s_userdata.value?.[account]?.[job] || {}) })
const f_targets = (account, job) => (s_userdata.value?.[account]?.[job]?.targets || [])
const f_targetIndexes = (account, job) => (s_userdata.value?.[account]?.[job]?.targetIndexes || [])
const f_icons = (account, job) => (s_userdata.value?.[account]?.[job]?.icons || [])
const f_target = (account, job, targetIndex) => (s_userdata.value?.[account]?.[job]?.targets || [])[targetIndex] || {}



const _itemFinder_meta = reactive({
  visible: false,
  account: '',
  job: '',
  handle: [],
  targetIndex: 0,
  target: {}
})
const f_call_itemFinder = (account, job, targetIndex = 0) => {
  _itemFinder_meta.account = account
  _itemFinder_meta.job = job
  _itemFinder_meta.handle = f_data(account, job)?.items || []
  _itemFinder_meta.targetIndex = targetIndex
  _itemFinder_meta.target = f_target(account, job, targetIndex) || {}
  _itemFinder_meta.visible = true
}

const _pathFinder_meta = reactive({
  visible: false,
  account: '',
  job: '',
  date: 0,
  history: [],
  handle: [],
  coins: [],
  targetIndexes: [],
  icons: [],
  iconfarming: false
})
const f_call_pathFinder = (account, job) => {
  _pathFinder_meta.account = account
  _pathFinder_meta.job = job
  _pathFinder_meta.date = f_data(account, job)?.date
  _pathFinder_meta.history = f_data(account, job)?.history || []
  _pathFinder_meta.handle = f_data(account, job)?.items || []
  _pathFinder_meta.coins = f_data(account, job)?.coins || []
  _pathFinder_meta.targets = f_targets(account, job) || []
  _pathFinder_meta.targetIndexes = f_targetIndexes(account, job)
  _pathFinder_meta.icons = f_icons(account, job)
  _pathFinder_meta.iconfarming = f_data(account, job)?.iconfarming || false
  _pathFinder_meta.visible = true
}
</script>


<style lang="scss">
body {
  margin: 0;
}
::-webkit-scrollbar {
    width: 8px;  
}
::-webkit-scrollbar-thumb {
    background: rgba(26, 27, 30);
    border-radius: 10px;
}
::-webkit-scrollbar-track {
    background: rgb(43, 45, 49);
    border-radius: 10px;
}
</style>

<style lang="scss" scoped>
.app {
  position: fixed;
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: rgb(50, 51, 56);
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  .titlebar {
    flex-shrink: 0;
    background: rgb(30, 31, 34);
    height: 40px;
    width: 100%;
    -webkit-user-select: none;
    -webkit-app-region: drag;
    z-index: 99999;
  }
  .content {
    width: calc(100% - 4px);
    height: calc(100% - 55px);
    top: 5px;
    overflow: auto;
    position: relative;
    border-radius: 10px;
    overflow-y: scroll;
    box-sizing: border-box;
    padding: 10px;
  }
}
</style>
