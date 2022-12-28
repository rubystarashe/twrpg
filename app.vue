<template>
<div class="area" v-if="itemLoaded" 
  @dragleave="dragging = false"
  @dragover="dragover"
  @drop="filedropped">
  <div class="droprate">
    <div class="search">
      <div>{{t.UI.version}}: 0.62k</div>
      <input @input="e => dropsearch = e.target.value">
    </div>
    <div class="items">
      <div class="item"
        v-for="({ rate, wish, alt }, key) in droptable"
        :key="key"
        v-show="dropsearch.length ? itemlist[key].indexOf(dropsearch) >= 0 : true"
        @click="target[key] ? delete target[key] : target[key] = true"
        @mouseover="hover = key" @mouseleave="hover = null"
      >
        <div>{{itemlist[key]}}</div>
        <div>{{rate}}%</div>
        <div v-if="wish">{{t.wish}} {{wish}}%</div>
        <div v-if="alt">
          <div class="subitem" v-for="({ rate: altrate, wish }, i) in alt" v-show="altrate != rate && (!i || (i && altrate != alt[i - 1].rate))">
            <div>{{altrate}}%</div>
            <div v-if="wish">{{t.wish}} {{wish}}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="savefile">
    <div>
      <h2>{{t.UI.preset}}</h2>
      <div class="items">
        <div class="item" :class="{ selected: p == preset }" v-for="(d, p) in presets" @click="preset = p">{{p == 'default' ? t.UI.defaultPreset : p}}</div>
      </div>
      <div>
        <h3>{{t.UI.presetManagement}}</h3>
        <button @click="savepreset">{{t.UI.exportPreset}}</button>
        <input ref="loadpresetbutton" type="file" @change="loadpreset" accept=".txt" :style="{ display: 'none' }">
        <button @click="loadpresetbutton.click()">{{t.UI.loadPreset}}</button>
        <button @click="deletepreset" :style="{ 'margin-left': '100px' }">{{t.UI.deletePreset}}</button>
      </div>
      <div>
        <h3>{{t.UI.addPreset}}</h3>
        <input @input="e => presetnameinput = e.target.value" :value="presetnameinput">
        <button @click="addpreset">{{t.UI.addPresetButton}}</button>
      </div>
    </div>
    <div>
      <h2>{{t.UI.selectSave}}</h2>
      <input type="file" @change="filechanged" accept=".txt">
      <button @click="resetsave">{{t.UI.resetSave}}</button>
      <div>{{t.UI.saveVersion}}: {{targetsave.version}}</div>
      <div>{{targetsave.date}}</div>
      <div>{{t.UI.saveJob}}: {{targetsave.job}}</div>
      <h3>{{t.UI.haveItems}}</h3>
      <div class="items" v-if="targetsave.items">
        <div class="item" v-for="item in targetsave.items" @mouseover="hover = item" @mouseleave="hover = null">
          <div :class="{ ready: checkisneed(item) }">{{itemlist[item]}}</div>
        </div>
      </div>
    </div>
    <div>
      <h2>{{t.UI.targetItemSelecter}}</h2>
      <div>{{t.UI.searchItem}}</div>
      <input @input="e => targetsearch = e.target.value">
      <div class="items">
        <div v-if="!targetsearch.length">{{t.UI.searchItemNull}}</div>
        <div class="item" v-for="(item, key) in itemlist" v-show="(recipies[key] || key == itemnamelist[item]) && targetsearch.length && searchitem(targetsearch, item, key)"
          @click="target[key] ? delete target[key] : target[key] = true"
          @mouseover="hover = key" @mouseleave="hover = null"
        >{{item}}</div>
      </div>
    </div>
    <div>
      <h3>{{t.UI.selectedTargetItems}}:</h3>
      <div class="items">
        <div v-if="!Object.keys(target).length">{{t.UI.selectedTargetItemsNull}}</div>
        <div class="item" v-for="(d, key) in target" @click="delete target[key]" @mouseover="hover = key" @mouseleave="hover = null">
          {{itemlist[key]}}
        </div>
      </div>
    </div>
    <div>
      <h3>{{t.UI.neededItems}}</h3>
      <div class="items">
        <!--div v-for="(c, item) in requiremats">{{itemlist[item]}} {{c}}개</div-->
        <div class="item" v-for="(items, key) in itemgroup" v-show="Object.keys(requiremats).find(e => items.find(i => i == e))">
          <div class="name">{{itemgroupname[key]}}</div>
          <div class="mats">
            <div class="mat" v-for="item in Object.keys(requiremats).filter(e => items.find(i => i == e))"
              @mouseover="hover = item" @mouseleave="hover = null"
            >{{itemlist[item]}}<div class="count">{{requiremats[item]}}개</div></div>
          </div>
        </div>
      </div>
      <h3>{{t.UI.recipeMap}}</h3>
      <div class="items">
        <div class="item" v-for="(d, key) in target">
          <div class="name" :class="{ ready: (targetsave.items || []).find(e => e == key) }" @mouseover="hover = key" @mouseleave="hover = null">{{itemlist[key]}}</div>
          <Recipie v-if="recipies[key]" :t="t" :itemlist="itemlist" :recipies="recipies" :droptable="droptable" :targetsave="targetsave || {}" :target="key" @hover="v => hover = v"/>
        </div>
      </div>
    </div>
  </div>
  <div class="replayfile">
    <div class="search">
      <div>{{t.UI.replayFile}}</div>
      <input type="file" @change="filechanged" accept=".w3g" multiple>
      <div>{{t.UI.replayUserSearch}}: <input @input="e => savesearch_nick = e.target.value"></div>
      <div>{{t.UI.replayItemSearch}}: <input @input="e => savesearch_item = e.target.value"></div>
    </div>
    <div class="replayresults">
      <div class="result" v-for="({ log, map, date }, name) in result"
        v-show="(savesearch_nick.length ? log.find(({ player }) => player?.indexOf(savesearch_nick) >= 0) ? true : false : true) && (savesearch_item.length ? log.find(({ item }) => item?.indexOf(savesearch_item) >= 0) ? true : false : true)"
      >
        <div>{{t.UI.saveVersion}}: {{map.version}}</div>
        <div>{{t.UI.replayDate}}: {{date}}</div>
        <div>{{t.UI.replayFilename}}: {{name}}</div>
        <div class="log" v-for="{ player, mins, seconds, item, type } in log" v-show="(savesearch_nick.length ? player?.indexOf(savesearch_nick) >= 0 ? true : false : true) && (savesearch_item.length ? item?.indexOf(savesearch_item) >= 0 ? true : false : true)">
          <div v-if="type == 'get'">
            <span>{{player}}</span>{{t.UI.replayWho}} <span>{{mins}}{{t.UI.replayMin}} {{seconds}}{{t.UI.replaySec}}</span>{{t.UI.replayAt}} <span>{{item}}</span> {{t.UI.replayGet}}
          </div>
          <div v-else-if="type == 'craft'">
            <span>{{player}}</span>{{t.UI.replayWho}} <span>{{mins}}{{t.UI.replayMin}} {{seconds}}{{t.UI.replaySec}}</span>{{t.UI.replayAt}} {{t.UI.replayMade}}
          </div>
        </div>
      </div>
    </div>
  </div>
  <Description :t="t" :itemlist="itemlist" :descriptions="itemdescriptions" :recipies="recipies" :hover="hover" :itemgroup="itemgroup" :itemgroupname="itemgroupname" :droptable="droptable"/>
  <div class="dragging" v-if="dragging">Dragging</div>
