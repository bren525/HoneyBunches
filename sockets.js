module.exports = {
  bindNamespace : function (nsp){
    console.log("binding functions to", nsp.name);
    nsp.on('connection', function(socket){
      console.log('a user connected to', nsp.name);
      socket.on('game message', function(msg) {
        nsp.emit('game message',msg);
      });
      socket.on('disconnect', function(){
        console.log('user disconnected from', nsp.name);
      });
    });
  }
};
