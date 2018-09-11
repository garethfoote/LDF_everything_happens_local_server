require("dotenv").config()
const _ = require('lodash')
const sound = require('./lib/sound')
const Arduino = require('./lib/arduino')
const Utils = require('./lib/utils')

let ard = new Arduino()

const config = {}
let s = {}
let currrentVisits = 0

_.extend(config, require('./config/config'))

const server = require('http').createServer();
const io = require('socket.io')(server, {
  path: '/socket.io',
  serveClient: true
})

const socketRx = (msg) => {
  // console.log('EVENT: '+msg)
  if(msg === 'start'){
    sound.setState(sound.States.USER_ENGAGED)
  } else if(msg === 'stop'){
    sound.setState(sound.States.ATTEND)
  }
}
const socketRxDebounced = Utils.debounced(500, socketRx)
const visitsListenerDebounced = Utils.throttle(100, ard.write.bind(ard))

io.on('connection', (socket) => {
  console.log('connection', socket.id)
  socket.on('visitor', visitsListenerDebounced)  
  socket.on('mouse-event', socketRxDebounced)
})

io.on('error', (socket) => {
  console.log("io not connected")
})

sound.init(7000, 4000, 7/10)
sound.play()
server.listen(3001)
console.log("listening on 3001")


