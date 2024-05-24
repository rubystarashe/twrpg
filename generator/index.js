import { readFileSync, writeFileSync } from 'fs'
import { Translator } from '@voces/wc3maptranslator'

const { version: app_version } = JSON.parse(readFileSync('package.json', 'utf-8'))

const targets = JSON.parse(readFileSync('./generator/targets.json', 'utf-8'))

const version = '0.66m'

const translator = new Translator()

const itemstring = readFileSync('./generator/war3map.w3t')

const { json } = translator.Objects.warToJson('string', itemstring)
const items_origin = Object.assign(json.original, json.custom)
const items = {}

const gradelist = {
  "아르카나": 5,
  "알테이아": 4,
  "그노시스": 3,
  "넵티노스": 2,
  "델티라마": 1
}
const typelist = {
  "무기": 0,
  "장신구": 3,
  "날개": 2,
  "방어구": 1,
  "머리보호구": 4,
  "재료": 5,
  "곡괭이": 7,
  "재화": 6,
  "아이콘": 8
}

const scriptarray = readFileSync('./generator/war3map.j', 'utf-8').split(/\n|\r/)
const st1 = scriptarray.find(e => e.indexOf(`('I016'),((50)*1.))`) >= 0).substring(5, 8)
const st2 = scriptarray.find(e => e.indexOf(`('I00B'),((33)*1.))`) >= 0).substring(5, 8)
const st3 = scriptarray.find(e => e.match(/call [A-z0-9]{3}\(\.75\)/)).substring(5, 8)
const st4 = scriptarray.find(e => e.indexOf(`'n01K',5,0,Dr,pr`) >= 0).substring(5, 8)
const st5 = scriptarray.find(e => e.indexOf(`('I016'),((50)*1.))`) >= 0).substring(9, 11)
const st6 = scriptarray.find(e => e.indexOf(`('n02R',0)`) >= 0).substring(5, 8)
const st7 = scriptarray.find(e => e.indexOf(`('h09X',0,0)`) >= 0).substring(5, 8)
const st8 = scriptarray.find(e => e.indexOf(`('I00U'),'I01E',1),'I011',1`) >= 0).substring(5, 8)

const regex = {
  droprate: new RegExp(`(?<=call (${st1}|${st2}))((.*)(?=))`, 'g'),
  droprate2: new RegExp(`(?<=call ${st3}\\()((.|\\r|\\n)*?)call ${st4}`, 'g'),
  droprate3: new RegExp(`(?<=call (${st2})\\(${st5},\\(')(.*?)(?=')`),
  droprate4: new RegExp(`(?<=call ${st2})((.|\\r|\\n)*?)(?=call ${st6}|call ${st4}|call ${st7})`, 'g'),
  droprate5: new RegExp(`(?<=${st5},\\(')(.*?)(?=')`),
  recipies: new RegExp(`(?<=call ${st8})(.*)(?=\\))`, 'g')
}

const types = {}
Object.keys(items_origin).forEach(id => {
  const name = Buffer.from(items_origin[id].find(e => e.id == 'unam').value, 'latin1').toString('utf-8').replace(/\|[A-z0-9]{9}/, '').replace(/\|r/g, '').replace(/[^ㄱ-ㅎ가-힣A-z0-1+\s]/g, '')
  const description = Buffer.from(items_origin[id].find(e => e.id == 'utub').value, 'latin1').toString('utf-8')?.replace(/\|c[A-z0-9]{8}/g, '').replace(/\|r/g, '').replace('∴클릭 시 관련 조합법을 확인', '').replace('∴Click to check any related recipes', '').replace(/\n/g, '<br/>')
  const searchstring = description?.split('<br/>')?.find(e => e?.indexOf('-') >= 0)
  const key = id.replace(/:[A-z0-9]*/, '')

  let grade, type
  if (searchstring && searchstring.indexOf('급') >= 0) {
    const [ _, _grade, __, _type ] = searchstring.trim().split(' ')
    grade = _grade
    type = _type
  }
  if (searchstring && !grade) {
    const [ _, _type ] = searchstring.trim().split(' ')
    if (typelist[_type] != undefined) type = _type
  }
  if (name.indexOf('아이콘') >= 0) type = '아이콘'

  if (name && name != 'Unused') {
    if (!types[type]) types[type] = 0
    types[type]++
    items[key] = {
      id: key,
      name,
      description: description.replace(`\r<br/>${searchstring}`, '').replace(/\[.*\]\<br\/\>/g, '').replace(/\<br\/\>▣ Lv..*/, '').trim(),
      searchstring,
      grade: gradelist[grade] || 0,
      type
    }
  }
})

