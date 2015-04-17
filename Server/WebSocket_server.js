var io = require('socket.io')(process.argv[0]);

io.on('connection', function(socket){
  console.log('a user connected');
});
