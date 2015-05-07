var $title = $('#title');
var $startButton = $('#start-button');

//Create socket for namespace
var socket = io(window.location.origin+'/'+$title.attr('namespace'));
socket.host = false;
var namespace = $title.attr('namespace');

//Socket events
socket.on('new_user', function(data) {
	console.log('new', data.colour);
	if (data.id === socket.id) {
		//Add user and button to list
		$("#users").prepend("<div class='row'><div class='colorChoice' style='margin-right: 0.2em;background-color: "+ data.colour +"'></div><li class='name' id="+ data.id +" type='text'>"+data.nickname+"</li><input class='editName' type='submit' value='Edit' style='margin-left: 1em'></div>");
		socket.name = data.nickname;
	} else {
		//Add new user to list
		$("#users").append("<div class='row'><div class='colorChoice' style='margin-right: 0.2em;background-color: "+ data.colour +"'></div><li id=" + data.id + ">" + data.nickname + "</li></div>");
	}
});

socket.on('disconnect', function(msg){
	//Remove disconnected socket
	console.log("Removing", msg);
	$('#'+msg).remove();
})

socket.on('color', function(msg) {
	//Change user's color
	$('#'+msg.id).prev().css('background-color',msg.colour);
})

socket.on('change_user', function(data) {
	//Change user's nickname
	console.log(data.id, data.nickname);
	$("#" + data.id).text(data.nickname);
});

socket.on('host', function(data){
	//Book keeping for host
	console.log('New Host', data.host);
	if (data.host === socket.id){
		makehost(socket.id);
	}
});

socket.on('start_game', function(msg){
	var users = msg.users;
	console.log(users);
	//load game handlebars rendered by server and game js
	$('body').load('/game', 'namespace='+namespace , function(){
		//start game logic
		gametime(users, socket);
	});
});

//On click Events
$('.colorBlock').click(function(){
	//color block choice
	var choice = $(this).attr('id');
	socket.emit('color', {id: $('.name').attr('id'), colour:choice});
});

$(document).on('click', '.editName', function (){
	//Switch state from editing name to submit and makes text box
	console.log("clickedy clacking");
	var name= $('.name').text();
	var id = $('.name').attr('id');
	console.log(id)
	$('.name').replaceWith("<input type='text', class='name', id='"+ id +"' value='" + name +"'></input>");
	$('.editName').attr('class', 'newName');
	$('.newName').attr('value', 'Submit');
})

$(document).on('click', '.newName', function (e) {
	//Submits name change and switches back
	var name = $('.name').val();
	var id = $('.name').attr('id');
	console.log(name);
	socket.name = name;
	$('.name').replaceWith("</div><li class='name', id='"+ id +"'>"+name+"</li>");
	$('.newName').attr('class', 'editName');
	$('.editName').attr('value', 'Edit');
	socket.emit('edit_user', {id: socket.id, nickname: name});
});

//Utility Functions
function makehost(hostID) {
	//Makes host specific controls
	$startButton.text('Start the Game');
	$startButton.click(function (e) {
	socket.emit('start_game');

	});
	socket.host = true
}

