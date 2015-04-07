var namespaces = require("../public/namespaces");
var names = namespaces.names;
var sockets = require("../sockets");

var gameRooms = {};
module.exports = function(io){
  return {
    getHome: function(req, res){
      console.log("Getting Homepage");
      var name = names[Math.floor(Math.random() * names.length)];
      console.log("Initial Name is", name);
      res.render('home', {"name":name});
    },

    getNamespace: function(req, res){
      res.json(names[Math.floor(Math.random() * names.length)]);
    },

    postGameRoom: function(req, res){
      if(names.indexOf(req.params.namespace)!=-1){
        names.splice(names.indexOf(req.params.namespace), 1);
        gameRooms[req.params.namespace] = io.of(req.params.namespace);
        sockets.bindNamespace(gameRooms[req.params.namespace]);
        res.json("Sucess");
      } else {
        res.json("Error")
        console.log("That Game Room already exists :/");
      }

    },

    getLobby: function(req, res){
      req.session.namespace = req.params.namespace;
      res.render('lobby', {"namespace": req.params.namespace});
    },

    getGame: function(req, res){

    },
  }
};

