var $title = $('#title');
var $boop = $('#boop');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

console.log(window.location.origin+'/'+$title.attr('namespace'));

$boop.click(function (e) {
	$('body').html('<canvas id="demoCanvas" width="500" height="300"></canvas><script type="text/javascript" src="../../javascripts/game.js"></script><!--<link rel="stylesheet" type="text/css" href="stylesheets/game.css">-->');
	gametime(socket);
});


