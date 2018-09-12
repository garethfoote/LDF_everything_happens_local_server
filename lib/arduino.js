const SerialPort = require('serialport');

class Arduino {
  constructor(){
    this.initted = false
    this.isWriting = false
    this.getArduino()
  }

  getArduino(){
    this.searchPorts()
      .then(this.init.bind(this))
      .catch((err) => {
        // console.log(err, "- retrying in 5000ms")
        setTimeout(this.getArduino.bind(this), 5000)
      })
  }

  init(portname){
    this.port = new SerialPort(portname, {
      baudRate: 9600,
      autoOpen: false
    })
    this.port.open(()=>{
      this.initted = true
      console.log("Opened: " + portname)
      setTimeout(()=> {
        this.write("999999999999")
      }, 1000)
    })
  }

  write(msg){
    if(this.initted === false || this.isWriting === true){
      return
    }
    if(msg.length !== 12){
      msg = String(msg).padStart(12, '0')
    }
    msg = msg.substr(0, 12)
    this.isWriting = true
    this.port.write(msg, (err) => {
      if (err) {
        return console.log('Error on write: ', err.message)
      }
      this.isWriting = false
    })
  }

  searchPorts() {
    return new Promise((resolve, reject) => {
      SerialPort.list(function(err, ports) {
        var allports = ports.length;
        var count = 0;
        var done = false
        ports.forEach(function(port) {
          count += 1;
          let pm = port['manufacturer']
          if (typeof pm !== 'undefined' && pm.toLowerCase().includes('arduino')) {
            resolve(port['comName'])
            done = true;
          }
          if (count === allports && done === false) {
            reject("Arduino not found")
          }
        })
      })
    })
  }
}

module.exports = Arduino
