var utils = require('./sharedUtils');
var request = require('request');

var _REGION = null;
var _APIKEY = null;
var _MODE = "standard";     //standard = when reached limit, will wait 30 sec, fast = no waiting, just spamming api with requests (good for batch download eg. first launch)
module.exports = exports = {

  init : function(region, apikey, mode) {
    if(region == null || apikey == null){
      utils.logToConsole("[Riot API] Region or api key not specified","error");
      process.exit(1);
    }else{
      _REGION = region;
      _APIKEY = apikey;
      if(mode == null){
        utils.logToConsole("[Riot API] Init successfull, standard mode","info");
      }else{
        _MODE = mode;
        utils.logToConsole("[Riot API] Init successfull, "+_MODE+" mode","info");
      }
    }
  },

  getMatchIDs : function(time, callback){
    getMatchIDs(time,callback);
  },

  parseMatchDetails : function(matchId,callback){
    parseMatchDetails(matchId,callback);
  },

  parseChampionDetails : function(champId,callback){
    parseChampionDetails(champId,callback);
  }
};

function getMatchIDs(time,callback){
  var url = "https://"+_REGION+".api.pvp.net/api/lol/"+_REGION+"/v4.1/game/ids?beginDate="+time+"&api_key=" + _APIKEY;
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(false,body);
    }else{
      if(response.statusCode === 429){
        if(_MODE == "standard"){
          setTimeout(function(){
            utils.logToConsole("[Riot API] Over limit, waiting 30 sec...","info");
            callback(response.statusCode,null);
          },30000); //Wait half a minute before calling callback (anti "spam" protection)
        }else if(_MODE == "fast"){
          utils.logToConsole("[Riot API] Over limit, retrying (fast mod active)...","info");
          callback(response.statusCode,null);
        }
      }else{
        utils.logToConsole('[Riot API] Wrong response (bad api key?) - error: ' + response.statusCode,'error');
        callback(response.statusCode,null);

      }
    }
  });
}

function parseMatchDetails(matchId,callback){
  var url = "https://"+_REGION+".api.pvp.net/api/lol/"+_REGION+"/v2.2/match/"+matchId+"?api_key=" + _APIKEY;
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(false,body,body.participants.length);
    }else{
      if(response.statusCode === 429){
        if(_MODE == "standard"){
          setTimeout(function(){
            utils.logToConsole("[Riot API] Over limit, waiting 30 sec...","info");
            callback(response.statusCode,null,null);
          },30000); //Wait half a minute before calling callback (anti "spam" protection)
        }else if(_MODE == "fast"){
          utils.logToConsole("[Riot API] Over limit, retrying (fast mod active)...","info");
          callback(response.statusCode,null,null);
        }
      }else{
        utils.logToConsole('[Riot API] Wrong response (bad api key?) - error: ' + response.statusCode,'error');
        callback(response.statusCode,null,null);

      }
    }
  });
}

function parseChampionDetails(champId,callback){
  var url = "https://global.api.pvp.net/api/lol/static-data/"+_REGION+"/v1.2/champion/"+champId+"?api_key=" + _APIKEY;
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(false,body);
    }else{
      if(response.statusCode === 429){
        if(_MODE == "standard"){
          setTimeout(function(){
            utils.logToConsole("[Riot API] Over limit, waiting 30 sec...","info");
            callback(response.statusCode,null);
          },30000); //Wait half a minute before calling callback (anti "spam" protection)
        }else if(_MODE == "fast"){
          utils.logToConsole("[Riot API] Over limit, retrying (fast mod active)...","info");
          callback(response.statusCode,null);
        }
      }else{
        utils.logToConsole('[Riot API] Wrong response (bad api key?) - error: ' + response.statusCode,'error');
        callback(response.statusCode,null);

      }
    }
  });
}
