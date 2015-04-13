var RiotApi = require('./RiotApi');
var DBHandler = require('./DBHandler');
var utils = require('./sharedUtils');

utils.clearScreen();
RiotApi.init(process.argv[2],process.argv[3],process.argv[4]);
DBHandler.init(process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9]);

startParsing();

DBHandler.disconnect();

function startParsing(){
  utils.logToConsole("[Game Data Parser] Parsing started","info");
  while(true){
    
  }
}
