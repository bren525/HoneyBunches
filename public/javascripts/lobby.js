var $title = $('#title');
var $startButton = $('#start-button');
var host = false;

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

var namespace = $title.attr('namespace');

socket.on('new_user', function(data) {
	console.log('new');
	if (data.id === socket.id) {
		$("#users").prepend("<li id='name' type='text'>"+data.nickname+"</li><input id='editName' type='submit' value='Edit'>");
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

$(document).on('click', '#editName', function (){
	var name= $('#name').text();
	$('#name').replaceWith("<input type='text', id='name', value='" + name +"'></input>");
	$('#editName').attr('id', 'newName');
	$('#newName').attr('value', 'Submit');
})

$(document).on('click', '#newName', function (e) {
	var name = $('#name').val();
	console.log(name);
	$('#name').replaceWith("<li id='name'>"+name+"</li>");
	$('#newName').attr('id', 'editName');
	$('#editName').attr('value', 'Edit');
	socket.emit('edit_user', {id: socket.id, nickname: name});
});

function makehost(hostID) {
	$startButton.text('Start the Game');
	$startButton.click(function (e) {
		socket.emit('start_game');
	});
}

socket.on('start_game', function(msg){
	$('body').load('/game', function(){
		gametime(socket);
	});
});




