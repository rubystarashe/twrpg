<template>
<div class="area" v-if="itemLoaded" 
  @dragleave="dragging = false"
  @dragover="dragover"
  @drop="filedropped">
  <div class="droprate">
    <div class="search">
      <div>드랍 확률 목록 버전: 0.61s</div>
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
        <div v-if="wish">소원시 {{wish}}%</div>
        <div v-if="alt">
          <div class="subitem" v-for="({ rate: altrate, wish }, i) in alt" v-show="altrate != rate && (!i || (i && altrate != alt[i - 1].rate))">
            <div>{{altrate}}%</div>
            <div v-if="wish">소원시 {{wish}}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="savefile">
    <div>
      <h2>파밍 루트를 계산할 세이브를 선택해 주세요</h2>
      <input type="file" @change="filechanged" accept=".txt">
      <div>버전: {{targetsave.version}}</div>
      <div>{{targetsave.date}}</div>
      <div>직업: {{targetsave.job}}</div>
      <h3>가진 아이템</h3>
      <div class="items" v-if="targetsave.items">
        <div class="item" v-for="item in targetsave.items" @mouseover="hover = item" @mouseleave="hover = null">
          <div :class="{ ready: checkisneed(item) }">{{itemlist[item]}}</div>
        </div>
      </div>
    </div>
    <div>
      <h2>목표 파밍 아이템을 선택해 주세요</h2>
      <div>아이템 검색</div>
      <input @input="e => targetsearch = e.target.value">
      <div class="items">
        <div v-if="!targetsearch.length">검색된 아이템 없음</div>
        <div class="item" v-for="(item, key) in itemlist" v-show="(recipies[key] || key == itemnamelist[item]) && targetsearch.length && searchitem(targetsearch, item, key)"
          @click="target[key] ? delete target[key] : target[key] = true"
          @mouseover="hover = key" @mouseleave="hover = null"
        >{{item}}</div>
      </div>
    </div>
    <div>
      <h3>현재 선택된 목표 아이템:</h3>
      <div class="items">
        <div v-if="!Object.keys(target).length">목표 아이템 없음</div>
        <div class="item" v-for="(d, key) in target" @click="delete target[key]" @mouseover="hover = key" @mouseleave="hover = null">
          {{itemlist[key]}}
        </div>
      </div>
    </div>
    <div>
      <h3>파밍에 필요한 아이템</h3>
      <div class="items">
        <div class="item" v-for="(d, key) in target">
          <div class="name" :class="{ ready: (targetsave.items || []).find(e => e == key) }" @mouseover="hover = key" @mouseleave="hover = null">{{itemlist[key]}}</div>
          <Recipie v-if="recipies[key]" :itemlist="itemlist" :recipies="recipies" :droptable="droptable" :targetsave="targetsave || {}" :target="key" @hover="v => hover = v"/>
        </div>
      </div>
    </div>
  </div>
  <div class="replayfile">
    <div class="search">
      <div>리플레이 파일 분석</div>
      <input type="file" @change="filechanged" accept=".w3g" multiple>
      <div>유저이름: <input @input="e => savesearch_nick = e.target.value"></div>
      <div>아이템: <input @input="e => savesearch_item = e.target.value"></div>
    </div>
    <div class="replayresults">
      <div class="result" v-for="({ log, map, date }, name) in result"
        v-show="(savesearch_nick.length ? log.find(({ player }) => player?.indexOf(savesearch_nick) >= 0) ? true : false : true) && (savesearch_item.length ? log.find(({ item }) => item?.indexOf(savesearch_item) >= 0) ? true : false : true)"
      >
        <div>버전: {{map.version}}</div>
        <div>날짜: {{date}}</div>
        <div>파일명: {{name}}</div>
        <div class="log" v-for="{ player, mins, seconds, item, type } in log" v-show="(savesearch_nick.length ? player?.indexOf(savesearch_nick) >= 0 ? true : false : true) && (savesearch_item.length ? item?.indexOf(savesearch_item) >= 0 ? true : false : true)">
          <div v-if="type == 'get'">
            <span>{{player}}</span>가 <span>{{mins}}분 {{seconds}}초</span>에 <span>{{item}}</span> 획득함
          </div>
          <div v-else-if="type == 'craft'">
            <span>{{player}}</span>가 <span>{{mins}}분 {{seconds}}초</span>에 아이템 조합함
          </div>
        </div>
      </div>
    </div>
  </div>
  <Description :itemlist="itemlist" :descriptions="itemdescriptions" :recipies="recipies" :hover="hover"/>
  <div class="dragging" v-if="dragging">Dragging</div>
