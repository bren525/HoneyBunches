var $title = $('#title');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

var namespace = $title.attr('namespace');

socket.on('new_user', function(data) {
	console.log(data.nickname);
	$("#users").prepend("<li>" + data.nickname + "</li><input type='submit' value='Edit Username'>");
});

console.log(window.location.origin+'/'+$title.attr('namespace'));
