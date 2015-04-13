var request = require('request');

module.exports = {
  bindNamespace : function (nsp){
    nsp.on('connection', function(socket){
      if(Object.keys(nsp.connected).length === 1){
        nsp.host = socket.id;
        socket.emit('host', {host: socket.id});
      }
      getNickname(function(animal) {
        socket.nickname = animal;
        nsp.emit('new_user', {id: socket.id, nickname: socket.nickname});
        console.log('a user connected to', nsp.name);
        socket.on('game message', function(msg) {
          nsp.emit('game message',msg);
        });
        socket.on('game state', function(msg) {
          nsp.emit('game state',msg);
        });
        socket.on('start_game', function(msg) {
          nsp.emit('start_game',msg);
        });
        socket.on('edit_user', function(msg) {
          console.log(msg);
          nsp.connected[msg.id].nickname = msg.nickname;
          nsp.emit('change_user', msg);
        })
        socket.on('disconnect', function(){
          console.log('user disconnected from', nsp.name);
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


