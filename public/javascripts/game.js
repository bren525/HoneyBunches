//List of all possible games

var games = ['OutOfControl'];



var $canvas = $('#demoCanvas');
var $canvasContainer= $('#canvasContainer')


var loadedGames = {};
//Run game code
gametime = function(users,socket){
	console.log('its game time!');
	//Set display variables
	$('#user').text($('#'+ socket.id).text());
	//Loads and starts game logic


	$('#demoCanvas').attr({width:$(window).width()*.8, height:$(window).height()*.8});


	console.log($canvas.attr('width'));
	console.log($canvas.attr('height'));
	//Scoring reset
	$.each(users,function(k,v){
		v.score = 0;
	});
	console.log(users);
	var scoreMult = 1;


	var stage = new createjs.Stage("demoCanvas");
	var preload = new createjs.LoadQueue();

	preload.on('fileload', handleFileLoad, this);
	preload.on('error', handleLoadError, this);
	preload.on('fileprogress', handleFileProgress, this);
	preload.on('filestart', handleFileStart, this);

	choose_game()


	socket.on('new_game', function(game) {
		$('#game-name').text(game);
		if(game in loadedGames){
			console.log("Game Preloaded!");
			attachGame(loadedGames[game]);
		}else{
			preload.removeAll();
			preload.loadFile({id:game, src:'../javascripts/'+game+'.js', loadNow:true});
			console.log("All files loaded?", preload.loaded);
			console.log("Next file to load", preload.next);
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
		console.log("Game loaded, attaching");
		attachGame(loadedGames[event.item.id]);
	}

	function handleLoadError (event){
		console.log("LOAD ERRRROROROROROR");
	}

	function handleFileProgress (event){
		console.log("amount loaded", event.loaded);
	}

	function handleFileStart (event){
		console.log("Loading Started!!!");
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
			updateScores(scores);
		}));
		socket.emit('game_ready');
		console.log('Game Ready!');
	}

	function updateScores(scores){
		console.log("updating scores", scores);
		$.each(scores,function(i,v){
			console.log(users[v].score);
			users[v].score= users[v].score + 1;
			$('#'+v+' div').text(users[v].score.toString());
		});
		$('#user').text($('#'+ socket.id).text());
		console.log('users',users);
		//update score multiplier
	}
};
