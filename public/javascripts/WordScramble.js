var words = ["scarf", "cloud", "halloween", "pancakes", "waffles", "spaghetti", "notebook", "lollipop", "dolphin", "penguin", "autumn", "shower", "daffodil", "surfing", "sledding", "hiker", "traffic", "element", "science", "magnetic", "jumbo"];
var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("running WordScramble");
        state = "running";
		var temp = getScrambled(words); 
		var wordUnscrambled = temp[0];
		var wordScrambled = temp[1];      

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

        var txt = new createjs.Text();
        txt.text = "30";
        txt.font = "50px Arial";
        txt.color = "#000000";
        txt.outline = 5;
        txt.x = 15;

        var txt2 = new createjs.Text();
        txt2.text = "30";
        txt2.font = "50px Arial";
        txt2.color = "#ffffff";
        txt2.outline = false;
        txt2.x = 15;

        var wordtxt = new createjs.Text()
        wordtxt.text = wordScrambled;
        wordtxt.font = "50px Arial";
        wordtxt.color = "#000000";
        wordtxt.outlilne = 5;
        wordtxt.x = 200;
        wordtxt.y = 100;

        var background = new createjs.Shape();
		background.name = "background";
		background.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 220, 50, 10);

		var label = new createjs.Text("Submit My Guess", "bold 20px Arial", "black");
		label.name = "label";
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.x = 220/2;
		label.y = 50/2;

		var button = new createjs.Container();
		button.name = "button";
		button.x = 200;
		button.y = 300;
		button.addChild(background, label);

		button.addEventListener("click", handleClick);

		function handleClick(e) {
			stage.removeChild(button);
			stage.update();
			socket.emit('game message', {title: 'wordscramble', id: socket.id})
		}

        stage.addChild(txt);
        stage.addChild(txt2);
        stage.addChild(wordtxt);
        stage.addChild(button);

        var timerTicks = 30;
        socket.on('timer_message',function(msg){
            if(state == 'running'){
                timerTicks = 30 - msg;
                txt.text = timerTicks.toString();
                txt2.text = timerTicks.toString();
            }
        });

        function onTick(event){
            stage.update();
            if (socket.host == true) {
                if(timerTicks == 0 && state == 'running'){
                    socket.emit("game message",{title:'wordscramble',type:'state',state:'scoring'});
                    state = "game over";
                    if(socket.host){
                        getScore();
                    }
                }
            }
        }

        function getScrambled(words){
        	var myWord = words[getRandomInt(0, words.length)];
        	var scrambled = shuffle(myWord.split(''));
        	var unsplit = "";
        	for (var i = 0; i < scrambled.length; i++) {
        		unsplit = unsplit + scrambled[i];
        	}
        	return [myWord, unsplit]; 
        }

        // knuth shuffle algorithm found here: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		function shuffle(array) {
			var currentIndex = array.length, temporaryValue, randomIndex ;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		}

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		}

    }
}