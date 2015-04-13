var $title = $('#title');
var $boop = $('#boop');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

var namespace = $title.attr('namespace');

socket.on('new_user', function(data) {
	console.log(data.nickname);
	$("#users").prepend("<li>" + data.nickname + "</li><input type='submit' value='Edit Username'>");
});
socket.on('host', function(data){
	if (data.host === socket.id){
		console.log("I'm the host bitch");
	}
})

console.log(window.location.origin+'/'+$title.attr('namespace'));
$boop.click(function (e) {
	$('body').load('/game', function(){
		gametime(socket);
	});
});


