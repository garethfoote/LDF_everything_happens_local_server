var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbserial-A6008jFI', {
  baudRate: 9600,
  autoOpen: false,
})
 
// getConnectedArduino()
port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }
  port.write('211232112333');
});
 
// The open event is always emitted
port.on('open', function() {
  // open logic
  console.log('OPEN');
});

 
// // Open errors will be emitted as an error event
// port.on('error', function(err) {
//   console.log('Error: ', err.message);
// })


// function getConnectedArduino() {
//     SerialPort.list(function(err, ports) {
//       var allports = ports.length;
//       var count = 0;
//       var done = false
//       ports.forEach(function(port) {
//         count += 1;
//         pm = port['manufacturer'];
//         if (typeof pm !== 'undefined' && pm.includes('arduino')) {
//           arduinoport = port.comName.toString();
//           var serialPort = require('serialport');
//           sp = new serialPort(arduinoport, {
//             buadRate: 9600
//           })
//           sp.on('open', function() {
//             console.log('done! arduino is now connected at port: ' + arduinoport)



//           })
//           done = true;
//         }
//         if (count === allports && done === false) {
//            console.log('cant find arduino')
//         }
//       });
  
//     });
//   }