</div>
</template>

<script setup>
const route = useRoute()
const lang = ref('ko')
if (route.path == '/en') lang.value = 'en'

const version = '0.62k'
const translations = {
  'ko': {
    stringfile: '/twrpg/war3map_0.62k.w3t',
    wish: '소원시',
    swapable: '교차가능',
    upward: '상위 아이템',
    count: '개',
    preset: {
      date: '프리셋 날짜: ',
      savedate: '세이브 날짜: ',
      version: '세이브 버전: ',
      job: '세이브 직업: ',
      has: '가진 아이템:\n',
      target: '목표 아이템:\n'
    },
    UI: {
      preset: '프리셋을 선택해 주세요',
      defaultPreset: '기본 프리셋',
      presetManagement: '선택된 프리셋 관리',
      exportPreset: '추출하기',
      loadPreset: '불러오기',
      deletePreset: '삭제하기',
      addPreset: '새 프리셋 추가',
      addPresetButton: '추가',
      selectSave: '파밍 루트를 계산할 세이브를 선택해 주세요',
      resetSave: '세이브 초기화',
      saveVersion: '버전',
      saveJob: '직업',
      haveItems: '가진 아이템',
      targetItemSelecter: '목표 파밍 아이템을 선택해 주세요',
      searchItem: '아이템 검색',
      searchItemNull: '검색된 아이템 없음',
      selectedTargetItems: '현재 선택된 목표 아이템',
      selectedTargetItemsNull: '목표 아이템 없음',
      neededItems: '파밍이 필요한 아이템',
      recipeMap: '조합법 지도',
      version: '드랍 확률 목록 버전',
      replayFile: '리플레이 파일 분석',
      replayUserSearch: '유저이름',
      replayItemSearch: '아이템',
      replayDate: '날짜',
      replayFilename: '파일명',
      replayWho: '가',
      replayMin: '분',
      replaySec: '초',
      replayAt: '에',
      replayGet: '획득함',
      replayMade: '아이템 조합함'
    },
    mobs: {
      'I0Q3': '자이언트 터틀',
      'ciri': '킹크랩',
      'I0DT': '바다코끼리',
      'ssil': '매머드',
      'I0DV': '킹콩',
      'I0BT': '피의 망령',
      'I0BT': '박쥐 괴인',
      'I046': '다크나이트',
      'nspi': '라그나스',
      'blba': '이블 라바',
      'gvsm': '촉수 지배자',
      'I0OV': '바다의 수호자',
      'dtsb': '자이언트 골렘',
      'wcyc': '매드클라운',
      'envl': '마나 에인션트',
      'oven': '하이드라',
      'shen': '왈라키아 백작',
      'drph': '잭 오 랜턴',
      'lnrn': '마법사 왕',
      'oli2': '데드렉트',
      'amrc': '문지기',
      'tmmt': '능천사',
      'mnsf': '타천사',
      'olig': '서리한의 혼',
      'stre': '거미 여왕 일셰나',
      'tst2': '서리거미 제왕',
      'wswd': '마왕 베리엘',
      'ccmd': '스피릿 비스트',
      'rugt': '커럽터 렉터스',
      'shdt': '플레임 나이트메어',
      'wshs': '터틀 로드',
      'rre1': '본 드래곤',
      'fgrg': '해골왕 데스페리아',
      'pomn': '좀비 로드',
      'pres': '에인션트 엔트',
      'sneg': '주천사 사미엘',
      'shar': '암흑룡 이르베르트',
      'infs': '데스 핀드',
      'I0P0': '뇌신 발토라',
      'I0P1': '화신 이프리트',
      'I0P2': '해신 네레이드',
      'I0P3': '지하군주 아가레스',
      'I0R6': '공작 라자루스',
      'I0R7': '지신 가이아'
    }
  },
  'en': {
    stringfile: '/twrpg/war3map_0.62k_en.w3t',
    wish: 'wish',
    swapable: 'Alternative',
    upward: 'Next Tier',
    count: 'pcs',
    preset: {
      date: 'Preset Date: ',
      savedate: 'Save Date: ',
      version: 'Save Version: ',
      job: 'Save Job: ',
      has: 'Holding Items:\n',
      target: 'Target Items:\n'
    },
    UI: {
      preset: 'Please select a preset',
      defaultPreset: 'Default Preset',
      presetManagement: 'Manage Selected Presets',
      exportPreset: 'Export',
      loadPreset: 'Load',
      deletePreset: 'Delete',
      addPreset: 'Add New Preset',
      addPresetButton: 'Add',
      selectSave: 'Please select the save to calculate the farming route',
      resetSave: 'Reset Loaded Save Data',
      saveVersion: 'Version',
      saveJob: 'Job',
      haveItems: 'Holding',
      targetItemSelecter: 'Please select a target farming item',
      searchItem: 'Search Item',
      searchItemNull: 'No items detected',
      selectedTargetItems: 'The currently selected target items',
      selectedTargetItemsNull: 'No target items',
      neededItems: 'Items that require farming',
      recipeMap: 'Recipe Map',
      version: 'Version',
      replayFile: 'Replay File Viewer',
      replayUserSearch: 'User',
      replayItemSearch: 'Item',
      replayDate: 'Date',
      replayFilename: 'FileName',
      replayWho: '',
      replayMin: 'm',
      replaySec: 's',
      replayAt: '',
      replayGet: '',
      replayMade: 'created'
    },
    mobs: {
      'I0Q3': 'Dragon Turtle',
      'ciri': 'King Crab',
      'I0DT': 'Walrus',
      'ssil': 'Mammoth',
      'I0DV': 'King Kong',
      'I0BT': 'Blood Wraith',
      'I0BT': 'Wallachia Monstrosity',
      'I046': 'Wallachia Death Knight Lord',
      'nspi': 'Ruler of Flames Ragnaar',
      'blba': 'Evil Lava Spawn',
      'gvsm': 'Tentacle Lord',
      'I0OV': 'Guardian of Sea',
      'dtsb': 'Giant Golem',
      'wcyc': 'Mad Clown',
      'envl': 'Mana Ancient',
      'oven': 'Ruler of The Lav Sea (Hydra)',
      'shen': 'Count of Wallachia',
      'drph': 'Jack-O-Lantern',
      'lnrn': 'Mage Lord',
      'oli2': 'Wigns of Death (Dragon)',
      'amrc': 'Castle Avalon Gatekeeper',
      'tmmt': `The 3rd Army's Guardian Angel`,
      'mnsf': `The Devil's Right Arm Corrupt Angel`,
      'olig': 'Soul of Everfrost',
      'stre': 'Frostspider Queen',
      'tst2': 'Frostspider Lord',
      'wswd': 'Demon Lord Beriel',
      'ccmd': 'Spirit Beast',
      'rugt': 'Corruptor Rectus',
      'shdt': 'Flame Nightmare',
      'wshs': 'Turtle Lord',
      'rre1': 'Bone Dragon',
      'fgrg': 'Skeletal King Desperia',
      'pomn': 'Zombie Lord',
      'pres': 'Ancient Ent',
      'sneg': 'Archangel Samael',
      'shar': 'Shadow Dragon Irbert',
      'infs': 'Death Fiend',
      'I0P0': 'Valtora',
      'I0P1': 'Ifrit',
      'I0P2': 'Nereid',
      'I0P3': 'Underlord Agareth',
      'I0R6': 'Duke Lazarus',
      'I0R7': 'Gaia'
    }
  },
}
const t = computed(() => {
  return translations[lang.value]
})

