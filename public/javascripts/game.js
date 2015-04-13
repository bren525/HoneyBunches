gametime = function(socket,host){
	console.log('its game time!');
	$.getScript('/javascripts/SprayTheMost.js', function(){
		console.log('spray script loaded');
		init(socket,host);
	});
}

