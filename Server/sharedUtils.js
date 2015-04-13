var colors = require('colors/safe');

module.exports =
{
  logToConsole: function (content, type)
  {
    if(type == "error"){
      console.log(colors.red(content));
    }else if(type == "info"){
      console.log(colors.green(content));
    }else if(type == "stackTrace"){
      console.log(colors.bgRed.italic(content));
    }else{
      console.log(content);
    }
  },

  clearScreen: function(){
    process.stdout.write('\033c');      //Super awesome escape sequence (only one which is working on windows :D)
  },

  paktc : function(){
    console.log('Press any key to exit...');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
  }
};

var privateFunction = function ()
{
};
