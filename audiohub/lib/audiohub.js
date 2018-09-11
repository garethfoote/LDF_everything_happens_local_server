const EventEmitter = require('events');
var spawn = require('child_process').spawn;
const fs = require('fs');

class Audiohub extends EventEmitter {

  constructor(opts){
    super()
    if (!opts) {
      opts = {
        player: 'mplayer'
      }
    }
    this.opts = opts
    this.playback = null
  }

  play(file) {
  
    const cliPlayer = this.opts.player

    if (fs.existsSync(file) === false) {
      this.emit('error', `The file ${file} does not exist.`)
    }

    // console.log("Now Playing "+ file +" ..")

    this.playback = spawn(cliPlayer,[file],{
      detached: false
    })

    this.playback.stdout.on('data', (data) => {
      //process.stdout.write(data)
    })

    this.playback.stderr.on('data', (data) => {
      // console.log('Error: ' + data)
      // this.emit('error', data)
    })

    const completeHandler = () => {
      // console.log('Complete', this.playback.spawnargs[1])
      this.playback.off('close', completeHandler)
      this.emit('complete', file)
    }

    this.playback.on('close', completeHandler)
  }

  stop(){
    if(typeof this.playback != "undefined"){
      this.playback.kill()
    }
  }
}

module.exports = Audiohub;
