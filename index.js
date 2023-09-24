var port = 3090;
var colors = require('@colors/colors');
const WebSocket = require('ws')
require('better-logging')(console);
console.logLevel = 4;
const uuid = require('uuid')
const blacklist_word = /hater|hate|hates/g
const wss = new WebSocket.Server({ port: port })
console.log('Host created on port: ' + port) 
console.log("use /connect".blue, "127.0.0.1".green + ":" + `${port}`.brightBlue, "to connect".blue)
console.warn("WARNING: MAKE SURE Websocket Encryption is disabled. Navigate Settings -> Profile -> Require Encrypted Websockets.")
wss.on('connection', (socket, request) => {
  console.log(`An connection connected: ${request.socket.remoteAddress}:${request.socket.remotePort}`)
  function send(cmd) {
    const msg = {
      "header": {
        "version": 1,
        "requestId": uuid.v4(),
        "messagePurpose": "commandRequest",
        "messageType": "commandRequest"
      },
      "body": {
        "version": 1,
        "commandLine": cmd,
        "origin": {
          "type": "player"      
        }
      }
    }
    socket.send(JSON.stringify(msg))
  }
  var tellrawJSON = {"rawtext": [{"text": `Your ip is ${request.socket.remoteAddress}:${request.socket.remotePort}`}]}
  send(`tellraw @s ${JSON.stringify(tellrawJSON)}`)
  socket.send(JSON.stringify({
    "header": {
      "version": 1,                    
      "requestId": uuid.v4(),          
      "messageType": "commandRequest", 
      "messagePurpose": "subscribe"    
    },
    "body": {
      "eventName": "PlayerMessage"     
    },
  }))

  socket.on('message', packet => {
    const msg = JSON.parse(packet)
    const msgEvent = msg.header.eventName
    const msgType = msg.body.type
    const msgSender = msg.body.sender
    const msgMessage = msg.body.message
    if(msgSender != "Extrenal"){
      switch(blacklist_word.test(msgMessage)){
      case false:
        console.log(`[${msgType} - ${msgEvent}] ${msgSender}: ${msgMessage}`)
        break;
      case true:
        send(`tellraw @s {"rawtext":[{"text":"woah pal you cant say that!"}]}`)
        console.warn()
        break;
      }
  } 
  socket.on('close', (code, reason) => {
    console.warn(`[${code}] Connection closed: '${reason}'`)
  })
})
})