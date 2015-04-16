var RiotApi = require('./RiotApi');
var DBHandler = require('./DBHandler');
var utils = require('./sharedUtils');

utils.clearScreen();
RiotApi.init(process.argv[2],process.argv[3],process.argv[4]);
DBHandler.init(process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9]);

var time = 1427933400;      //Default start time - First set of URF matches
var endTime = 1428918000;   //Ending of URF
var curTime = Math.floor( Date.now() / 1000 )-450;        //-300 for five minutes bucket and -150 for give API time to process last five minutes

DBHandler.getLatestParsedMatchSet(time,function(myTime){time = myTime;});      //Update start date

startParsing();

DBHandler.disconnect();

function startParsing(){
  var working = true;
  utils.logToConsole("[Match ID Parser] Parsing started","info");
  while(working){
    curTime = Math.floor( Date.now() / 1000 )-450;    //Update current time
    var done = false;
    if(time < curTime && time < endTime+1){   //+1 for nah for to me to be lazy to write less and equal :)
      RiotApi.getMatchIDs(time,function(err,out){
        if(!err){
          DBHandler.parseMatches(time,out,function(){
            time += 300;
          });
        }
        done = true;
      });
      while(!done){
        require('deasync').sleep(100);
      }
    }
    else{
        utils.logToConsole("[Match ID Parser] All updated waiting for more data","info");
        console.log(time);
        console.log(endTime);
        if(time == endTime+300){ //+300 cause last successfull querry added 300 :)
          working = false;
          done = true;
        }
        setTimeout(function(){
          done = true;
        },300000);


        while(!done){
          require('deasync').sleep(100);
        }
    }
  }
}
  utils.logToConsole("[Match ID Parser] Everything has been parsed","info");
  utils.paktc();
