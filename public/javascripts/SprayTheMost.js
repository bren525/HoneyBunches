var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("SprayTheMost init");
        var drawing = false;
        var state = "loading";

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
            if(msg.title == "spraythemost" && msg.type == "state"){
                state = msg.state;
                console.log(state);
                if(state == 'scoring'){
                    drawing = false;
                }
            }
            if(msg.title == "spraythemost" && msg.type == "winner"){
                displayWinner(msg.max);

            }

        });


        if (socket.host == true) {
            socket.emit("game message",{title:'spraythemost',type:'state',state:'running'});
        }

        function onTick(event){
            stage.update();
            if (socket.host == true) {
                timerTicks -= 1;
                if(timerTicks%60 == 0 && state == "running"){
                    socket.emit("game message",{title:'spraythemost',type:'time',val:(timerTicks/60)});
                }
                if(timerTicks == 0){
                    socket.emit("game message",{title:'spraythemost',type:'state',state:'scoring'});
                    state = "game over";
                    if(socket.host){
                        getScore();
                    }
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

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function displayWinner(max){

            if(max.id == "none"){
                callback();
            }

            console.log(max);
            var winner = {};
            winner[max.id] = 1;

            var wintxt = new createjs.Text();
            wintxt.text = users[max.id].nickname;
            wintxt.font = "50px Arial";
            wintxt.color = "#000000";
            wintxt.outline = 5;
            wintxt.x = 200;
            wintxt.alpha = 0;



            stage.addChild(wintxt);
            stage.update();
            console.log("winner!",users[max.id].nickname);

            createjs.Tween.get(wintxt).to({alpha:1},5000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winner);
            });
        }

        function getScore(){
            console.log(users);
        	var canvas = document.getElementById('demoCanvas');
        	var ctx = canvas.getContext('2d');
        	var image = ctx.getImageData(0,0,canvas.width,canvas.height).data;

            $.each(users,function(k,v){
                v.score = 0;
            });
        	for(i = 0; i < image.length; i+=4){
        		r = image[i];
        		g = image[i+1];
        		b = image[i+2];
        		a = image[i+3];
                pixelrgb = {r:r,g:g,b:b,a:a};
                $.each(users,function(k,v){
                    var userrgb = hexToRgb(v.colour);
                    if(Math.abs(pixelrgb.r - userrgb.r) < 5 && Math.abs(pixelrgb.g - userrgb.g) < 5 && Math.abs(pixelrgb.b - userrgb.b) < 5){
                        v.score += 1;
                    }
                });
        	}

            var max = {"id":"none","score":-1};
            $.each(users,function(k,v){

                if(v.score>max.score){
                    max.score = v.score;
                    max.id = k;
                }
            });

            socket.emit('game message',{title:'spraythemost',type:'winner',max:max});

	   }
    }
}


