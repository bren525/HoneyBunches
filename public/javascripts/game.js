//List of all possible games
var games = ['isThisForThat'];

var $canvas = $('#demoCanvas');
var $canvasContainer= $('#canvasContainer')


var loadedGames = {};
//Run game code
gametime = function(users,socket){
	console.log('its game time!');
	//Set display variables
	$('#user').text($('#'+ socket.id).text());
	//Loads and starts game logic

	/*
	var width = $('#canvasContainer').width();
	console.log('width', $('#canvasContainer').width());
	console.log('height', $('#canvasContainer').height());

	$canvasContainer.append("<canvas id='demoCanvas' width='"+$('#canvasContainer').width()+"' height='"+$('#canvasContainer').height()+"'/>");
*/


	$('#demoCanvas').attr({width:$(window).width()*.85, height:$(window).height()*.9});

	console.log($canvas.attr('width'));
	console.log($canvas.attr('height'));

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
		console.log('Game Starting!');
		$(document).trigger('game');
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

			width = $canvasContainer.width();
			height = $canvasContainer.height();
			$("#demoCanvas").replaceWith("<canvas id='demoCanvas' width='"+width+"' height='"+height+"'></canvas>");
			stage = new createjs.Stage("demoCanvas");

			$(document).off('game');
			createjs.Ticker.removeAllEventListeners();
			socket.removeListener('game message');
			createjs.Ticker.addEventListener("tick",createjs.Tween);
			socket.emit('game_unloaded');
			console.log('Game unloaded!');
		}));
		socket.emit('game_ready');
		console.log('Game Ready!');
	}
};
