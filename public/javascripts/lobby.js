var $title = $('#title');

var socket = io(window.location.origin+'/'+$title.attr('namespace'));

console.log(window.location.origin+'/'+$title.attr('namespace'));
