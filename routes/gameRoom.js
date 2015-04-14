var namespaces = require("../public/namespaces");
var names = namespaces.names;
var sockets = require("../sockets");
var colors = ['#f76d3c','#f7d842','#f15f74', '#5481e6','#913ccd','#839098','#98cb4a','#2ca8c2'];

var gameRooms = {};
module.exports = function(io){
  return {
    //Get Requests
    getHome: function(req, res){
      //Get homepage with a random honey bunch
      console.log("Getting Homepage");
      var name = names[Math.floor(Math.random() * names.length)];
      console.log("Initial Name is", name);
      res.render('home', {"name":name});
    },

    getNamespace: function(req, res){
      //Returns random namespace name from our list
      res.json(names[Math.floor(Math.random() * names.length)]);
    },

    getLobby: function(req, res){
      //Renders lobby page
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

    getGame: function(req, res){
      //Render game page
      req.session.namespace = req.query.namespace;
      req.session.save();
      var clients = io.of(req.query.namespace).connected;
      var users = []
      Object.keys(clients).forEach(function (key) {
        users.push({"id": key, "nickname": clients[key].nickname, "colour": clients[key].colour, "score":'0'})
      });
      res.render('gameroom', {"namespace": req.query.namespace, "users":users, "mainuser":'None', "game":'Waiting'});
    },

    //Post Requests
    postGameRoom: function(req, res){
      //Makes a namespace people can play in
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
  }
};

