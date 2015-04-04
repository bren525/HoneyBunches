var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var PORT = process.env.PORT || 3000;
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var gameRoom = require('./routes/gameRoom');

mongoose.connect(mongoURI);

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.get("/", gameRoom.getHome);
/*
app.get("/:namespace", gameRoom.getLobby);
app.get("/:namespace/game", gameRoom.getGame); */

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg) {
  	console.log('message: ' + msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(PORT);
