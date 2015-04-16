var RiotApi = require('./RiotApi');
var DBHandler = require('./DBHandler');
var utils = require('./sharedUtils');

var endTime = 1428918000;   //Ending of URF

utils.clearScreen();
RiotApi.init(process.argv[2],process.argv[3],process.argv[4]);
DBHandler.init(process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9]);

startParsing();

DBHandler.disconnect();

function startParsing(){
  var working = true;
  utils.logToConsole("[Game Data Parser] Parsing started","info");
  while(working){
    var done = false;
    DBHandler.loadNotParsedMatchID(endTime,function(err,response){
      if(!err){
        RiotApi.parseMatchDetails(response,function(err,details){
          DBHandler.parseMatchDetails(details,function(){
            done = true;
          })
        })
      }else{
        if(err == 1){
          working = false;
          done = true;
        }else if(err == 0){
          setTimeout(function(){
            done = true;
          },300000);
        }
      }
      while(!done){
        require('deasync').sleep(100);
      }
    }
  }
}
