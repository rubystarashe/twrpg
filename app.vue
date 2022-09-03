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
      <div class="item" v-for="({ rate, wish }, key) in droptable" :key="key" v-show="dropsearch.length ? itemlist[key].indexOf(dropsearch) >= 0 : true">
        <div>{{itemlist[key]}}</div>
        <div>{{rate}}%</div>
        <div v-if="wish">소원시 {{wish}}%</div>
      </div>
    </div>
  </div>
  <div class="savefile">
    <div class="search">
      <div>세이브 파일 분석</div>
      <input type="file" @change="filechanged" accept=".w3g" multiple>
      <div>유저이름: <input @input="e => savesearch_nick = e.target.value"></div>
      <div>아이템: <input @input="e => savesearch_item = e.target.value"></div>
    </div>
    <div class="saveresults">
      <div class="result" v-for="({ log, map, date }, name) in result">
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
  <div class="dragging" v-if="dragging">Dragging</div>
</div>
</template>

<script setup>
import axios from 'axios'
import { Translator } from '@voces/wc3maptranslator'
import { Buffer } from 'buffer'
import ReplayParser from 'w3gjs/dist/lib/parsers/ReplayParser'

const itemLoaded = ref(false)
const itemlist = ref({})
const droptable = ref({})

const dragging = ref(false)

const dropsearch = ref('')
const savesearch_nick = ref('')
const savesearch_item = ref('')

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
  Object.keys(items).forEach(id => {
    const item = items[id].find(e => e.id == 'unam').value.replace(/[^ㄱ-ㅎ가-힣\s]/g, '')
    delete items[id]
    if (item) items[id.replace(/:[A-z0-9]*/, '')] = item
  })
  itemlist.value = items
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
    droptable.value[e.id] = {
      rate: e.rate
    }
  })

  dropdata.match(/(?<=set zy\[BY\]=)((.|\r|\n)*?)call d3o/g).map(e => {
    const arr = e.split('\r\n')
    const rate = arr[0]
    console.log(arr, rate)
    const items = arr.map(e => e.match(/(?<=call (dSo|dUo)\(BY,\(')(.*?)(?=')/)).filter(e => e).map(e => e[0])
    return {
      rate,
      items
    }
  }).forEach(e => {
    e.items.forEach(i => {
      droptable.value[i].wish = droptable.value[i].rate
      droptable.value[i].rate = droptable.value[i].rate * e.rate
      droptable.value[i].rate = parseFloat(droptable.value[i].rate.toFixed(3))
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
      console.log(i)
      await getfile(e.target.files[i])
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
    width: 40%;
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
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 5px;
        padding: 10px;
      }
    }
  }
  .savefile {
    position: relative;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    width: 60%;
    .search {
      position: absolute;
      background: white;
      right: 40px;
      left: 20px;
      top: 20px;
    }
    .saveresults {
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
