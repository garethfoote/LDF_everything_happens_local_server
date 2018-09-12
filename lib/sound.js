// https://brewinstall.org/Install-mplayer-on-Mac-with-Brew/
// brew install mplayer
// https://github.com/active9/audiohub

const EventEmitter = require('events');
const path = require('path')
const Utils = require('./utils')
const Audiohub = require('../audiohub')
const audio = new Audiohub

const soundDirectory = '../sound_files/'
const files = [
  { name: 'attention-grab-', total : 18, current: Math.ceil(Math.random()*18)  },
  { name: 'research-'      , total : 17, current: Math.ceil(Math.random()*17)  },
  { name: 'soundbites-'    , total : 13, current: Math.ceil(Math.random()*13)  },
  { name: 'soundbites-'    , total : 13, current: Math.ceil(Math.random()*13)  },
  { name: 'clicked-'       , total : 2, current: Math.ceil(Math.random()*2)  }
]

let intervals = {}
let chance = 7/10

class Sound extends EventEmitter {
  constructor(attendInterval, engagedInterval, chanceRatio){
    super()
    this.States = { 
      ATTEND                  : [0,2],  // Atention grabbing.
      USER_ENGAGED_RESEARCH   : 1,  // Research + soundbites.
      USER_ENGAGED_SOUNDBITES : 3,  // Research + soundbites.
      WHY_CLICKED             : 4   // Why clicked.
    }

    this.currentTimers = []
    this.currentPlayer = null
    this.isPlaying = false

    chance = chanceRatio || 7/10
    audio.on('complete', this.playCompleteHandler.bind(this))
  }

  getNext(index){
    const type = files[index]
    const file = path.join(__dirname,`${soundDirectory}${type.name}${type.current}.mp3`)
  
    if(type.current < type.total){
      files[index].current ++
    } else {
      files[index].current = 1
    }
  
    return file
  }

  interrupt(state){
    setTimeout(() => {
      audio.stop()
    }, 10)

    setTimeout(() => {
      this.isPlaying = false
      console.log('interrupt() - play()')
      this.play(state)
    }, 150)
  }

  play(state, interrupt){
    let file = ''
    this.state = (Array.isArray(state)) 
      ? state[Math.floor(Math.random()*state.length)] : state

    if(interrupt === true && this.isPlaying === true){
      console.log('interrupt()')
      this.interrupt(state)
      return
    }

    if(this.isPlaying === true){
      return
    }

    file = path.resolve(this.getNext(this.state))
    const fn = file.substr(file.lastIndexOf('/'))
    
    this.isPlaying = true
    audio.play(file)
    console.log(`AUDIO: play - ${fn}`)
  }

  playCompleteHandler(file){
    const state = this.state
    this.state = -1
    this.isPlaying = false
    const fn = file.substr(file.lastIndexOf('/')+1)
    console.log('AUDIO: complete', fn, state)
    this.emit("sound-complete", state)
  }

  isPlayingUserEngaged(){
    return (this.state = 1 || this.state == 3) 
  }

}

module.exports = Sound


// const clearTimers = () => {
//   currentTimers.forEach((timerId)=>{
//     clearInterval(timerId)
//   })
//   currentTimers = []
// }

// const setState = (s) => {
//   if(isPlaying === true || s === state){
//     return
//   }

//   console.log('STATE: state', s)
//   state = s

//   clearTimers()
  
//   audio.removeAllListeners('complete')
//   const t1 = setTimeout(() => {
//     audio.stop()
//   }, 10)

//   const t2 = setTimeout(() => {
//     audio.on('complete', audioCompleteHandler)
//     isPlaying = true
//     play()
//   }, 250)

//   currentTimers.push(t1)
//   currentTimers.push(t2)
// }

// const audioCompleteHandler = (file) => {
//   if(currentTimers.length > 0){
//     console.log('Too many complete handlers', currentTimers.length)
//     clearTimers()
//   }
//   isPlaying = false
//   const fn = file.substr(file.lastIndexOf('/')+1)
//   console.log('AUDIO: complete', fn, intervals[state])
//   // currentTimers.push(setTimeout(play, intervals[state]))
// }

// const play = () => {
//   let file = ''

//   // Rotation of bot showing articles (ATTEND TO ME / RESEARCH)

//   // In ATTEND mode, opening new tab or mouse move 
//       // USERENGAGED - Interrupt: 'Don't be distracted'
//   //

//   switch (state){
//     case States.ATTEND:
//       file = path.resolve(getNext(0)) // attention
//     break;
//   case States.USER_ENGAGED:
//     if(Math.random() < chance){ 
//       file = path.resolve(getNext(2)) // soundbite
//     } else {
//       file = path.resolve(getNext(1)) // research
//     }
    
//     break;
//   }

//   const fn = file.substr(file.lastIndexOf('/'))
//   console.log(`AUDIO: play - ${fn}`)
//   audio.play(file)
// }

// audio.on('complete', audioCompleteHandler)


// module.exports = {
//   init,
//   play,
//   setState,
//   States
// }
