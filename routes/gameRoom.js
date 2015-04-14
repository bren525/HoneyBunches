var namespaces = require("../public/namespaces");
var names = namespaces.names;
var sockets = require("../sockets");
var colors = ['#f76d3c','#f7d842','#f15f74', '#5481e6','#913ccd','#839098','#98cb4a','#2ca8c2'];

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
      req.session.save();
      var clients = io.of(req.params.namespace).connected;
      var users = []
      Object.keys(clients).forEach(function (key) {
        users.push({"id": key, "nickname": clients[key].nickname, "colour": clients[key].colour});
      });
      console.log(users);
      res.render('lobby', {"namespace": req.params.namespace, "users": users, "colors": colors});
    },

    editUser: function(req, res){
      console.log(req.body);
    },

    getGame: function(req, res){
      req.session.namespace = req.query.namespace;
      req.session.save();
      var clients = io.of(req.query.namespace).connected;
      var users = []
      Object.keys(clients).forEach(function (key) {
        users.push({"id": key, "nickname": clients[key].nickname, "score":'0'})
      });
      res.render('gameroom', {"namespace": req.query.namespace, "users":users, "mainuser":'None', "game":'Waiting'});
    },
  }
};

