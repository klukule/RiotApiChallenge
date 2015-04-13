var utils = require('./sharedUtils');
var mysql = require('mysql');

var _HOST = null;
var _PORT = null;
var _DB = null;
var _USER = null;
var _PASS = null;

var connection = null;

module.exports = exports = {
  init : function(host,port,db,user,pass){
    if(host == null || port == null || db == null || user == null || pass == null){
      utils.logToConsole("[DB Handler] Some creditals are missing","error");
      process.exit(1);
    }else{
      _HOST = host;
      _PORT = port;
      _DB = db;
      _USER = user;
      _PASS = pass;
      utils.logToConsole("[DB Handler] Init successfull","info");
      connect();
    }

  },
  disconnect : function(){
    disconnect();
  },

  parseMatches : function(time,matches,callback){
    parseMatches(time,matches,callback);
  },

  getLatestParsedMatchSet : function(callback){
    getLatestParsedMatchSet(callback);
  }
};

function connect(){
  connection = mysql.createConnection({
    host     : _HOST,
    port     : _PORT,
    user     : _USER,
    password : _PASS,
    database : _DB
  });

  connection.connect(function(err) {
    if (err) {
      utils.logToConsole("[DB Handler] Can't connect to DB (is mysql runnig?)","error");
      utils.logToConsole(err.stack,"stackTrace");
      return;
    }
    utils.logToConsole("[DB Handler] Connection to DB("+_DB+","+_HOST+":"+_PORT+") established","info");
  });
}

function parseMatches(time,matches,callback){
  var referenceCount = matches.length;
  var actualCount = 0;
  matches.forEach(function (match) {
    var query = connection.query('INSERT IGNORE INTO `match` VALUES (?,0,?)',[match,time], function(err, result) {
      if(err){
        utils.logToConsole(err.stack,"stackTrace");
        actualCount++;
      }else{
        actualCount++;
      }
    });

  });
  while(actualCount < referenceCount){
    require('deasync').sleep(100);
  }
  utils.logToConsole("[DB Handler] "+("0" + referenceCount).slice(-2)+" matches for time "+time+" parsed");
  callback();
}

function disconnect(){
  connection.end();
}

function getLatestParsedMatchSet(callback){
  var done = false;
  var output = 0;
  connection.query('SELECT COUNT(*) FROM `match`', function(err, result) {
    if(err){
      utils.logToConsole(err.stack,"stackTrace");
    }else{
      if(result['COUNT(*)'] == 0 ){
        output = 0;
        done = true;
      }else{
        connection.query('SELECT MAX(matchTime) FROM `match`', function(err, result) {
          output = result[0]['MAX(matchTime)'];
          done = true;
        });
    }
  }
});
while(!done){
  require('deasync').sleep(100);
}
callback(output);
}
