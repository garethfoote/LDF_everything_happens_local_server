require("dotenv").config()
const _ = require('lodash')
const Sound = require('./lib/sound')
const Arduino = require('./lib/arduino')
const Utils = require('./lib/utils')

const config = {}
let s = {}
let currrentVisits = 0
_.extend(config, require('./config/config'))

const ard = new Arduino()
const sound = new Sound(7000, 4000, 7/10)

const lastMsg = ""
const server = require('http').createServer();
const io = require('socket.io')(server, {
  path: '/socket.io',
  serveClient: true
})

const isUserEngagedPlaying = (state) => {
  return (state=== sound.States.USER_ENGAGED_RESEARCH ||
    state === sound.States.USER_ENGAGED_SOUNDBITES)
}



let timeoutId = -1

const clear = () => {
  clearTimeout(timeoutId)
  sound.off('sound-complete', soundCompleteHandler)
}

const soundCompleteHandler = (state) => {
  clear()
  timeoutId = setTimeout(playSoundBites, Math.randomRange(1500, 7000))
}

const playSoundBites = () => {
  sound.on('sound-complete', soundCompleteHandler)
  sound.play(sound.States.USER_ENGAGED_SOUNDBITES) 
}


const socketRx = (msg) => {
  console.log('\nEVENT: ' + msg)
  if(config.audio === false){
    return
  }

  if(msg === 'mouse-start'){
    console.log(sound.isPlaying === true, sound.isPlayingUserEngaged() === false)
  }
  if(msg === 'mouse-start' 
    && (sound.isPlaying === false 
    || (sound.isPlaying === true && sound.isPlayingUserEngaged() === false))){
    console.log('lastMsg', lastMsg)
    if(lastMsg !== 'mouse-start') {
      sound.on('sound-complete', soundCompleteHandler)
      sound.play(sound.States.USER_ENGAGED_RESEARCH, true) 
    }
      
    // RESEARCH once, followed by SOUNDBITES
    // Triggered by mouse-move.
    // Force interrupt if in other state.
    // Block until 
  } 
  
  if(msg === 'article-complete' && sound.isPlaying !== true){
    clear()
    sound.play(sound.States.ATTEND) 
    // Random ATTENTION & SOUNDBITES
    // Triggered by article finish.
    // Do not force interrupt
    // Block until state changes || x seconds has passed (multiply x on each iteration, until max x reach)
  }

  if(msg === 'page-opened'){
    clear()
    sound.play(sound.States.WHY_CLICKED, true) 
    // Random WHY_CLICKED
    // interrupt in all cases
  }

  lastState = msg

}
const socketRxDebounced = Utils.debounced(500, socketRx)
const visitsListenerDebounced = Utils.throttle(100, ard.write.bind(ard))

io.on('connection', (socket) => {
  console.log('connection', socket.id)
  socket.on('visitor', visitsListenerDebounced)  
  socket.on('user-event', socketRxDebounced)
})

io.on('error', (socket) => {
  console.log("io not connected")
})


server.listen(3001)
console.log("listening on 3001")


