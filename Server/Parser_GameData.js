var RiotApi = require('./RiotApi');
var DBHandler = require('./DBHandler');
var utils = require('./sharedUtils');

var endTime = 1428918000;   //Ending of URF

utils.clearScreen();
RiotApi.init(process.argv[2],process.argv[3],process.argv[4]);
DBHandler.init(process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9]);

startParsing();

//DBHandler.getLatestUnparsedMatchID(endTime, function(err,response){ console.log(err);console.log(response);});

DBHandler.disconnect();

function startParsing(){
  var working = true;
  utils.logToConsole("[Game Data Parser] Parsing started","info");
  while(working){
    var done = false;
    var finalParseCount = 1; // just a temp val for not to allow to just jump next
    var parsedCount = 0;
    DBHandler.getLatestUnparsedMatchID(endTime,function(err,response){

      if(!err){
        utils.logToConsole("[Game Data Parser] Parsing match "+ response,"info");

        RiotApi.parseMatchDetails(response,function(err,details,parseCount){
          if(!err){
            finalParseCount = parseCount;
            details.participants.forEach(function(participantInfo){
              var champDataParsed = false;
              RiotApi.parseChampionDetails(participantInfo.championId,function(err,championInfo){
                DBHandler.parseChampionData(participantInfo,championInfo,function(){
                  utils.logToConsole("[Game Data Parser] Champ "+("0" + parsedCount).slice(-2)+ " data updated","other");
                  champDataParsed = true;
                });
                parsedCount++;
              });
              while(!champDataParsed){
                require('deasync').sleep(100);
              }
            });
            while(parsedCount != finalParseCount) {
              require('deasync').sleep(100);
            }
            DBHandler.setMatchParsed(response,function(){done = true;});
          }else{
            done = true;
          }
        });
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
    });
  }
}
