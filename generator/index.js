import { readFileSync, writeFileSync } from 'fs'
import { Translator } from '@voces/wc3maptranslator'

const { version: app_version } = JSON.parse(readFileSync('package.json', 'utf-8'))

const version = '0.66h'

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

const legacy_regex = {
  droprate: /(?<=call (jCo|jDo))((.*)(?=))/g,
  droprate2: /(?<=call jmo\()((.|\r|\n)*?)call jjo/g,
  droprate3: /(?<=call (jCo)\(IU,\(')(.*?)(?=')/,
  droprate4: /(?<=call jCo)((.|\r|\n)*?)(?=call jKo|call jjo|call jGo)/g,
  droprate5: /(?<=IU,\(')(.*?)(?=')/,
  recipies: /(?<=call JVo)(.*)(?=\))/g
}
const regex = {
  droprate: /(?<=call (H9o|jeo))((.*)(?=))/g, // ('gsou'),((2.5)*1.)
  droprate2: /(?<=call jAo\()((.|\r|\n)*?)call jVo/g, // ('belv'),((2.)*1.)
  droprate3: /(?<=call (H9o)\(AU,\(')(.*?)(?=')/,
  droprate4: /(?<=call H9o)((.|\r|\n)*?)(?=call jOo|call jVo|call jio)/g,
  droprate5: /(?<=AU,\(')(.*?)(?=')/,
  recipies: /(?<=call jZo)(.*)(?=\))/g
}

const types = {}
Object.keys(items_origin).forEach(id => {
  const name = Buffer.from(items_origin[id].find(e => e.id == 'unam').value, 'latin1').toString('utf-8').replace(/\|[A-z0-9]{9}/, '').replace(/\|r/g, '').replace(/[^ㄱ-ㅎ가-힣A-z\s]/g, '')
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
  'I0R7': '지신 가이아',
  'I0GH': '고대 마도 기계',
  'I0QE': '영혼수확자 스티릭스'
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
    if (!items[e.id].recipies) items[e.id].recipies = []
    items[e.id].recipies.push(e.materials)
  }
})

// 더미 데이터 제거
delete items['manh']
delete items['I0RN']
delete items['I0RQ']
delete items['I0S7']

// 몹 정보
const moblist = Object.entries(mobs).map(([id, name], index) => {
  const drops = []
  Object.entries(items).forEach(([item, { droprates }]) => {
    if (droprates && droprates.find(e => e.group == id)) drops.push({ item, rate: droprates.find(e => e.group == id).rate, wishrate: droprates.find(e => e.group == id).wishrate })
  })
  return {
    id,
    name,
    drops,
    index
  }
}).reduce((p, c) => (p[c.id] = { name: c.name, drops: c.drops, index: c.index }, p), {})

writeFileSync('./generator/data.json', JSON.stringify({ app_version, version, types, mobs: moblist, items }, 0, 2))
