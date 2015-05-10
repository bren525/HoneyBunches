var currentGame = {
	init: function (users, socket, stage, callback) {

		var state = "loading";

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

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);


        var timerTicks = 15;
        socket.on('timer_message',function(msg){
            if(state == 'running'){
                timerTicks = 15 - msg;
                txt.text = timerTicks.toString();
                txt2.text = timerTicks.toString();
                if(socket.host && timerTicks == 0){

                	state = 'scoring';
                	socket.emit('game message',{title:'outofcontrol',type:'winner',id:null});

                }
            }


        });
        //postion each player
        if(socket.host){
        	numUsers = Object.keys(users).length;
        	pos = 0;
        	$.each(users,function(k,v){

        		xperc = .85 * Math.cos((pos/numUsers)*2*Math.PI);
        		yperc = .85 * Math.sin((pos/numUsers)*2*Math.PI);
        		socket.emit("game message",{title:'outofcontrol',type:'placePlayer',id:k,x:xperc,y:yperc});
        		pos+=1;

        	});
        	// socket.emit("game message",{title:'outofcontrol',type:'state',state:'running'});
        }

        
        stage.width = $('#demoCanvas').attr('width');
        stage.height =$('#demoCanvas').attr('height')
        boardDiameter =  Math.min(stage.width,stage.height);
        console.log('boardDiam',boardDiameter);

        var board = new createjs.Shape();
        board.graphics.beginFill('#000').drawCircle(0, 0, Math.round(boardDiameter/2));
        board.x = stage.width/2;
        board.y = stage.height/2;
        stage.addChild(board);

        var target1 = new createjs.Shape();
        target1.graphics.beginFill('#00F').drawCircle(0, 0, Math.round(boardDiameter*.33));
        target1.x = stage.width/2;
        target1.y = stage.height/2;
        stage.addChild(target1);

        var target2 = new createjs.Shape();
        target2.graphics.beginFill('#F00').drawCircle(0, 0, Math.round(boardDiameter*.166));
        target2.x = stage.width/2;
        target2.y = stage.height/2;
        stage.addChild(target2);

        var target3 = new createjs.Shape();
        target3.graphics.beginFill('#FF0').drawCircle(0, 0, Math.round(boardDiameter*.04));
        target3.x = stage.width/2;
        target3.y = stage.height/2;
        stage.addChild(target3);

        

        var players = {};
        var mypos;
        socket.on('game message', function(msg){
        	if(msg.title == "outofcontrol" && msg.type == "placePlayer"){
        		console.log('placing player',msg);
        		var circle = new createjs.Shape();
                circle.graphics.beginFill(users[msg.id].colour).drawCircle(0, 0, Math.round(boardDiameter/50));
                circle.x = Math.round(boardDiameter/2 * msg.x) + stage.width/2;
                circle.y = Math.round(boardDiameter/2 * msg.y) + stage.height/2;
                stage.addChild(circle);

        		
        		players[msg.id] = {circ: circle,pos:{x:msg.x,y:msg.y}};
        		
        		if(msg.id == socket.id){
        			mypos = {x:msg.x,y:msg.y};
        			state = 'running';
        		}

        	}
        	if(msg.title == "outofcontrol" && msg.type == "posUpdate"){
        		if(msg.id != socket.id && state == 'running'){
	        		players[msg.id].pos.x = msg.postition.x;
	        		players[msg.id].pos.y = msg.postition.y;
	        		players[msg.id].circ.x = Math.round(boardDiameter/2 * msg.postition.x) + stage.width/2;
	                players[msg.id].circ.y = Math.round(boardDiameter/2 * msg.postition.y) + stage.height/2;
	            }
	            if(Math.abs(msg.postition.x-0) < .05 && Math.abs(msg.postition.y-0) < .05 && state=='running' && socket.host){
	            	socket.emit('game message',{title:'outofcontrol',type:'winner',id:msg.id});
	            	state = 'scoring';
	            }
        	}

        	if(msg.title == "outofcontrol" && msg.type == "winner"){
        		state = 'scoring';
        		if(msg.id){
        			displayWinner(msg.id,users[msg.id].nickname);
        		}else{
        			displayWinner(null, "Failure")
        		}

        	}

            if(msg.title == "outofcontrol" && msg.type == "state"){
                state = msg.state;
                console.log(state);
            }


        });
        var vel = {x:0,y:0};


        var LEFT = 65, 
		RIGHT = 68,
		UP = 87, 
		DOWN = 83;

		var directions = [0,.5*Math.PI,Math.PI,1.5*Math.PI];
		function shuffleArray(array) {
		    for (var i = array.length - 1; i > 0; i--) {
		        var j = Math.floor(Math.random() * (i + 1));
		        var temp = array[i];
		        array[i] = array[j];
		        array[j] = temp;
		    }
		    return array;
		}
		shuffleArray(directions);
		var randAngle = Math.random()*.5*Math.PI;
		
        this.document.onkeydown = function(event){
        	console.log(event.keycode)
        	switch(event.keyCode) {
				case LEFT:	
					vel = {x:Math.cos(directions[0]+randAngle),y:Math.sin(directions[0]+randAngle)};
					break;
				case RIGHT: 
					vel = {x:Math.cos(directions[1]+randAngle),y:Math.sin(directions[1]+randAngle)};
					break;
				case UP: 
					vel = {x:Math.cos(directions[2]+randAngle),y:Math.sin(directions[2]+randAngle)};
					break;
				case DOWN: 
					vel = {x:Math.cos(directions[3]+randAngle),y:Math.sin(directions[3]+randAngle)};
					break;
			}
			
        }


		var ticks = 0;       	
        function onTick(event){
            stage.update();
            if(state == 'running'){
            	mypos.x+= .01*vel.x;
            	mypos.y+= .01*vel.y;

            	players[socket.id].circ.x = Math.round(boardDiameter/2 * mypos.x) + stage.width/2;
	            players[socket.id].circ.y = Math.round(boardDiameter/2 * mypos.y) + stage.height/2;

            
	            if(ticks%3 == 0){
	            	socket.emit("game message",{title:'outofcontrol',type:'posUpdate',id:socket.id,postition:mypos});
	            }
	            ticks+=1;
	        }
        }

        function displayWinner(winid,text){

            
            var winner = [winid];
            

            var wintxt = new createjs.Text();
            wintxt.text = text;
           	wintxt.font = "40px Arial";
            wintxt.color = "#000000";
            wintxt.textAlign = "center";
            wintxt.x = $('#demoCanvas').width()/2;
            wintxt.y = $('#demoCanvas').height()/3;




            stage.addChild(wintxt);
            stage.update();
            

            createjs.Tween.get(wintxt).to({alpha:1},2000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winner);
            });
        }      
	}
}