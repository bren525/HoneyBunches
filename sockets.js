var request = require('request');

module.exports = {
  bindNamespace : function (nsp){
    console.log("binding functions to", nsp.name);
    nsp.on('connection', function(socket){
      getNickname(function(animal) { 
        socket.nickname = animal;
        socket.emit('new_user', {nickname: socket.nickname});
        console.log('a user connected to', nsp.name);
        socket.on('chat message', function(msg) {
          console.log('message: ' + msg);
        });
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


