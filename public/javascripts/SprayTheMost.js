var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("SprayTheMost init");
        var drawing = false;
        var state = "loading";

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

        //timer text
        var txt = new createjs.Text();
        txt.text = "10";
        txt.font = "50px Arial";
        txt.color = "#000000";
        txt.outline = 5;
        txt.x = 15;
        //timer text
        var txt2 = new createjs.Text();
        txt2.text = "10";
        txt2.font = "50px Arial";
        txt2.color = "#ffffff";
        txt2.outline = false;
        txt2.x = 15;

        stage.addChild(txt);
        stage.addChild(txt2);


        var timerTicks = 10;
        socket.on('timer_message',function(msg){
            if(state == 'running'){
                //count down
                timerTicks = 10 - msg;
                txt.text = timerTicks.toString();
                txt2.text = timerTicks.toString();
            }

        });

        socket.on('game message', function(msg){
            if(msg.title == "spraythemost" && msg.type == "paint"){
                //creates a circle in the color of the corresponding user
                var circle = new createjs.Shape();
                circle.graphics.beginFill(users[msg.id].colour).drawCircle(0, 0, 20);
                circle.x = msg.position.x;
                circle.y = msg.position.y;
                stage.addChild(circle);
                stage.setChildIndex(circle,stage.getNumChildren()-3);
            }


            if(msg.title == "spraythemost" && msg.type == "state"){
                //handler for state transitions
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
            //checks for end of game
            if (socket.host == true) {
                if(timerTicks == 0 && state == 'running'){
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

        //toggles drawing state when mouse is held
        stage.on('stagemousedown',function(event){
            drawing = true;
        });
        stage.on('stagemouseup',function(event){
        	drawing = false;
        });

        //conversion to help with scoring
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
            var winner = [max.id];
            

            var wintxt = new createjs.Text();
            wintxt.text = users[max.id].nickname;
            wintxt.font = "40px Arial";
            wintxt.color = "#000000";
            wintxt.textAlign = "center";
            wintxt.x = $('#demoCanvas').width()/2;
            wintxt.y = $('#demoCanvas').height()/3;


            stage.addChild(wintxt);
            stage.update();
            console.log("winner!",users[max.id].nickname);

            createjs.Tween.get(wintxt).to({alpha:1},2000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winner);
            });
        }

        function getScore(){
        	var canvas = document.getElementById('demoCanvas');
        	var ctx = canvas.getContext('2d');
        	var image = ctx.getImageData(0,0,canvas.width,canvas.height).data;

            $.each(users,function(k,v){
                v.paintscore = 0;
            });
            //iterates over pixels to check color of each
        	for(i = 0; i < image.length; i+=4){
        		r = image[i];
        		g = image[i+1];
        		b = image[i+2];
        		a = image[i+3];
                pixelrgb = {r:r,g:g,b:b,a:a};
                //awards correct user
                $.each(users,function(k,v){
                    var userrgb = hexToRgb(v.colour);
                    if(Math.abs(pixelrgb.r - userrgb.r) < 5 && Math.abs(pixelrgb.g - userrgb.g) < 5 && Math.abs(pixelrgb.b - userrgb.b) < 5){
                        v.paintscore += 1;
                    }
                });
        	}

            var max = {"id":"none","paintscore":-1};
            $.each(users,function(k,v){

                if(v.paintscore>max.paintscore){
                    max.paintscore = v.paintscore;
                    max.id = k;
                }
            });

            socket.emit('game message',{title:'spraythemost',type:'winner',max:max});

	   }
    }
}