import axios from 'axios'
import { Translator } from '@voces/wc3maptranslator'
import { Buffer } from 'buffer'
import ReplayParser from 'w3gjs/dist/lib/parsers/ReplayParser'

const { preset, presets, targets, targetsaves } = store('usersetting').toRefs()

watch(preset, v => {
  if (!targets.value[preset.value]) targets.value[preset.value] = {}
  if (!targetsaves.value[preset.value]) targetsaves.value[preset.value] = {}
}, {
  immediate: true
})

const target = computed({
  get: () => targets.value[preset.value] || {},
  set: v => targets.value[preset.value] = v
})
const targetsave = computed({
  get: () => targetsaves.value[preset.value] || {},
  set: v => targetsaves.value[preset.value] = v
})

const itemLoaded = ref(false)
const itemlist = ref({})
const itemdescriptions = ref({})
const itemsearchstrings = ref({})
const presetnameinput = ref('')
const loadpresetbutton = ref()
const addpreset = () => {
  const presetname = presetnameinput.value
  if (presetname && !presets.value[presetname]) {
    presets.value[presetname] = {
      created: new Date().toLocaleString()
    }
    preset.value = presetname
  }
  presetnameinput.value = ''
}
const deletepreset = () => {
  const presetname = preset.value
  switch (presetname) {
    case 'default':
      return
    default:
      preset.value = 'default'
      delete presets.value[presetname]
      delete targets.value[presetname]
      delete targetsaves.value[presetname]
  }
}
const savepreset = () => {
  const h = targetsave.value.items?.map(e => itemlist.value[e]) || []
  const tt = Object.keys(target.value).map(e => itemlist.value[e])
  let res = t.value.preset.date + new Date().toLocaleString() + '\n'
  if (targetsave.value.date) res += t.value.preset.savedate + targetsave.value.date + '\n'
  if (targetsave.value.version) res += t.value.preset.version + targetsave.value.version + '\n'
  if (targetsave.value.job) res += t.value.preset.job + targetsave.value.job + '\n'
  if (h.length) {
    res += t.value.preset.has
    h.forEach(e => res += e + '\n')
  }
  if (tt.length) {
    res += t.value.preset.target
    tt.forEach(e => res += e + '\n')
  }
  const blob = new Blob([res], { type: 'text/plain' })
  const temp = document.createElement('a')
  // temp.setAttribute('download', encodeURIComponent(preset.value) + '.txt')
  temp.setAttribute('download', preset.value + '.txt')
  const link = window.URL.createObjectURL(blob)
  temp.setAttribute('href', link)
  temp.click()
  window.URL.revokeObjectURL(link)
  temp.remove()
}
const loadpreset = e => {
  const fr = new FileReader()
  fr.onload = () => {
    if (!targets.value[preset.value]) targets.value[preset.value] = {}
    if (!targetsaves.value[preset.value]) targetsaves.value[preset.value] = {}

    const h = fr.result.split(t.value.preset.target)[0]?.split(t.value.preset.has)[1]?.split('\n')?.filter(e => e)
    const tt = fr.result.split(t.value.preset.target)[1]?.split('\n')?.filter(e => e)
    fr.result.split('\n').forEach(e => {
      if (e.startsWith(t.value.preset.savedate)) {
        targetsave.value.date = e.split(t.value.preset.savedate)[1]
      }
      if (e.startsWith(t.value.preset.version)) {
        targetsave.value.version = e.split(t.value.preset.version)[1]
      }
      if (e.startsWith(t.value.preset.job)) {
        targetsave.value.job = e.split(t.value.preset.job)[1]
      }
    })
    if (h) targetsave.value.items = h.map(e => itemnamelist.value[e]).filter(e => e)
    target.value = {}
    if (tt) tt.forEach(e => {
      if (itemnamelist.value[e]) {
        target.value[itemnamelist.value[e]] = true
      }
    })
  }
  fr.readAsText(e.target.files[0])
  e.target.value = ''
}
const resetsave = () => {
  if (!targets.value[preset.value]) targets.value[preset.value] = {}
  if (!targetsaves.value[preset.value]) targetsaves.value[preset.value] = {}
  targetsave.value = {}
}

