//List of all possible games
var games = ['SprayTheMost','isThisForThat'];

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

	socket.on('new_game', function(game){
		$('#game-name').text(game);
		preload.loadFile({src = '../javascripts/'+game+'.js'});
	});

	socket.on('game_ready', function () {
		$(document).trigger('game');
	});

	socket.on('game_unloaded', function(){
		choose_game();
	});

	function choose_game () {
		if(socket.host === true){
			game = games[Math.floor(Math.random()*games.length)];
			socket.emit('new_game', {game:game});
		}
	}

	function handleFileLoad (){
		$(document).on('game', init(users, socket, stage,  function (scores){
			console.log('scores', scores);
			stage.enableDOMEvents(false);
			$("#demoCanvas").replaceWith("<canvas id='demoCanvas' width='1000' height='600'></canvas>")
			stage = new createjs.Stage("demoCanvas");
			$(document).off('game');
			createjs.Ticker.removeAllEventListeners();
			socket.removeListener('game_message');
			socket.emit('game_unloaded');
		}));
		socket.emit('game_ready');
	}
};