const mobs = {
  'etc': '조합',
  'silverwolf': '은빛 늑대',
  'troll': '트롤 로드',
  'I0Q3': '자이언트 터틀',
  'ciri': '킹크랩',
  'I0DT': '바다코끼리',
  'polabear': '자이언트 폴라베어',
  'ssil': '매머드',
  'I0DV': '킹콩',
  'I0BT': '피의 망령',
  'I0BT2': '박쥐 괴인',
  'I046': '다크나이트',
  'nspi': '라그나스',
  'blba': '이블 라바',
  'gvsm': '촉수 지배자',
  'I0OV': '바다의 수호자',
  'dtsb': '자이언트 골렘',
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
  'wcyc': '매드클라운',
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
  'I0R7': '지신 가이아',
  'I0GH': '고대 마도 기계',
  'I0QE': '영혼수확자 스티릭스'
}
const mobsnickname = {
  'rre1': '본드래곤',
  'fgrg': '해골왕',
  'pomn': '좀비로드',
  'pres': '엔트',
  'sneg': '사미엘',
  'shar': '암흑룡',
  'infs': '데스핀드',
  'I0P0': '뇌신',
  'I0P1': '화신',
  'I0P2': '해신',
  'I0P3': '아가레스',
  'I0R6': '라자루스',
  'I0R7': '지신',
  'I0GH': '고대기계',
  'I0QE': '스티릭스'
}

const dropdata = readFileSync('./generator/war3map.j', 'utf-8').split(/\n|\r/).join('\n')

// 드랍률
dropdata.match(regex.droprate).map(e => {
  const [ prefix, idstring, ratestring ] = e.split(',')
  const id = idstring.match(/(?<=')(.*)(?=')/)[0]
  const ratemethod = ratestring.match(/(\()(.*)(?=\))/)[0]
  if (ratemethod.indexOf('d') >= 0) return null
  if (!items[id]) return null
  const rate = new Function(`
    return ${ratemethod}
  `)()
  return {
    id,
    rate
  }
}).filter(e => e).forEach(e => {
  if (!items[e.id].droprates) items[e.id].droprates = []
  items[e.id].droprates.push({ rate: parseFloat(e.rate.toFixed(3)) })
})

// 소원 반영
dropdata.match(regex.droprate2).map(e => {
  const arr = e.split(')\n')
  const rate = parseFloat(arr[0])
  const items = arr.map(e => e.match(regex.droprate3)).filter(e => e).map(e => e[0])
  return {
    rate,
    items
  }
}).forEach(e => {
  const { rate, items: _items } = e
  _items.forEach(e => {
    const target = items[e].droprates.find(e => !e.wishrate)
    if (target) {
      const droprates = target.rate * rate
      target.wishrate = parseFloat(target.rate.toFixed(3))
      target.rate = parseFloat(droprates.toFixed(3))
    }
  })
})

// 드랍 몹 확인
dropdata.match(regex.droprate4).map(e => {
  const arr = e.split('\n').filter(e => e)
  const groupitems = arr.map(e => e.match(regex.droprate5)).filter(e => e).map(e => e[0])
  const groupitem = groupitems[groupitems.length - 1]
  
  groupitems.forEach(id => {
    if (items[id]?.droprates) {
      const target = items[id].droprates.find(e => !e.group)
      if (target) {
        target.group = groupitem
      }
    }
  })
})

// 드랍률 누락 몹 보정
//은빛 송곳니
items['I009'].droprates = [
  {
    rate: 30,
    group: "silverwolf"
  }
]
// 은빛 가죽 갑옷
items['I00P'].droprates = [
  {
    rate: 30,
    group: "silverwolf"
  }
]
// 트롤의 피
items['I013'].droprates = [
  {
    rate: 30,
    group: "troll"
  }
]
// 쉘 소드
items['pmna'].droprates = [
  {
    rate: 30,
    group: "ciri"
  }
]
// 크랩 아머
items['spsh'].droprates = [
  {
    rate: 30,
    group: "ciri"
  }
]
// 바다의 진주
items['ciri'].droprates = [
  {
    rate: 30,
    group: "ciri"
  }
]
// 상아 지팡이
items['I0DS'].droprates = [
  {
    rate: 30,
    group: "I0DT"
  }
]
// 터스크 헌터
items['wneg'].droprates = [
  {
    rate: 30,
    group: "I0DT"
  }
]
// 바다코끼리 망토
items['I0DT'].droprates = [
  {
    rate: 30,
    group: "I0DT"
  }
]
// 아이시클 보우
items['prvt'].droprates = [
  {
    rate: 30,
    group: "ssil"
  }
]
// 글래시어 가드
items['lgdh'].droprates = [
  {
    rate: 30,
    group: "ssil"
  }
]
// 스노우맨 펜던트
items['ssil'].droprates = [
  {
    rate: 30,
    group: "ssil"
  }
]
// 킹콩의 손톱
items['I0DU'].droprates = [
  {
    rate: 30,
    group: "I0DV"
  }
]
// 바람막이 털옷
items['hval'].droprates = [
  {
    rate: 30,
    group: "I0DV"
  }
]
// 고기 주머니
items['I0DV'].droprates = [
  {
    rate: 30,
    group: "I0DV"
  }
]
// 곰가죽 망토
items['rnsp'].droprates = [
  {
    rate: 40,
    group: "polabear"
  }
]
// 따듯한 털가죽
items['I08O'].droprates = [
  {
    rate: 40,
    group: "polabear"
  }
]

