function init(socket,host) {
    console.log("SprayTheMost init");
    var stage = new createjs.Stage("demoCanvas");
    var drawing = false;
    var state = "loading";

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

    stage.addChild(txt);
    stage.addChild(txt2);


    var timerTicks = 600;

    if (host == true) {
        socket.emit("game state",{title:'spraythemost',state:'running'});
    }

    function onTick(event){
        if(state == "running"){
            stage.update();
        }
        if (host == true) {
            timerTicks -= 1;
            if(timerTicks%60 == 0 && state == "running"){
                console.log((timerTicks/60));
                socket.emit("game message",{title:'spraythemost',type:'time',val:(timerTicks/60)});
            }
            if(timerTicks == 0){
                socket.emit("game state", {title:'spraythemost',state:"scoring"});
                state = "game over";
                getScore();
            }
        }
    }
    


    stage.on('stagemousemove', function(event){
    	//console.log(event.stageX, event.stageY,socket.id);
    	if(drawing){
	    	socket.emit('game message',{title:'spraythemost',type:'paint',id:socket.id,position:{x:event.stageX,y:event.stageY}});
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
        if(msg.title == "spraythemost" && msg.type == "paint"){
        	var circle = new createjs.Shape();
    		circle.graphics.beginFill('#'+intToARGB(hashCode(msg.id).toString())).drawCircle(0, 0, 20);
    		circle.x = msg.position.x;
    		circle.y = msg.position.y;
        	stage.addChild(circle);
            stage.setChildIndex(circle,stage.getNumChildren()-3);
        }

        if(msg.title == "spraythemost" && msg.type == "time"){
            txt.text = msg.val.toString();
            txt2.text = msg.val.toString();
        }
    	
    });

    socket.on('game state', function(msg){
        state = msg.state;
        console.log(state);
    });

    socket.on('time tracker', function(msg){
       console.log('tracking time'); 
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