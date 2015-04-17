var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var utils = require('./sharedUtils');
var DBHandler = require('./DBHandler');

var _PORT = 3000;
//var _UPDATEINTERVAL = 300000;     //Normal interval
var _UPDATEINTERVAL = 3000;         //Debuging interval

var connectedClients = 0;

updateGUI();    //Prepare GUI
DBHandler.init(process.argv[2],process.argv[3],process.argv[4],process.argv[5],process.argv[6]);
//DBHandler.getDataForClient(function(){});

app.get('/', function(req, res){
  res.send('<h1>Info panel in development</h1>');
});

//SOCKET HANDLING
io.on('connection', function(socket){
  connectedClients++;
  updateGUI();
  sendPersonalUpdate(socket);

  socket.on('disconnect', function(){
    connectedClients--;
    updateGUI();
  });
});

http.listen(_PORT, function(){
  updateGUI();
  sendUpdate();   //Send first update right after start for to be sure :)
  setInterval(function(){sendUpdate();},_UPDATEINTERVAL);   //Set interval every _UPDATEINTERVAL miliseconds

});


function updateGUI(){
  utils.clearScreen();
  console.log('connected clients: '+connectedClients);
}

function sendPersonalUpdate(socket){
  DBHandler.getDataForClient(function(data){
    socket.emit('update',data);  //send only to connected client
  });
}

function sendUpdate(){
  DBHandler.getDataForClient(function(data){
    io.emit('update',data);  //Send data to all clients
  });
}
