var $flippingName = $(".flipping-name");
var curentName = $flippingName.text();
function changeName () {
	$.get("/namespace", function (name){
		curentName = name;
		console.log(curentName);
		$flippingName.fadeOut(500, function() {
			$flippingName.text(name).fadeIn(500);
		});
	});
};

setInterval(changeName, 5000);

$flippingName.click(function () {
	console.log(curentName);
	window.location.href = window.location.href+'of/'+curentName;
});
