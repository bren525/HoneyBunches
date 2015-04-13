function init(socket) {
    console.log("running...");
    var stage = new createjs.Stage("demoCanvas");
    var drawing = false;

    // createjs.Ticker.removeAllEventListeners();
    // createjs.Ticker.reset();
    // createjs.Ticker._inited = false;
    // createjs.Ticker.init();
    
    createjs.Ticker.addEventListener("tick", onTick);
    createjs.Ticker.setFPS(60);

    var txt = new createjs.Text();
    txt.text = "10";
    txt.font = "50px Arial";
    txt.color = "#000000";
    txt.outline = 5;
    txt.x = 15;

    var txt2 = new createjs.Text();
    txt2.text = "10";
    txt2.font = "50px Arial";
    txt2.color = "#ffffff";
    txt2.outline = false;
    txt2.x = 15;

    timerTicks = 0;
    time = 10;
    state ="running"

    stage.addChild(txt);
    stage.addChild(txt2);

    function onTick(event){
        console.log(createjs.Ticker.getTime())
        if(time > 0){
            timerTicks += 1;
            time = 10 - Math.floor(timerTicks/60);
            txt.text = time;
            txt2.text = time;
            stage.update();
        }
        if (time == 0 && state == "running"){
                //createjs.Ticker.off("tick",listener)
                state = "game over";
                getScore();   
        }

    }


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

    socket.on('game message', function(msg){
    	var circle = new createjs.Shape();
		circle.graphics.beginFill('#'+intToARGB(hashCode(msg.id).toString())).drawCircle(0, 0, 20);
		circle.x = msg.position.x;
		circle.y = msg.position.y;
    	stage.addChild(circle);
        //stage.addChildAt(circle,stage.getNumChildren()-2);
        stage.setChildIndex(circle,stage.getNumChildren()-3);
    	
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