//List of all possible games
var games = ['SprayTheMost','isThisForThat'];

//Run game code
gametime = function(users,socket){
	console.log('its game time!');
	//Set display variables
	$('#user').text($('#'+ socket.id).text());
	//Loads and starts game logic

	var stage = new createjs.Stage("demoCanvas");
	console.log(stage);
	play_game()

	function play_game () {
		if(socket.host === true){
			game = games[Math.floor(Math.random()*games.length)];
			socket.emit('new_game', {game:game});
		}
	}

	socket.on('new_game', function(game){
		$('#game-name').text(game);
		$(document).on('game', $.getScript('../javascripts/'+game+'.js', function(){
			init(users, socket, stage,  function (scores){
				console.log('scores', scores);
				stage.enableDOMEvents(false);
				$("#demoCanvas").replaceWith("<canvas id='demoCanvas' width='1000' height='600'></canvas>")
				stage = new createjs.Stage("demoCanvas");
				$(document).off('game');
				createjs.Ticker.removeAllEventListeners();
				play_game();
			});
			$(document).trigger('game');
		}))
	});
};

