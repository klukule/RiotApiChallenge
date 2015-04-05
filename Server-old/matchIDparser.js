var sqlite3 = require('sqlite3').verbose();
var request = require("request");
var moment = require('moment');

var _DBNAME = process.argv[3];
var _APIKEY = process.argv[4];
var _STARTDATE = 1427932800;
var _OVERTIME = 420;                                            //Thanks to API and some issues :)
var _REGION = process.argv[2];

var _CURRENTDATE = _STARTDATE;
var _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;

updateDB();


function showDataInDB(){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.each("SELECT rowid AS matchid, dataLoaded FROM matches", function(err, row) {
      console.log(row.matchid);
    });
  });
  db.close();
}

var date;

function updateDB(){
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
      setLastUpdateDate(_CURRENTDATE);                                                        //Update last adition date
      var frmDate = moment(new Date(_CURRENTDATE*1000)).format('MMMM Do YYYY, h:mm:ss a');
      console.log("added "+ _CURRENTDATE + " - " + frmDate);                                  //Log it
      _CURRENTDATE += 300;                                                                    //Add five minutes
      _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                       //Update current date
    }else{
      var frmDate = moment(new Date(_CURRENTDATE*1000)).format('MMMM Do YYYY, h:mm:ss a');
      console.log("skipped:" + _CURRENTDATE + " - " + frmDate);
      _CURRENTDATE += 300;                                                                    //Add five minutes
      _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                       //Update current date
    }
  }
  console.log("All data downloaded waiting five minuts for more");
  setTimeout(function() {
    _NOW = Math.floor( Date.now() / 1000 )-_OVERTIME;                                       //Update current date
    updateDB();
}, 300000);
}

function processMatches(){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.each("SELECT rowid AS matchid, dataLoaded FROM matches", function(err, row) {
      if(row.dataLoaded = 0){
        //Create request URL
        var url = "https://"+_REGION+".api.pvp.net/api/lol/"+_REGION+"/v2.2/match/"+row.matchid+"?api_key=" + _APIKEY;
        //HANDLE REQUEST
        request({
          url: url,
          json: true
        }, function (error, response, body) {
          //Check if everything is OK
          if (!error && response.statusCode === 200) {
            console.log(body);
          }
        });
      }
    });
  });
  db.close();
}
function getLastUpdateDate(cb){
  var db = new sqlite3.Database(_DBNAME);
  db.serialize(function() {
    db.each("SELECT rowid AS ladate FROM lastAdition", function(err, row) {
      if(err.errno = 1){
        date = 0;
      } else{
        date = row.ladate;
      }
    });
  });
  db.close(cb());
}

function setLastUpdateDate(unixTime){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS lastAdition");
    db.run("CREATE TABLE IF NOT EXISTS lastAdition (ladate INTEGER PRIMARY KEY UNIQUE)");
    var dateAdd = db.prepare("REPLACE INTO lastAdition VALUES (?)");
    dateAdd.run(unixTime);
    dateAdd.finalize();
  });
  db.close();
}

function loadMatchIDs(unixTime, done){
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
      var db = new sqlite3.Database(_DBNAME);

      //Start DB serialization
      db.serialize(function() {

        //Check if table exist otherwise create
        db.run("CREATE TABLE IF NOT EXISTS matches (matchid INTEGER PRIMARY KEY UNIQUE, dataLoaded INTEGER)");
        //Prepare command
        var dataAdd = db.prepare("INSERT OR IGNORE  INTO matches VALUES (?, ?)");

        //Place data into DB
        for(var k in body) {
          dataAdd.run(body[k],0);
        }
        //Finalize
        dataAdd.finalize();
        //Close DB
        db.close(function(){
          done();
        });
      });
    }else{
      done();
      console.log("Error occured while reading data from Riot api");
    }
  });
}
