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

let currentTimers = []
let currentPlayer = null
let isPlaying = true

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

const clearTimers = () => {
  currentTimers.forEach((timerId)=>{
    clearInterval(timerId)
  })
  currentTimers = []
}

const setState = (s) => {
  if(isPlaying === true || s === state){
    return
  }

  console.log('STATE: state', s)
  state = s

  clearTimers()
  
  audio.removeAllListeners('complete')
  const t1 = setTimeout(() => {
    audio.stop()
  }, 10)

  const t2 = setTimeout(() => {
    audio.on('complete', audioCompleteHandler)
    isPlaying = true
    play()
  }, 250)

  currentTimers.push(t1)
  currentTimers.push(t2)
}

const audioCompleteHandler = (file) => {
  if(currentTimers.length > 0){
    console.log('Too many complete handlers', currentTimers.length)
    clearTimers()
  }
  isPlaying = false
  const fn = file.substr(file.lastIndexOf('/')+1)
  console.log('AUDIO: complete', fn, intervals[state])
  // currentTimers.push(setTimeout(play, intervals[state]))
}

const play = () => {
  let file = ''

  // Rotation of bot showing articles (ATTEND TO ME / RESEARCH)

  // In ATTEND mode, opening new tab or mouse move 
      // USERENGAGED - Interrupt: 'Don't be distracted'
  //

  switch (state){
    case States.ATTEND:
      file = path.resolve(getNext(0)) // attention
    break;
  case States.USER_ENGAGED:
    if(Math.random() < chance){ 
      file = path.resolve(getNext(2)) // soundbite
    } else {
      file = path.resolve(getNext(1)) // research
    }
    
    break;
  }

  const fn = file.substr(file.lastIndexOf('/'))
  console.log(`AUDIO: play - ${fn}`)
  audio.play(file)
}

audio.on('complete', audioCompleteHandler)


module.exports = {
  init,
  play,
  setState,
  States
}
