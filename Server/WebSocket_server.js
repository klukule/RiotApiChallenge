var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var utils = require('./sharedUtils');

var _PORT = 3000;
var _UPDATEINTERVAL = 300000;

var connectedClients = 0;


//SOCKET HANDLING
io.on('connection', function(socket){
  connectedClients++;
  updateGUI();

  socket.emit('update',"Prvni varka");

  socket.on('disconnect', function(){
    connectedClients--;
    updateGUI();
  });
});
http.listen(_PORT, function(){
  updateGUI();
  sendUpdate();   //Send first update
  setInterval(function(){sendUpdate();},_UPDATEINTERVAL);   //Set interval every _UPDATEINTERVAL miliseconds

});


function updateGUI(){
  utils.clearScreen();
  console.log('connected clients: '+connectedClients);
}

function sendUpdate(){
  io.emit("update","dalsi data");
}
