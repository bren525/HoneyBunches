gametime = function(socket){
	console.log(socket);
	$.getScript('/javascripts/SprayTheMost.js', function(){
		init(socket);
	});
}

