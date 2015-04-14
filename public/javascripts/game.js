var games = ['SprayTheMost'];
gametime = function(users, socket,host){
	console.log('its game time!');
	var game = games[Math.floor(Math.random() * games.length)];
	console.log(game);
	$('#user').text($('#'+ socket.id).text());
	$.getScript('../javascripts/'+game+'.js', function(){
		console.log('spray script loaded');
		init(users, socket, function (scores){
			console.log('scores', scores);
		});
	});
}

