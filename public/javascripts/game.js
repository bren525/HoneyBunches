//List of all possible games
var games = ['SprayTheMost','isThisForThat'];

var loadedGames = {};
//Run game code
gametime = function(users,socket){
	console.log('its game time!');
	//Set display variables
	$('#user').text($('#'+ socket.id).text());
	//Loads and starts game logic

	var stage = new createjs.Stage("demoCanvas");
	var preload = new createjs.LoadQueue();

	choose_game()

	preload.on('fileload', handleFileLoad, this);

	socket.on('new_game', function(game) {
		$('#game-name').text(game);
		if(game in loadedGames){
			console.log("Game Preloaded!");
			attachGame(loadedGames[game]);
		}else{
			preload.loadFile({id:game, src:'../javascripts/'+game+'.js'});
			console.log('Loading File!');
		}
	});

	socket.on('game_ready', function () {
		$(document).trigger('game');
		console.log('Game Starting!');
	});

	socket.on('game_unloaded', function(){
		choose_game();
	});

	function choose_game () {
		if(socket.host === true){
			game = games[Math.floor(Math.random()*games.length)];
			console.log('Playing:', game);
			socket.emit('new_game', {game:game});
		}
	}

	function handleFileLoad (event) {
		loadedGames[event.item.id] = currentGame.init;
		attachGame(loadedGames[event.item.id]);
	}

	function attachGame (gameInit) {
		$(document).on('game', gameInit(users, socket, stage,  function (scores){
			console.log('Unloading Game!');
			stage.enableDOMEvents(false);
			$("#demoCanvas").replaceWith("<canvas id='demoCanvas' width='1000' height='600'></canvas>")
			stage = new createjs.Stage("demoCanvas");
			$(document).off('game');
			createjs.Ticker.removeAllEventListeners();
			socket.removeListener('game_message');
			socket.emit('game_unloaded');
			console.log('Game unloaded!');
		}));
		socket.emit('game_ready');
		console.log('Game Ready!');
	}
};
