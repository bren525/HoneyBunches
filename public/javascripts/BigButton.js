var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("BigButton init");
        var state = "loading";

        button = new createjs.Shape();
        button.graphics.beginFill("red").drawCircle(stage.width/2, stage.height/2, 200);
        stage.addChild(button);
        stage.update();

		button.addEventListener("click", function(event) { 
			socket.emit('game message',{title:'bigbutton', type:'winner', winner:{id:socket.id}});
		});

        socket.on('game message', function(msg){
            if(msg.title == "bigbutton" && msg.type == "state"){
                state = msg.state;
                console.log(state);
                if(state == 'scoring'){
                    drawing = false;
                }
            }
            if(msg.title == "bigbutton" && msg.type == "winner"){
                displayWinner(msg.winner);
            }
        });


        if (socket.host == true) {
            socket.emit("game message",{title:'bigbutton',type:'state',state:'running'});
        }

        function displayWinner(winner){

            if(winner.id == "none"){
                callback();
            }

            console.log('winner: '+ winner);

            var wintxt = new createjs.Text();
            wintxt.text = users[winner.id].nickname;
            wintxt.font = "50px Arial";
            wintxt.color = "#000000";
            wintxt.outline = 5;
            wintxt.x = 200;
            wintxt.alpha = 0;



            stage.addChild(wintxt);
            stage.update();
            console.log("winner!",users[winner.id].nickname);

            createjs.Tween.get(wintxt).to({alpha:1},5000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winner);
            });
        }
    }
}


