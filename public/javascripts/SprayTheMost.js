function init(users,socket,callback) {
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

    if (socket.host == true) {
        socket.emit("game state",{title:'spraythemost',state:'running'});
    }

    function onTick(event){
        stage.update();
        if (socket.host == true) {
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
    	if(drawing && state == "running"){
	    	socket.emit('game message',{title:'spraythemost',type:'paint',id:socket.id,position:{x:event.stageX,y:event.stageY}});
	    }
    });

    stage.on('stagemousedown',function(event){
            drawing = true;
    });
    stage.on('stagemouseup',function(event){
    	drawing = false;
    });

    socket.on('game message', function(msg){
        if(msg.title == "spraythemost" && msg.type == "paint"){
        	var circle = new createjs.Shape();
    		//circle.graphics.beginFill('#'+intToARGB(hashCode(msg.id).toString())).drawCircle(0, 0, 20);
            circle.graphics.beginFill(users[msg.id].colour).drawCircle(0, 0, 20);
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
        if(state == 'scoring'){
            drawing = false;
        }
    });

    function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    }

    function getScore(){
    	var canvas = document.getElementById('demoCanvas');
    	var ctx = canvas.getContext('2d');
    	var image = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    	$.each(users,function(k,v){
            v.score = 0;
        });
    	for(i = 0; i < image.length; i+=4){
    		r = image[i]
    		g = image[i+1]
    		b = image[i+2]
    		a = image[i+3]
            pixelrgb = {r:r,g:g,b:b,a:a}
            $.each(users,function(k,v){
                var userrgb = hexToRgb(v.colour);
                if(Math.abs(pixelrgb.r - userrgb.r) < 5 && Math.abs(pixelrgb.g - userrgb.g) < 5 && Math.abs(pixelrgb.b - userrgb.b) < 5){
                    v.score += 1;
                }
            });
    	}
        var scores = {}
        var max = {id="",score=0};
        $.each(users,function(k,v){
            if(v.score>max.score){
                max.score = v.score;
                max.id = k;
            }
        });
    	
        callback({max.id:max.score});
	}
}

//ED2D39
//12E491scheme
