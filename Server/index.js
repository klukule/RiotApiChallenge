var sqlite3 = require('sqlite3').verbose();
var request = require("request");

var _DBNAME = 'rapich.db';
var _APIKEY = '60a2b004-49b0-4d6a-9d86-f4e8f253561d';
var _STARTDATE = 1427932800;

var _CURRENTDATE = _STARTDATE;
var _NOW = Math.floor( Date.now() / 1000 );
var done = false;


updateDB();
showDataInDB();


function showDataInDB(){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.each("SELECT rowid AS matchid, dataLoaded FROM matches", function(err, row) {
      console.log(row.matchid);
    });
  });
  db.close();
}
function updateDB(){

  //Load all data to DB (update it)
  while(_CURRENTDATE < _NOW){
    done = false;                           // reset done
    loadMatchIDs(_CURRENTDATE);             //load new batch
    while(!done) {
      require('deasync').runLoopOnce();     //Wait until is done
    }
    lastUpdateDate(_CURRENTDATE);           //Update last adition date
    console.log("added "+ _CURRENTDATE);    //Log it
    _CURRENTDATE += 300;                    //Add five minutes
    _NOW = Math.floor( Date.now() / 1000 ); //Update current date
  }
}
function lastUpdateDate(unixTime){
  var db = new sqlite3.Database(_DBNAME);

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS lastAdition (ladate INTEGER PRIMARY KEY UNIQUE)");
    var dateAdd = db.prepare("INSERT OR REPLACE INTO lastAdition VALUES (?)");
    dateAdd.run(unixTime);
    dateAdd.finalize();
  });
  db.close();
}
function loadMatchIDs(unixTime){
    //Create request URL
    var url = "https://eune.api.pvp.net/api/lol/eune/v4.1/game/ids?beginDate="+unixTime+"&api_key=" + _APIKEY;

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
            done = true;
          });
        });
      }else{
        console.log("Error occured while reading data from Riot api");
      }

    });
}
