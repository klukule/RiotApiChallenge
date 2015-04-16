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

  getLatestParsedMatchSet : function(start,callback){
    getLatestParsedMatchSet(start,callback);
  },

  getLatestUnparsedMatchID: function (endTime,callback){
    getLatestUnparsedMatchID(endTime,callback);
  },

  parseChampionData : function(participantData,championData,callback){
    parseChampionData(participantData,championData,callback);
  },
  setMatchParsed : function(matchId,callback){
    setMatchParsed(matchId,callback);
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

function getLatestParsedMatchSet(startDate,callback){
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
  if(output == null){
    output = startDate;
  }
  callback(output);
}

function getLatestUnparsedMatchID(endTime,callback){

  var done = false;
  var error = false;        //0 = No more matches in DB but there will be more so wait, 1 = No more in DB but there will be no more data
  var matchId = null;

  var curTime = Math.floor( Date.now() / 1000 )-450;        //-300 for five minutes bucket and -150 for give API time to process last five minutes

  connection.query('SELECT COUNT(*) FROM `match`', function(err, result) {
    if(err){
      utils.logToConsole(err.stack,"stackTrace");
    }else{
      if(result['COUNT(*)'] == 0 ){
        if(curTime < endTime + 1){
          error = 0;
          done = true;
        }else{
          error = 1;
          done = true;
        }
      }else{
        connection.query('SELECT MIN(matchId) FROM `match` WHERE dataParsed = 0 LIMIT 1', function(err, result) {
          if(err){
            utils.logToConsole(err.stack,"stackTrace");
          }
          else{
            matchId = result[0]['MIN(matchId)'];
          }
          done = true;
        });
      }
    }
  });

  while(!done){
    require('deasync').sleep(100);
  }
  callback(error,matchId);
}


function parseChampionData(participantData,championData,callback){
  var chName = championData.name;
  var chId = championData.id;
  var chKey = championData.key;
  var chWinner = participantData.stats.winner;
  var chKills = participantData.stats.kills;
  var chDeaths = participantData.stats.deaths;
  var chWins = 0;
  var chDefeats = 0;

  connection.query('SELECT COUNT(championId) FROM championdata WHERE championId = ?',chId,function(err,result){
    if(err){
      utils.logToConsole(err.stack,"stackTrace");
      callback();
    }else{
      if(chWinner){
          chWins++;
      }else{
        chDefeats++;
      }
      if(result[0]['COUNT(championId)'] == 0){
        connection.query("INSERT IGNORE INTO championdata VALUES(?,?,?,?,?,?,?)", [chId, chName,chKey,chKills,chDeaths,chWins,chDefeats], function(err,result){
          if(err){
            utils.logToConsole(err.stack,"stackTrace");
          }
          callback();
        });
      }else{
        connection.query("UPDATE championdata SET kills = kills + ?,  deaths = deaths + ?,  wins = wins + ?, defeats = defeats + ? WHERE championId = ?", [chKills,chDeaths,chWins,chDefeats,chId],  function(err,result){
          if(err){
            utils.logToConsole(err.stack,"stackTrace");
          }
          callback();
        });
      }
    }
  });
}


function setMatchParsed(matchId,callback){
  connection.query("UPDATE `match` SET dataParsed = 1 WHERE matchId = ?",[matchId],function(err,result){
    callback();
  });
}
