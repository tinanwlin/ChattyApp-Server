const express = require('express');
const WebSocket = require('ws');
const uuidv4 = require('uuid/v4');


// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${PORT}`));

// Create the WebSockets server
const wss = new WebSocket.Server({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
// let countConnectedUser = 0;
wss.on('connection', (ws, req) => {
  console.log('Client connected')
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  let connectedUsers = {
    type: "numberOfConnectedUser",
    number: wss.clients.size
  }

  wss.broadcast(connectedUsers)

  ws.on('message', function (message) {
    wss.clients.forEach(function (client) {
      if (client.readyState === WebSocket.OPEN) {
        var obj = JSON.parse(message);
        obj.id = uuidv4();
        console.log('obj in server', obj)
        switch (obj.type) {
          case "postMessage":
            console.log('server transfer type to incoMes');
            obj.type = "incomingMessage";
            client.send(JSON.stringify(obj));
            break;
          case "postNotification":
            obj.type = "incomingNotification";
            client.send(JSON.stringify(obj));
            break;;
          default:
            throw new Error("Unknown event type " + obj.type);
        }
      }
    })
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    connectedUsers.number = wss.clients.size;
    wss.broadcast(connectedUsers)
  });

});