const searchitem = (string, item, id) => {
  if (item.toLowerCase().indexOf(string.toLowerCase()) >= 0) return true
  return itemsearchstrings.value[id]?.indexOf(string) >= 0
}
const itemnamelist = computed(() => {
  const obj = {}
  Object.keys(itemlist.value).forEach(id => {
    obj[itemlist.value[id]] = id
  })
  return obj
})
const droptable = ref({})
const recipies = ref({})
const itemgroup = ref({})

const itemgroupname = translations[lang.value].mobs
// const itemgroupname = {
//   'I0Q3': '자이언트 터틀',
//   'ciri': '킹크랩',
//   'I0DT': '바다코끼리',
//   'ssil': '매머드',
//   'I0DV': '킹콩',
//   'I0BT': '피의 망령',
//   'I0BT': '박쥐 괴인',
//   'I046': '다크나이트',
//   'nspi': '라그나스',
//   'blba': '이블 라바',
//   'gvsm': '촉수 지배자',
//   'I0OV': '바다의 수호자',
//   'dtsb': '자이언트 골렘',
//   'wcyc': '매드클라운',
//   'envl': '마나 에인션트',
//   'oven': '하이드라',
//   'shen': '왈라키아 백작',
//   'drph': '잭 오 랜턴',
//   'lnrn': '마법사 왕',
//   'oli2': '데드렉트',
//   'amrc': '문지기',
//   'tmmt': '능천사',
//   'mnsf': '타천사',
//   'olig': '서리한의 혼',
//   'stre': '거미 여왕 일셰나',
//   'tst2': '서리거미 제왕',
//   'wswd': '마왕 베리엘',
//   'ccmd': '스피릿 비스트',
//   'rugt': '커럽터 렉터스',
//   'shdt': '플레임 나이트메어',
//   'wshs': '터틀 로드',
//   'rre1': '본 드래곤',
//   'fgrg': '해골왕 데스페리아',
//   'pomn': '좀비 로드',
//   'pres': '에인션트 엔트',
//   'sneg': '주천사 사미엘',
//   'shar': '암흑룡 이르베르트',
//   'infs': '데스 핀드',
//   'I0P0': '뇌신 발토라',
//   'I0P1': '화신 이프리트',
//   'I0P2': '해신 네레이드',
//   'I0P3': '지하군주 아가레스',
//   'I0R6': '공작 라자루스',
//   'I0R7': '지신 가이아'
// }

