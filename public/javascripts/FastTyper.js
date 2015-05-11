var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("FastTyper init");
        var state = "loading";

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

        if (socket.host == true) {
            socket.emit("game message",{title:'fasttyper',type:'state',state:'running'});
        }

        function onTick(event){
            stage.update();
        }

        //variables for use
        var alph = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var count = 0
        var tracker = {}

        //generates all the on screen alphabets
        for (user in users) {
            tracker[user] = alph.slice(0);
            for (i=0;i<alph.length;i++) {
                var letter = new createjs.Text(alph[i],"20px Arial", "#000000");
                letter.x = 50*(i % 13 + 1);
                if (i<13) {
                    letter.y = 50+100*count;
                } else {
                    letter.y = 75+100*count;
                }
                letter.name = String(i)+"-"+user;
                letter.color = users[user].colour;
                stage.addChild(letter);
                stage.update();
            }
            count+=1
        };

        //checks if every letter in alphabet has been hit (replaced by 0)
        allValuesSame = function(l) {
            for(var i = 1; i < l.length; i++)
            {
                if(l[i] !== l[0])
                    return false;
            }
            return true;
        }     

        //detects letter pressed and sends info to other players
        $(document).keydown( function(e){
            var keyCode = e.keyCode-65;
            var access = tracker[socket.id];
            if (access[keyCode] != 0) {
                socket.emit('game message',{title:'fasttyper',type:'typing',user:socket.id,keyCode:keyCode});
                access[keyCode] = 0;
                tracker[socket.id] = access;
            }
            //checks for wins
            if (allValuesSame(tracker[socket.id])) {
                socket.emit('game message',{title:'fasttyper',type:'winner',winner:[socket.id]});
            }  
        });

        //handler for recieved messages
        socket.on('game message', function(msg){
            //removes letter pressed by a player
            if(msg.title == "fasttyper" && msg.type == "typing"){
                stage.removeChild(stage.getChildByName(String(msg.keyCode)+"-"+msg.user));
            }
            //transitions states
            if(msg.title == "fasttyper" && msg.type == "state"){
                state = msg.state;
                console.log(state);
            }
            //triggers winning animation
            if(msg.title == "fasttyper" && msg.type == "winner" && state == 'running'){
                displayWinner(msg.winner[0]);
                state = 'scoring';
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
            wintxt.font = "40px Arial";
            wintxt.color = "#000000";
            wintxt.textAlign = "center";
            wintxt.x = $('#demoCanvas').width()/2;
            wintxt.y = $('#demoCanvas').height()/3;



            stage.addChild(wintxt);
            stage.update();
            console.log("winner!",users[winner].nickname);

            createjs.Tween.get(wintxt).to({alpha:1},5000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback([winner]);
            });
        }
    }
}


