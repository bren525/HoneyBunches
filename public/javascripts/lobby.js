var $title = $('#title');
var $boop = $('#boop');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

console.log(window.location.origin+'/'+$title.attr('namespace'));

$boop.click(function (e) {
	$('body').append('<canvas id="demoCanvas" width="500" height="300"></canvas>');
	$.getScript('/javascripts/SprayTheMost.js', function(){
		init(socket);
	});
});