const dragging = ref(false)
const hover = ref(null)

const dropsearch = ref('')
const savesearch_nick = ref('')
const savesearch_item = ref('')
const targetsearch = ref('')

const requiremats = computed(() => {
  const res = {}
  const targetitems = Object.keys(recipies.value).filter(e => target.value[e])
  const saved = [ ...targetsave?.value?.items || [] ]

  const check = (item, count) => {
    // if (item == 'phea') console.log(saved?.filter(e => e == item).length, count)
    if (saved?.filter(e => e == item).length >= count) {
      for (let i = 0; i < count; i++) saved?.splice(saved?.findIndex(e => e == item), 1)
      return
    }
    if (recipies.value[item]) {
      recipies.value[item].forEach(e => {
        check(e.item, e.count)
      })
    }
    else if (droptable.value[item]) {
      if (!res[item]) res[item] = count
      else res[item] += count
    }
  }
  targetitems.forEach(e => {
    recipies.value[e].forEach(e => {
      check(e.item, e.count || 1)
    })
  })
  return res
})

const result = ref({})

const file2Buffer = file => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    const readFile = function(event) {
      const buffer = reader.result
      resolve(Buffer.from(buffer))
    }
    reader.addEventListener('load', readFile)
    reader.readAsArrayBuffer(file)
  })
}

