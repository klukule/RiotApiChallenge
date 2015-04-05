var sqlite3 = require('sqlite3').verbose();
var request = require("request");
var moment = require('moment');

var _REGION = process.argv[2];
var _DBNAME = process.argv[3];
var _APIKEY = process.argv[4];
var _STARTDATE = 1427932800;
var _OVERTIME = 420;                                            //Thanks to API and some processing :) :)

var _CURRENTDATE = _STARTDATE;
var _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;

updateDB();

function showDataInDB(){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.each("SELECT rowid AS matchid, dataLoaded FROM matches", function(err, row) {
      if(err == null){
        console.log("error reading from DB");
      }else{
        console.log("Match: id(" + row.matchid + ") data parsed ?: "+row.dataLoaded);
      }
    });
  });
  db.close(function(derr){});
}

var date;
var sucessfullyParsed = false;
function updateDB(){
  sucessfullyParsed = false;
  getLastUpdateDate(function(){});
  while(date === undefined){
    require('deasync').runLoopOnce();
  }
  while(_CURRENTDATE < _NOW){

    if(date < _CURRENTDATE){
      var done = false;                                                                       // reset done
      loadMatchIDs(_CURRENTDATE, function(){done = true;});                                   //load new batch
      while(!done) {
        require('deasync').runLoopOnce();                                                     //Wait until is done
      }
      if(sucessfullyParsed){
        setLastUpdateDate(_CURRENTDATE);                                                        //Update last adition date
        clearScreen();
        console.log("[URF MATCH ID PARSER] added "+ _CURRENTDATE);                                  //Log it

        _CURRENTDATE += 300;                                                                    //Add five minutes
        _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                       //Update current date
      }else{
        console.log("[URF MATCH ID PARSER] DB error "+ _CURRENTDATE + " repeating ");                                  //Log it

      }
    }else{
      //var frmDate = moment(new Date(_CURRENTDATE*1000)).format('MMMM Do YYYY, h:mm:ss a');
      clearScreen();
      console.log("[URF MATCH ID PARSER] skipped:" + _CURRENTDATE);

      _CURRENTDATE += 300;                                                                    //Add five minutes
      _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                       //Update current date
    }
  }
  clearScreen();
  console.log("All data updated waiting five minuts for more");
  setTimeout(function() {
    _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                         //Update current date
    updateDB();
  }, 300000);
}

function getLastUpdateDate(cb){
  var db = new sqlite3.Database(_DBNAME, function(derr){});
  db.serialize(function() {
    db.each("SELECT rowid AS ladate FROM lastAdition", function(err, row) {
      if(err != null){
        date = 0;
      } else{
        date = row.ladate;
      }
    });
  });
  db.close(function(derr){cb();});
}

function setLastUpdateDate(unixTime){
  var db = new sqlite3.Database(_DBNAME, function(derr){});

  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS lastAdition", function(derr){});
    db.run("CREATE TABLE IF NOT EXISTS lastAdition (ladate INTEGER PRIMARY KEY UNIQUE)", function(derr){});
    var dateAdd = db.prepare("REPLACE INTO lastAdition VALUES (?)", function(derr){});
    dateAdd.run(unixTime);
    dateAdd.finalize();
  });
  db.close(function(derr){});
}

function loadMatchIDs(unixTime, done){
  var prepDone = false;
  var runDone = false;
  //Create request URL
  var url = "https://"+_REGION+".api.pvp.net/api/lol/"+_REGION+"/v4.1/game/ids?beginDate="+unixTime+"&api_key=" + _APIKEY;

  //HANDLE REQUEST
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    //Check if everything is OK
    if (!error && response.statusCode === 200) {

      //Open DB
      var db = new sqlite3.Database(_DBNAME, function(derr){});

      //Start DB serialization
      db.serialize(function() {

        //Check if table exist otherwise create
        db.run("CREATE TABLE IF NOT EXISTS matches (matchid INTEGER PRIMARY KEY UNIQUE, dataLoaded INTEGER)", function(derr){});
        //Prepare command
        var dataAdd = db.prepare("INSERT OR IGNORE  INTO matches VALUES (?, ?)",function(perr){
          if(perr == null){
            prepDone = true;
          }else{
            prepDone = false;
          }
        });

        //Place data into DB
        for(var k in body) {
          dataAdd.run(body[k],0,function(rerr){
            if( runDone = true && rerr == null){     //Error will handle to end
              runDone = true;
            }else{
              runDone = false;
            }
          });
        }
        //Finalize
        dataAdd.finalize();
        //Close DB
        db.close(function(err){
          if(prepDone == true & runDone == true){
            sucessfullyParsed = true;
          }
          done();
        });
      });
    }else{
      if(prepDone == true & runDone == true){
        sucessfullyParsed = true;
      }
      done();
      console.log("Error occured while reading data from Riot api");
    }
  });
}

function clearScreen(){
  //process.stdout.write('\033c');      //Super op escape sequence :) propably only which works with windows
}
