var request = require('request');
module.exports = {
  //Function to call to bind functions to each new namespace
  bindNamespace : function (nsp){
    nsp.users={}
    nsp.waiting = [];
    nsp.on('connection', function(socket){
      if(Object.keys(nsp.connected).length === 1){
        nsp.host = socket.id;
        socket.emit('host', {host: socket.id});
      }
      getNickname(function(animal) {
        //What to do after getting the nickname
        socket.nickname = animal;

        socket.colour = getColour();

        //Add user to users object

        nsp.users[socket.id] = {nickname: socket.nickname, colour:socket.colour};
        nsp.emit('new_user', {id: socket.id, nickname: socket.nickname, colour: socket.colour});
        console.log('a user connected to', nsp.name);
        socket.on('game message', function(msg) {
          //Repeat all game messages
          nsp.emit('game message',msg);
        });

        socket.on('start_game', function(msg) {
          //Repeat all game starts
          nsp.emit('start_game',{users: nsp.users});
        });
        socket.on('new_game', function(msg){
          //Repeat game to play
          nsp.emit('new_game',msg.game);
        })
        socket.on('game_unloaded', function(msg){
          clearInterval(nsp.timer);
          nsp.waiting.splice(nsp.waiting.indexOf(socket.id),1);
          console.log('game unloaded:', nsp.waiting);
          if(nsp.waiting.length === 0){
            nsp.emit('game_unloaded');
          }
        });
        socket.on('game_ready', function(msg) {
          nsp.waiting.push(socket.id);
          console.log('game ready', nsp.waiting);
          if(nsp.waiting.length === Object.keys(nsp.users).length){
            nsp.emit('game_ready');
            nsp.timerValue = 0;
            nsp.timer = setInterval(function(){
              nsp.emit('timer_message',++nsp.timerValue);
              console.log(nsp.timerValue);
            },1000);
          }
        })
        socket.on('game time', function(msg) {
          nsp.emit('game time',nsp.users);
        });
        socket.on('edit_user', function(msg) {
          //Update nickname and repeat it
          socket.nickname = msg.nickname;
          nsp.users[socket.id].nickname=socket.nickname;
          nsp.emit('change_user', msg);
        });
        socket.on('color', function(msg) {
          //Update color and repeat it
          socket.colour = msg.colour;
          nsp.users[socket.id].colour = socket.colour;
          nsp.emit('color', msg);
        });
        socket.on('disconnect', function(){
          console.log('user disconnected from', nsp.name);
          nsp.emit('disconnect', socket.id);
          if(nsp.host === socket.id){
            var userIds = Object.keys(nsp.users)
            nsp.host = userIds[Math.floor(Math.random()*userIds.length)];
            console.log("new host", nsp.host);
            nsp.emit('host', {host: nsp.host});
          }

          delete nsp.users[socket.id];
          if(Object.keys(nsp.users).length === 0){
            delete nsp
          }
        });
      });
    });
  }
};

function getNickname (done) {
  request('http://www.whimsicalwordimal.com/api/animal', function (err, response, body) {
    if (!err && response.statusCode == 200) {
      var animal = JSON.parse(body).animal;
      done(animal);
    } else {
      done("Anonymous");
    }
  })
}

var colors = ['#f76d3c','#f7d842','#f15f74', '#5481e6','#913ccd','#839098','#98cb4a','#2ca8c2'];
function getColour () {
  var i = getRandomInt(0, colors.length);
  var color = colors[i];
  colors.splice(i,1);
  return color;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

