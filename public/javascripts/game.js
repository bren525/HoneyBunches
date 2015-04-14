//List of all possible games
var games = ['SprayTheMost','isThisForThat'];

//Run game code
gametime = function(users,socket,game){
	console.log('its game time!');
	//Set display variables
	$('#game-name').text(game);
	$('#user').text($('#'+ socket.id).text());
	//Loads and starts game logic
	$.getScript('../javascripts/'+game+'.js', function(){
		console.log('spray script loaded');
		init(users, socket, function (scores){
			console.log('scores', scores);
		});
	});
}