onMounted(async () => {
  const { data: itemdata } = await axios.get(t.value.stringfile, { responseType: 'blob' })
  const translator = new Translator()
  const { json } = translator.Objects.warToJson('string', Buffer.from(await itemdata.arrayBuffer()))
  const items = Object.assign(json.original, json.custom)
  const descriptions = {}
  const searchstrings = {}
  const itemlistdata = {}
  Object.keys(items).forEach(id => {
    const item = items[id].find(e => e.id == 'unam').value.replace(/\|[A-z0-9]{9}/, '').replace(/\|r/g, '').replace(/[^ㄱ-ㅎ가-힣A-z\s]/g, '')
    const description = items[id].find(e => e.id == 'utub')?.value?.replace(/\|c[A-z0-9]{8}/g, '').replace(/\|r/g, '').replace('∴클릭 시 관련 조합법을 확인', '').replace('∴Click to check any related recipes', '').replace(/\n/g, '<br/>')
    const searchstring = description?.split('<br/>')?.find(e => e?.indexOf('-') >= 0)
    const key = id.replace(/:[A-z0-9]*/, '')
    if (searchstring) searchstrings[key] = searchstring
    if (item) {
      itemlistdata[key] = item
      descriptions[key] = description
    }
  })
  itemlist.value = itemlistdata
  itemdescriptions.value = descriptions
  itemsearchstrings.value = searchstrings
  itemLoaded.value = true

  let { data: dropdata } = await axios.get('/twrpg/war3map_0.62k.j')
  dropdata = dropdata.split(/\n|\r/).slice(41000, 45000).join('\n')
  dropdata.match(/(?<=call (ggo|gjo))((.*)(?=))/g).map(e => {
    const [ prefix, idstring, ratestring ] = e.split(',')
    const id = idstring.match(/(?<=')(.*)(?=')/)[0]
    const ratemethod = ratestring.match(/(\()(.*)(?=\))/)[0]
    if (ratemethod.indexOf('d') >= 0) return null
    if (!itemlist.value[id]) return null
    const rate = new Function(`
      return ${ratemethod}
    `)()
    return {
      id,
      rate
    }
  }).filter(e => e).forEach(e => {
    if (droptable.value[e.id]) {
      if (!droptable.value[e.id].alt) droptable.value[e.id].alt = []
      droptable.value[e.id].alt.push({
        rate: e.rate
      })
    } else droptable.value[e.id] = {
      rate: e.rate
    }
  })
  dropdata.match(/(?<=call Gso)(.*)(?=\))/g).map(e => {
    const [ idstring, ...materialstring ] = e.split(`,'`)
    const id = idstring.match(/(?<=')(.*)(?=')/)[0]
    const materials = materialstring.map(e => {
      const [ item, count ] = e.split(',')
      return { item: item.replace(/'/g, ''), count: parseInt(count.replace(/\(|\)/g, ''))}
    })
    return { id, materials }
  }).forEach(e => {
    if (recipies.value[e.id]) {
      e.materials.forEach(m => {
        const index = recipies.value[e.id].findIndex(r => r.item == m.item)
        if (index >= 0) {
          if (!recipies.value[e.id][index].multi) recipies.value[e.id][index].multi = 0
          recipies.value[e.id][index].multi++
        }
        else recipies.value[e.id].push(m)
      })
    } else recipies.value[e.id] = e.materials
  })

  dropdata.match(/(?<=set mY\[xz\]=)((.|\r|\n)*?)call gQo/g).map(e => {
    const arr = e.split('\n')
    const rate = arr[0]
    const items = arr.map(e => e.match(/(?<=call (ggo)\(xz,\(')(.*?)(?=')/)).filter(e => e).map(e => e[0])
    return {
      rate,
      items
    }
  }).forEach(e => {
    e.items.forEach(i => {
      if (!droptable.value[i]) return
      if (!droptable.value[i].wish) {
        droptable.value[i].wish = droptable.value[i].rate
        droptable.value[i].rate = droptable.value[i].rate * e.rate
        droptable.value[i].rate = parseFloat(droptable.value[i].rate.toFixed(3))
      } else {
        const index = droptable.value[i].alt.findIndex(e => !e.wish)
        droptable.value[i].alt[index].wish = droptable.value[i].alt[index].rate
        droptable.value[i].alt[index].rate = droptable.value[i].alt[index].rate * e.rate
        droptable.value[i].alt[index].rate = parseFloat(droptable.value[i].alt[index].rate.toFixed(3))
      }
    })
  })

  dropdata.match(/(?<=call ggo)((.|\r|\n)*?)(?=call gto|call gpo|call gQo)/g).map(e => {
    const arr = e.split('\n').filter(e => e)
    const items = arr.map(e => e.match(/(?<=xz,\(')(.*?)(?=')/)).filter(e => e).map(e => e[0])
    itemgroup.value[items[items.length - 1]] = items
  })
})

const dragover = async e => {
  e.preventDefault()
  dragging.value = true
}

const filedropped = async e => {
  e.preventDefault()
  e.target.files = e.dataTransfer.files
  dragging.value = false
  parse(e)
}
const filechanged = async e => {
  parse(e)
}

const checkisneed = item => {
  const list = {}

  const ready = {}
  targetsave.value.items?.forEach(e => {
    if (!ready[e]) ready[e] = 0
    ready[e]++
  })

  const targets = Object.keys(target.value).map(e => recipies.value[e])
  targets.forEach(e => {
    if (e) e.forEach(e => {
      if (ready[e.item]) return list[e.item] = itemlist.value[e.item]
      
      const check = e => {
        if (recipies.value[e.item]) {
          recipies.value[e.item].forEach(e => {
            if (ready[e.item]) return list[e.item] = itemlist.value[e.item]
            check(e)
          })
        }
      }
      check(e)
    })
  })
  return list[item]
}

const parse = async e => {
  try {
    const getfile = async file => {
      const parser = new ReplayParser()
      let logs = []
      let time = 0
      parser.on('gamedatablock', block => {
        if (block.timeIncrement) time += block.timeIncrement
        if (block.id == 31) {
          if (block.commandBlocks?.length) {
            const filteredBlocks = block.commandBlocks.filter(e => e.actions.find(e => e.id == 16 && e.abilityFlags == 64))
            if (filteredBlocks.length) {
              filteredBlocks.forEach(fb => {
                const player = fb.playerId
                const targetblock = fb.actions.find(e => e.id == 16 && e.abilityFlags == 64)
                const mins = Math.floor(time / 1000 / 60)
                const seconds = Math.floor((time - (mins * 60 * 1000)) / 1000)
                const [i0, i1, i2, i3] = targetblock.itemId
                const itemId = String.fromCharCode(i3, i2, i1, i0)
                let item = itemlist.value[itemId]
                if (!item) return
                if (item.startsWith('티켓')) return
                switch (item) {
                  case '':
                  case '보스 재소환':
                  case '전리품 포기':
                  case '아이템 받기':
                  case '귀환 위치 지정':
                  case '거미 동굴 원정대 참여':
                  case '성도 아발론':
                  case '기억석 파괴':
                  case '성수 교환':
                  case '숙박':
                  case '소원':
                  case '하드 모드':
                  case '슈퍼 리버스':
                    return
                  case '조합':
                    return logs.push({
                      player,
                      mins,
                      seconds,
                      type: 'craft'
                    })
                  default:
                    return logs.push({
                      player,
                      mins,
                      seconds,
                      type: 'get',
                      item
                    })
                }
              })
            }
          }
        }
      })
      const name = file.name
      const data = await parser.parse(await file2Buffer(file))
      const { metadata: { playerRecords, map }} = data

      const mapname = map.mapName.replace(/^.*[\\]/, '')
      const version = mapname.replace('twrpgv', '').replace('.w3x', '')
      
      result.value[name] = {
        date: new Date(file.lastModified).toLocaleString(),
        map: {
          mapcheck: map.mapChecksumSha1,
          mapname: map.mapName.replace(/^.*[\\]/, ''),
          version
        },
        log: logs.map(({ player, mins, seconds, item, type}) => {
          return {
            player: playerRecords.find(e => e.playerId == player).playerName,
            mins,
            seconds,
            type,
            item
          }
        })
      }
    }
    for (let i = 0; i < e.target.files.length; i++) {
      if (e.target.files[i].name.indexOf('.w3g') == e.target.files[i].name.length - 4) await getfile(e.target.files[i])
      if (e.target.files[i].name.indexOf('.txt') == e.target.files[i].name.length - 4) {
        const buffer = await file2Buffer(e.target.files[i])
        const savefile = buffer.toString()
        const [n1, n2, n3, n4, versionstring, vv, jobstring, l, ...itemsstring ] = savefile.split('\n')
        targetsave.value = {
          date: new Date(e.target.files[i].lastModified).toLocaleString(),
          version: versionstring.match(lang.value == 'en' ? /(?<="Played Version: )(.*)(?=")/ : /(?<="플레이 버전: )(.*)(?=")/)[0],
          job: jobstring.match(lang.value == 'en' ? /(?<="Class: )(.*)(?=")/ : /(?<="직업: )(.*)(?=")/)[0],
          items: itemsstring.map(e => e.match(/(?<="[0-9]*\.\s)(.*)(?=")/)?.[0]).filter(e => e).map(e => itemnamelist.value[e]).filter(e => e)
        }
        presets.value[preset.value].lastsaveloaded = new Date().toLocaleString()
      }
    }

    e.target.value = ''
  } catch (e) {
    //console.log(e)
  }
}
</script>

<style>
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
.area {
  width: 100%;
  min-height: 100vh;
  display: flex;
  box-sizing: border-box;
  .droprate {
    position: relative;
    height: 100vh;
    padding: 20px;
    width: 20%;
    box-sizing: border-box;
    .search {
      position: absolute;
      background: white;
      right: 40px;
      left: 20px;
      top: 20px;
    }
    .items {
      display: flex;
      flex-wrap: wrap;
      overflow-y: auto;
      max-height: 100%;
      box-sizing: border-box;
      padding-top: 50px;
      .item {
        display: flex;
        border: 1px solid black;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 5px;
        padding: 10px;
        .subitem {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
      }
    }
  }
  .savefile {
    position: relative;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    width: 60%;
    overflow-y: auto;
    padding-bottom: 50%;
    .items {
      display: flex;
      flex-wrap: wrap;
      .item {
        margin: 5px;
        padding: 10px;
        border: 1px solid black;
        margin-bottom: auto;
        .name {
        }
        .ready {
          background: greenyellow;
        }
        .mats {
          margin-top: 10px;
        }
        .mat {
          font-size: .8em;
          margin: 5px 2px;
          display: flex;
          justify-content: space-between;
          .count {
            margin-left: 10px;
          }
        }
      }
      .selected {
        background: greenyellow;
      }
    }
  }
  .replayfile {
    position: relative;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    width: 20%;
    .search {
      position: absolute;
      background: white;
      right: 40px;
      left: 20px;
      top: 20px;
    }
    .replayresults {
      display: flex;
      flex-wrap: wrap;
      overflow-y: auto;
      max-height: 100%;
      box-sizing: border-box;
      padding-top: 100px;
      align-items: flex-start;
      justify-content: flex-start;
      .result {
        padding: 10px;
        margin: 10px 5px;
        border: 1px solid black;
        .log {
          padding: 10px;
        }
      }
    }
  }
}
.dragging {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, .5);
  pointer-events: none;
}
</style>
