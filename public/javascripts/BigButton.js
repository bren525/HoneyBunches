var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("BigButton init");
        var state = "loading";

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

        if (socket.host == true) {
            socket.emit("game message",{title:'bigbutton',type:'state',state:'running'});
        }

        function onTick(event){
            stage.update();
        }

        button = new createjs.Shape();
        button.graphics.beginFill("red").drawCircle(0, 0, 100);
        button.x = Math.floor(Math.random() * (stage.canvas.width - 100))+100;
        button.y = Math.floor(Math.random() * (stage.canvas.height - 100))+100;
        stage.addChild(button);
        stage.update();

		button.addEventListener("click", function(event) { 
			socket.emit('game message',{title:'bigbutton', type:'winner', winner:socket.id});
		});

        socket.on('game message', function(msg){
            if(msg.title == "bigbutton" && msg.type == "state"){
                state = msg.state;
                console.log(state);
            }
            if(msg.title == "bigbutton" && msg.type == "winner"){
                stage.removeChild(button);
                displayWinner(msg.winner);
            }
        });

        function displayWinner(winner){

            if(winner == "none"){
                console.log('no winner')
                callback();
            }

            console.log('winner: '+ winner);

            var wintxt = new createjs.Text();
            wintxt.text = users[winner].nickname;
            wintxt.font = "50px Arial";
            wintxt.color = "#000000";
            wintxt.outline = 5;
            wintxt.x = 200;
            wintxt.alpha = 0;



            stage.addChild(wintxt);
            stage.update();
            console.log("winner!",users[winner].nickname);

            createjs.Tween.get(wintxt).to({alpha:1},5000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winner);
            });
        }
    }
}


