var $title = $('#title');
var $startButton = $('#start-button');
var host = false;

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

var namespace = $title.attr('namespace');

socket.on('new_user', function(data) {
	console.log('new', data.colour);
	if (data.id === socket.id) {
		$("#users").prepend("<li class='name' id="+ data.id +" type='text'><div class='colorChoice' style='background-color: "+ data.colour +"'></div>"+data.nickname+"</li><input id='editName' type='submit' value='Edit'>");
	} else {
		$("#users").append("<li id=" + data.id + "><div class='colorChoice' style='background-color: "+ data.colour +"'></div>" + data.nickname + "</li>");
	}
});

socket.on('host', function(data){
	if (data.host === socket.id){
		console.log('I am the host bitch')
		makehost(socket.id);
	}
});

$('.colorBlock').click(function(){
	var choice = $(this).attr('id');
	socket.emit('color', {id: $('.name').attr('id'), colour:choice});
});


socket.on('color', function(msg) {
	$('#'+msg.id).children('.colorChoice').css('background-color',msg.colour);
	console.log(msg);
})

socket.on('change_user', function(data) {
	console.log(data.id, data.nickname);
	$("#" + data.id).text(data.nickname);
});

$(document).on('click', '.editName', function (){
	var name= $('.name').text();
	$('.name').replaceWith("<input type='text', class='name', value='" + name +"'></input>");
	$('.editName').attr('class', 'newName');
	$('.newName').attr('value', 'Submit');
})

$(document).on('click', '.newName', function (e) {
	var name = $('.name').val();
	console.log(name);
	$('.name').replaceWith("<li class='name'>"+name+"</li>");
	$('.newName').attr('class', 'editName');
	$('.editName').attr('value', 'Edit');
	socket.emit('edit_user', {id: socket.id, nickname: name});
});

function makehost(hostID) {
	$startButton.text('Start the Game');
	$startButton.click(function (e) {
		socket.emit('start_game');
	});
	host = true
}

socket.on('start_game', function(msg){
	$('body').load('/game', 'namespace='+namespace, function(){
		gametime(socket,host);
	});
});
