gametime = function(socket){
	console.log(socket);
	$.getScript('/javascripts/isThisForThat.js', function(){
		init(socket);
	});
}

