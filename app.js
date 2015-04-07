var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var session = require('express-session');
var PORT = process.env.PORT || 3000;
var gameRoom = require('./routes/gameRoom');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gameRoom = require("./routes/gameRoom")(io);

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
app.get("/namespace", gameRoom.getNamespace);
app.get("/of/:namespace", gameRoom.getLobby);
app.get("/of/:namespace/game", gameRoom.getGame);

app.post("/of/:namespace", gameRoom.postGameRoom);

http.listen(PORT);

console.log("Running on", PORT);