// 박쥐괴인
// 돌갑주
items['rhe1'].droprates = [
  {
    rate: 25,
    group: "I0BT2"
  }
]
// 박쥐 날개
items['rspd'].droprates = [
  {
    rate: 25,
    group: "I0BT2"
  }
]
// 박쥐괴인 & 피의 망령
// 블러드 오브
items['I0BR'].droprates = [
  {
    rate: 25,
    group: "I0BT"
  },
  {
    rate: 25,
    group: "I0BT2"
  }
]
// 망자의 반지
items['I0BT'].droprates = [
  {
    rate: 25,
    group: "I0BT"
  },
  {
    rate: 25,
    group: "I0BT2"
  }
]
// 피의 가면
items['I0C3'].droprates = [
  {
    rate: 25,
    group: "I0BT"
  },
  {
    rate: 25,
    group: "I0BT2"
  }
]

// 봉인된 무기
// 뇌전의 검 이르베스
items['I080'].droprates = [
  {
    rate: 7.5,
    group: "lnrn"
  }
]
// 불의 장검 리오레우스
items['I081'].droprates = [
  {
    rate: 7.5,
    group: "lnrn"
  }
]
// 대지의 봉 벤지아나
items['I082'].droprates = [
  {
    rate: 7.5,
    group: "lnrn"
  }
]
// 바람의 궁 피레스
items['I09M'].droprates = [
  {
    rate: 7.5,
    group: "lnrn"
  }
]
// 강철의 탄환 레투스
items['I0F7'].droprates = [
  {
    rate: 7.5,
    group: "lnrn"
  }
]

// 망령의 실
items['sora'].droprates = [
  {
    rate: 5,
    group: "wcyc"
  }
]
// 스캐럽 본
items['sor2'].droprates = [
  {
    rate: 5,
    group: "wcyc"
  }
]

// 망자의 투구
items['sor1'].droprates = [
  {
    rate: 25,
    group: 'I046'
  }
]


// 조합법
dropdata.match(regex.recipies).map(e => {
  const [ idstring, ...materialstring ] = e.split(`,'`)
  const id = idstring.match(/(?<=')(.*)(?=')/)[0]
  const materials = materialstring.map(e => {
    const [ item, count ] = e.split(',')
    return { item: item.replace(/'/g, ''), count: parseInt(count.replace(/\(|\)/g, ''))}
  })
  return { id, materials }
}).forEach(e => {
  if (items[e.id]) {
    if (items[e.id].droprates?.length) {
      const mobindex = Object.keys(mobs).indexOf(items[e.id]?.droprates?.[0]?.group) || 0
      items[e.id].mobindex = mobindex
      if (mobindex) items[e.id].mobgroup = items[e.id]?.droprates?.[0]?.group
    }

    if (!items[e.id].recipies) items[e.id].recipies = []
    items[e.id].recipies.push(e.materials.sort((a, b) => items[a.item].recipies ? 1 : -1))
    e.materials.forEach(i => {
      const mobindex = Object.keys(mobs).indexOf(items[i.item]?.droprates?.[0]?.group) || 0
      if (!items[e.id].mobindex || items[e.id].mobindex < mobindex) {
        items[e.id].mobindex = mobindex
        items[e.id].mobgroup = items[i.item]?.droprates?.[0]?.group
      }
    })
  }
})

// 더미 데이터 제거
const items_array = Object.values(items)
Object.values(items).forEach(e => {
  if (items_array.filter(i => i.name == e.name).length >= 2 && !e.droprates && !e.recipies) delete items[e.id]
})

Object.entries(targets).forEach(([ job, data ]) => {
  Object.entries(data).forEach(([ preset, { items } ]) => {
    items.forEach(e => {
      if (!items_array.find(i => i.name == e)) console.log(job, preset, e)
    })
  })
})

// 몹 정보
const moblist = Object.entries(mobs).map(([id, name], index) => {
  const drops = []
  Object.entries(items).forEach(([item, { droprates }]) => {
    if (droprates && droprates.find(e => e.group == id)) drops.push({ item, rate: droprates.find(e => e.group == id).rate, wishrate: droprates.find(e => e.group == id).wishrate })
  })
  return {
    id,
    name,
    nickname: mobsnickname[id],
    drops,
    index
  }
}).reduce((p, c) => (p[c.id] = { name: c.name, drops: c.drops, index: c.index, nickname: c.nickname }, p), {})

writeFileSync('./generator/data.json', JSON.stringify({ app_version, version, types, mobs: moblist, items }, 0, 2))

console.log('database generated')