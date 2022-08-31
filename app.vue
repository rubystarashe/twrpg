<template>
<div class="area" v-if="itemLoaded" 
  @dragleave="dragging = false"
  @dragover="dragover"
  @drop="filedropped">
  <input type="file" @change="filechanged" accept=".w3g">
  {{mapInfo}}
  <div>
    <div v-for="{ player, mins, seconds, item, type } in result">
      <div v-if="type == 'get'">
        <span>{{player}}</span>가 <span>{{mins}}분 {{seconds}}초</span>에 <span>{{item}}</span> 획득함
      </div>
      <div v-else-if="type == 'craft'">
        <span>{{player}}</span>가 <span>{{mins}}분 {{seconds}}초</span>에 아이템 조합함
      </div>
    </div>
  </div>
  <div v-if="dragging">Dragging</div>
</div>
</template>

<script setup>
import axios from 'axios'
import { Translator } from '@voces/wc3maptranslator'
import { Buffer } from 'buffer'
import ReplayParser from 'w3gjs/dist/lib/parsers/ReplayParser'

const itemLoaded = ref(false)
const itemlist = ref({})
const lastModified = ref(0)
const mapInfo = ref({})

const dragging = ref(false)

const result = ref([])

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
  const { data } = await axios.get('/war3map.w3t', { responseType: 'blob' })
  const translator = new Translator()
  const { json } = translator.Objects.warToJson('string', Buffer.from(await data.arrayBuffer()))
  const items = Object.assign(json.original, json.custom)
  Object.keys(items).forEach(id => {
    const item = items[id].find(e => e.id == 'unam').value.replace(/[^ㄱ-ㅎ가-힣\s]/g, '')
    delete items[id]
    if (item) items[id.replace(/:[A-z0-9]*/, '')] = item
  })
  itemlist.value = items
  itemLoaded.value = true
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
    const file = e.target.files[0]
    const data = await parser.parse(await file2Buffer(file))
    lastModified.value = new Date(file.lastModified)
    const { metadata: { playerRecords, map }} = data

    const mapname = map.mapName.replace(/^.*[\\]/, '')
    const version = mapname.replace('twrpgv', '').replace('.w3x', '')
    mapInfo.value = {
      mapcheck: map.mapChecksumSha1,
      mapname: map.mapName.replace(/^.*[\\]/, ''),
      version
    }
    
    result.value = logs.map(({ player, mins, seconds, item, type}) => {
      return {
        player: playerRecords.find(e => e.playerId == player).playerName,
        mins,
        seconds,
        type,
        item
      }
    })

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
}
</style>
