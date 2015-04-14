var request = require('request');
var users = {};
module.exports = {
  //Function to call to bind functions to each new namespace
  bindNamespace : function (nsp){
    nsp.on('connection', function(socket){
      if(Object.keys(nsp.connected).length === 1){
        nsp.host = socket.id;
        socket.emit('host', {host: socket.id});
      }
      getNickname(function(animal) {
        //What to do after getting the nickname
        socket.nickname = animal;

        socket.colour = '#000000';

        //Add user to users object

        users[socket.id] = {nickname: socket.nickname, colour:socket.colour};
        nsp.emit('new_user', {id: socket.id, nickname: socket.nickname, colour: socket.colour});
        console.log('a user connected to', nsp.name);
        socket.on('game message', function(msg) {
          //Repeat all game messages
          nsp.emit('game message',msg);
        });
        socket.on('game state', function(msg) {
          //Repeat all game state changes
          nsp.emit('game state',msg);
        });
        socket.on('start_game', function(msg) {
          //Repeat all game starts
          nsp.emit('start_game',{users: users, game: msg.game});
        });
        socket.on('game time', function(msg) {
          nsp.emit('game time',users);
        });
        socket.on('edit_user', function(msg) {
          //Update nickname and repeat it
          socket.nickname = msg.nickname;
          users[socket.id].nickname=socket.nickname;
          nsp.emit('change_user', msg);
        });
        socket.on('color', function(msg) {
          //Update color and repeat it
          socket.colour = msg.colour;
          users[socket.id].colour = socket.colour;
          nsp.emit('color', msg);
        });
        socket.on('disconnect', function(){
          console.log('user disconnected from', nsp.name);
          nsp.emit('disconnect', socket.id);
          if(nsp.host === socket.id){
            var userIds = Object.keys(users)
            nsp.host = userIds[Math.floor(Math.random()*userIds.length)];
            console.log("new host", nsp.host);
            nsp.emit('host', {host: nsp.host});
          }
          delete users[socket.id];
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


