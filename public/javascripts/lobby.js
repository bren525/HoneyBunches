var $title = $('#title');
var $boop = $('#boop');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

var namespace = $title.attr('namespace');

socket.on('new_user', function(data) {
	console.log('new');
	if (data.id === socket.id) {
		$("#users").prepend("<input id='name' type='text' value='" + data.nickname +"'></li><input id='newName' type='submit' value='Submit Nickname'>");
	} else {
		$("#users").append("<li id=" + data.id + ">" + data.nickname + "</li>");
	}
});

socket.on('change_user', function(data) {
	console.log(data.id, data.nickname);
	$("#" + data.id).text(data.nickname);
})

$(document).on('click', '#newName', function (e) {
	var name = $('#name').val();
	console.log(name);
	socket.emit('edit_user', {id: socket.id, nickname: name});
})

console.log(window.location.origin+'/'+$title.attr('namespace'));

$boop.click(function (e) {
	$('body').html('<canvas id="demoCanvas" width="500" height="300"></canvas><script type="text/javascript" src="../../javascripts/game.js"></script><!--<link rel="stylesheet" type="text/css" href="stylesheets/game.css">-->');
	gametime(socket);
});


