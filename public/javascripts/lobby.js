var $title = $('#title');
var $boop = $('#boop');
var host = false;

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

socket.on('host', function(data){
	if (data.host === socket.id){
		console.log('I am the host bitch')
		makehost(socket.id);
	}
});

socket.on('change_user', function(data) {
	console.log(data.id, data.nickname);
	$("#" + data.id).text(data.nickname);
});

$(document).on('click', '#newName', function (e) {
	var name = $('#name').val();
	console.log(name);
	socket.emit('edit_user', {id: socket.id, nickname: name});
});

function makehost(hostID) {
	$boop.text('Start the Game');
	$boop.click(function (e) {
		socket.emit('start_game');
	});
}

socket.on('start_game', function(msg){
	$('body').load('/game', function(){
		gametime(socket);
	});	
});




