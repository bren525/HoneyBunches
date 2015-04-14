
var $flippingName = $(".flipping-name");
var curentName = $flippingName.text();

//Change Honey Bunches of _____
function changeName () {
	$.get("/namespace", function (name){
		curentName = name;
		console.log(curentName);
		$flippingName.fadeOut(500, function() {
			$flippingName.text(name).fadeIn(500);
		});
	});
};

//Set Timer
setInterval(changeName, 2500);

//On Click for creating namespace and redirect
$flippingName.click(function () {
	console.log(curentName);
	$.post("/of/"+curentName, function () {
		window.location.href = window.location.href+'of/'+curentName;
	})
});
