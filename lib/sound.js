// https://brewinstall.org/Install-mplayer-on-Mac-with-Brew/
// brew install mplayer
// https://github.com/active9/audiohub

var path = require('path')
var Utils = require('./utils')
var Audiohub = require('../audiohub')
var audio = new Audiohub

const soundDirectory = '../sound_files/'
const files = [
  { name: 'attention-grab-', total : 18, current: Math.ceil(Math.random()*18)  },
  { name: 'research-'      , total : 17, current: Math.ceil(Math.random()*17)  },
  { name: 'soundbites-'    , total : 13, current: Math.ceil(Math.random()*13)  }
]

const States = { 
  ATTEND        : "ATTEND", 
  USER_ENGAGED  : "USER_ENGAGED"
}
let state = States.ATTEND

let chance = 7/10
let intervals = {
  "ATTEND"        : (() => { return Math.randomRange(7000/4, 7000) })() ,
  "USER_ENGAGED"  : (() => { return Math.randomRange(3000/4, 3000)  })()
}

let currentTimer = -1
let currentPlayer = null

const init = (attendInterval, engagedInterval, chanceRatio) => {
  const attend = attendInterval || 7000
  const engaged = engagedInterval || 3000
  chance = chanceRatio || 7/10

  intervals = {
    "ATTEND"        : (() => { return Math.randomRange(attend/4, attend) })() ,
    "USER_ENGAGED"  : (() => { return Math.randomRange(engaged/4, engaged) })()
  }
}

const getNext = (index) => {
  const type = files[index]
  const file = path.join(__dirname,`${soundDirectory}${type.name}${type.current}.mp3`)

  if(type.current < type.total){
    files[index].current ++
  } else {
    files[index].current = 1
  }

  return file
}

const stop = () => {
  audio.stop()
}

const setState = (s) => {
  if(s === state){
    return
  }

  console.log('\nSTATE: state', s)
  state = s
  clearInterval(currentTimer)
  audio.removeAllListeners('complete')
  setTimeout(() => {
    stop()
  }, 10)

  setTimeout(() => {
    audio.on('complete', audioCompleteHandler)
    play(true)
  }, 250)
}

const audioCompleteHandler = (file) => {
  const fn = file.substr(file.lastIndexOf('/'))
  console.log('AUDIO: complete', fn, intervals[state])
  currentTimer = setTimeout(play, intervals[state])
}

audio.on('complete', audioCompleteHandler)

const play = (force) => {
  let file = ''

  switch (state){
    case States.ATTEND:
    // x/10 probability 
    if(Math.random() < chance || force === true){ 
      file = path.resolve(getNext(0)) // attention
    } else {
      file = path.resolve(getNext(1)) // research
    }
    break;
  case States.USER_ENGAGED:
    file = path.resolve(getNext(2)) // soundbite
    break;
  }

  const fn = file.substr(file.lastIndexOf('/'))
  console.log(`AUDIO: play - ${fn}`)
  audio.play(file)
}

module.exports = {
  init,
  play,
  stop,
  setState,
  States
}
