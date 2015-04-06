var namespaces = require("../public/namespaces");
var names = namespaces.names;

module.exports = {
  getHome: function(req, res){
    console.log("Getting Homepage");
    var name = names[Math.floor(Math.random() * names.length)];
    console.log("Initial Name is", name);
    res.render('home', {"name":name});
  },

  getNamespace: function(req, res){
    res.json(names[Math.floor(Math.random() * names.length)]);
  },

  getLobby: function(req, res){
    names.splice(names.indexOf(req.params.namespaces), 1);
    res.render('lobby', {"namespace": req.params.namespace});
  },

  getGame: function(req, res){

  },
};

