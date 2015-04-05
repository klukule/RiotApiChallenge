var sqlite3 = require('sqlite3');
var request = require("request");
var moment = require('moment');

var _REGION = process.argv[2];
var _DBNAME = process.argv[3];
var _APIKEY = process.argv[4];

//process.stdout.write('\033c');
updateDB();
//showDataInDB();

function showDataInDB(){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.each("SELECT rowid AS champName, champID, playedGames,kills,deaths FROM champStatistics", function(err, row) {
      if(err.errno = 1){
        console.log("error reading from DB");
      }
      else{
        console.log("champion summary: "+row.champName + "("+row.champID+") played: "+row.playedGames+"x K/D: " + row.kills + "/"+ row.deats);
      }
    });
  });
  db.close();
}


function updateDB(){
  while(true){
    processMatch();
  }
}




function processMatch(){
  clearScreen();
  var matchID = 0;
  var processedCount = 0;
  var finalCount = 1;              //Just a temp value so it can be runned as non async func
  var db = new sqlite3.Database(_DBNAME, function(dberr){
    if(dberr != null){
      processedCount = finalCount;      //Anti stuck

      console.log(dberr);
    }
  });
  db.serialize(function() {
    db.get("SELECT rowid AS matchid, dataLoaded FROM matches WHERE dataLoaded = 0", function(err, row) {
      if(err == null){
        //console.log(row);
        if(row.dataLoaded == 0){
          console.log("parsing data for match "+ row.matchid);
          //Create request URL
          var matchUrl = "https://"+_REGION+".api.pvp.net/api/lol/"+_REGION+"/v2.2/match/"+row.matchid+"?api_key=" + _APIKEY;
          matchID = row.matchid;
          //HANDLE REQUEST
          request({
            url: matchUrl,
            json: true
          }, function (error, response, matchData) {
            //Check if everything is OK
            if (!error && response.statusCode === 200) {
              finalCount = matchData.participants.length;
              matchData.participants.forEach(function(participant) {
                //Create request URL
                var staticUrl = "https://global.api.pvp.net/api/lol/static-data/"+_REGION+"/v1.2/champion/"+participant.championId+"?api_key=" + _APIKEY;
                //HANDLE REQUEST
                request({
                  url: staticUrl,
                  json: true
                }, function (error, response, champData) {
                  //Check if everything is OK
                  if (!error && response.statusCode === 200) {
                    db.run("CREATE TABLE IF NOT EXISTS championData (championId INTEGER PRIMARY KEY UNIQUE, championName TEXT,championKey TEXT,kills INTEGER,deaths INTEGER,wins INTEGER,losts INTEGER)", function(myerr){});

                    var wins = 0;
                    var losts = 0;
                    if(participant.stats.winner){
                      wins = 1;
                    }
                    else{
                      losts = 1;
                    }
                    db.get("SELECT COUNT(championId) FROM championData WHERE championId = ?",champData.id,function(err2,row2){

                      if(row2 == undefined || row2['COUNT(championId)'] == 0  ){
                        db.run("INSERT OR IGNORE INTO championData VALUES(?,?,?,?,?,?,?)", champData.id, champData.name,champData.key,participant.stats.kills,participant.stats.deaths,wins,losts, function(erra){
                          if(erra == undefined){
                            processedCount++;
                            console.log("Statistics data for "+champData.name + ", match: "+ row.matchid +" sucessfully added");
                          }else{
                            processedCount = finalCount;      //Anti stuck

                            console.log(erra);
                          }
                        });
                      }
                      else{
                        db.run("UPDATE championData SET kills = kills + ?,  deaths = deaths + ?,  wins = wins + ?, losts = losts + ? WHERE championId = ?", participant.stats.kills , participant.stats.deaths, wins, losts, champData.id,  function(erru){
                          if(erru == undefined){
                            console.log("Statistics data for "+champData.name + ", match: "+ row.matchid +" sucessfully updated");
                            processedCount++;

                          }else{
                            processedCount = finalCount;      //Anti stuck

                            console.log(erru);
                          }
                        });
                      }
                    });
                    /*console.log("Champion: " + champData.name + "("+champData.id+","+champData.key+")");
                    console.log("Winner: " + participant.stats.winner);
                    console.log("Kills: " +participant.stats.kills);
                    console.log("Deaths: " +participant.stats.deaths);
                    console.log("-----");*/
                  }else{
                    processedCount = finalCount;      //Anti stuck

                    console.log("static api error");
                  }
                });
              });

            }else{
              processedCount = finalCount;      //Anti stuck

              console.log("error parsing data from Riot api")
            }
          });
        }else{
          processedCount = finalCount;      //Anti stuck
          console.log("no more data to parse");
        }
      }else{
        processedCount = finalCount;      //Anti stuck

        console.log("db error, retrying");
      }
    });
  });
  while(processedCount != finalCount) {
    require('deasync').runLoopOnce();
  }
  db.run("UPDATE matches SET dataLoaded = 1 WHERE matchid = ?",matchID);
  db.close();
}

function clearScreen(){
  process.stdout.write('\033c');      //Super op escape sequence :) propably only which works with windows
}