</div>
</template>

<script setup>
import axios from 'axios'
import { Translator } from '@voces/wc3maptranslator'
import { Buffer } from 'buffer'
import ReplayParser from 'w3gjs/dist/lib/parsers/ReplayParser'

const { target, targetsave } = store('usersetting').toRefs()

const itemLoaded = ref(false)
const itemlist = ref({})
const itemdescriptions = ref({})
const itemsearchstrings = ref({})

const searchitem = (string, item, id) => {
  if (item.indexOf(string) >= 0) return true
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

const dragging = ref(false)
const hover = ref(null)

const dropsearch = ref('')
const savesearch_nick = ref('')
const savesearch_item = ref('')
const targetsearch = ref('')

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
  const { data: itemdata } = await axios.get('/twrpg/war3map.w3t', { responseType: 'blob' })
  const translator = new Translator()
  const { json } = translator.Objects.warToJson('string', Buffer.from(await itemdata.arrayBuffer()))
  const items = Object.assign(json.original, json.custom)
  const descriptions = {}
  const searchstrings = {}
  const itemlistdata = {}
  Object.keys(items).forEach(id => {
    const item = items[id].find(e => e.id == 'unam').value.replace(/[^ㄱ-ㅎ가-힣\s]/g, '')
    const description = items[id].find(e => e.id == 'utub')?.value?.replace(/\|c[A-z0-9]{8}/g, '').replace(/\|r/g, '').replace('∴클릭 시 관련 조합법을 확인', '').replace(/\n/g, '<br/>')
    const searchstring = description?.split('<br/>')?.find(e => e?.indexOf('-') >= 0)
    const key = id.replace(/:[A-z0-9]*/, '')
    if (searchstring) searchstrings[key] = searchstring
    if (item) {
      if (key == 'I0RP') console.log(item)
      itemlistdata[key] = item
      descriptions[key] = description
    }
  })
  itemlist.value = itemlistdata
  itemdescriptions.value = descriptions
  itemsearchstrings.value = searchstrings
  itemLoaded.value = true

  let { data: dropdata } = await axios.get('/twrpg/war3map.j')
  dropdata = dropdata.split('\n').slice(40000, 45000).join('\n')
  dropdata.match(/(?<=call (dSo|dUo))((.*)(?=))/g).map(e => {
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
  dropdata.match(/(?<=call D4o)(.*)(?=\))/g).map(e => {
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

  dropdata.match(/(?<=set zy\[BY\]=)((.|\r|\n)*?)call d3o/g).map(e => {
    const arr = e.split('\n')
    const rate = arr[0]
    const items = arr.map(e => e.match(/(?<=call (dSo)\(BY,\(')(.*?)(?=')/)).filter(e => e).map(e => e[0])
    return {
      rate,
      items
    }
  }).forEach(e => {
    e.items.forEach(i => {
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
          version: versionstring.match(/(?<="플레이 버전: )(.*)(?=")/)[0],
          job: jobstring.match(/(?<="직업: )(.*)(?=")/)[0],
          items: itemsstring.map(e => e.match(/(?<="[0-9]*\.\s)(.*)(?=")/)?.[0]).filter(e => e).map(e => itemnamelist.value[e]).filter(e => e)
        }
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
