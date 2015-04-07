var socket=io();

// $('form').submit(function(){
// 	socket.emit('chat message',$('#m').val());
// 	$('#m').val('');
// 	return false;
// });
// socket.on('chat message', function(msg){
// 	$('#messages').append($('<li>').text(msg));
// });

function init() {
    var stage = new createjs.Stage("demoCanvas");
    var drawing = false;
    
	createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.setFPS(60);

    stage.on('stagemousemove', function(event){
    	//console.log(event.stageX, event.stageY,socket.id);
    	if(drawing){
	    	socket.emit('game message',{title:'spraythemost',id:socket.id,position:{x:event.stageX,y:event.stageY}});
	    }
    });

    stage.on('stagemousedown',function(event){
    	drawing = true;
    });
    stage.on('stagemouseup',function(event){
    	drawing = false;
    });

    function hashCode(str) { // java String#hashCode
	    var hash = 0;
	    for (var i = 0; i < str.length; i++) {
	       hash = str.charCodeAt(i) + ((hash << 5) - hash);
	    }
	    return hash;
	}	 

	function intToARGB(i){
    	return	((i>>16)&0xFF).toString(16) + 
				((i>>8)&0xFF).toString(16) + 
				(i&0xFF).toString(16);
	}


	var myColor =  

    socket.on('game message', function(msg){
    	var circle = new createjs.Shape();
		circle.graphics.beginFill('#'+intToARGB(hashCode(msg.id).toString())).drawCircle(0, 0, 20);
		circle.x = msg.position.x;
		circle.y = msg.position.y;
    	stage.addChild(circle);

    	
    });
    $("#score").click(function(){
    	getScore();
    });

    function getScore(){
    	var canvas = document.getElementById('demoCanvas');
    	var ctx = canvas.getContext('2d');
    	var image = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    	totals = {}
    	for(i = 0; i < image.length; i+=4){
    		r = image[i]
    		g = image[i+1]
    		b = image[i+2]
    		a = image[i+3]
    		rgb = image[i].toString()+ ','+ image[i+1].toString() +','+image[i+2].toString();
    		if(rgb in totals){
    			totals[rgb] += 1;
    		}else{
    			totals[rgb] = 1;
    		}
    		
    	}
    	console.log(totals)
	}

}

//ED2D39
//12E491scheme