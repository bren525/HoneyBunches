var words = ["scarf", "cloud", "halloween", "pancakes", "waffles", "spaghetti", "notebook", "lollipop", "dolphin", "penguin", "autumn", "shower", "daffodil", "surfing", "sledding", "hiker", "traffic", "element", "science", "magnetic", "jumbo", "kangaroo", "bootylicious", "windows", "jubalee", "cellular", "nucleus", "whiteboard", "floral", "designate", "parade", "promenade", "toucan", "paradise", "trouble", "Beyonce", "journey", "mirage", "escalate", "esplanade", "palindrome", "daisies", "journey", "terrible", "medallion", "chemistry", "quantum", "germinate", "dessert"];
var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("running WordScramble");
        state = "running";

        var toRespond = Object.keys(users);

        var wordUnscrambled;
        var wordScrambled;

        if (socket.host == true) {
    		var temp = getScrambled(words); 
    		wordUnscrambled = temp[0];
    		wordScrambled = temp[1]; 
            socket.emit('game message', {title: 'wordscramble', type: 'word', unscrambled: wordUnscrambled, scrambled: wordScrambled});
        }      

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

        var txt = new createjs.Text();
        txt.text = "15";
        txt.font = "50px Arial";
        txt.color = "#000000";
        txt.outline = 5;
        txt.x = 15;

        var txt2 = new createjs.Text();
        txt2.text = "15";
        txt2.font = "50px Arial";
        txt2.color = "#ffffff";
        txt2.outline = false;
        txt2.x = 15;

        var w = $('#demoCanvas').width()/3;
        var h = $('#demoCanvas').height()/6;

        var $guess = new CanvasInput ({
            canvas: document.getElementById('demoCanvas'),
            fontSize: 18,
            x: w,
            y: h * 2
        });

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
        button.x = w;
        button.y = h * 3;
        button.addChild(background, label);

        button.addEventListener("click", handleClick);

        function handleClick(e) {
            stage.removeChild(button);
            $guess.destroy();
            stage.update();
            var correct;
            var val = $guess.value()
            if (val.toLowerCase() === wordUnscrambled) {
                correct = true;
            } else {
                correct = false;
            }
            console.log($guess.value(), wordUnscrambled, correct);
			socket.emit('game message', {title: 'wordscramble', type: 'guess', id: socket.id, correct: correct})
		}

        stage.addChild(txt);
        stage.addChild(txt2);
        stage.addChild(button);

        var timerTicks = 15;
        socket.on('timer_message',function(msg){
            if(state == 'running'){
                timerTicks = 15 - msg;
                txt.text = timerTicks.toString();
                txt2.text = timerTicks.toString();
            }
        });

        var winners = [];
        var end = false;
        socket.on('game message', function(msg) {
            if (msg.title == 'wordscramble' && msg.type == 'word') {
                wordUnscrambled = msg.unscrambled;
                wordScrambled = msg.scrambled;
                var wordtxt = new createjs.Text();
                wordtxt.text = wordScrambled;
                wordtxt.font = "50px Arial";
                wordtxt.color = "#000000";
                wordtxt.x = w;
                wordtxt.y = h;
                stage.addChild(wordtxt);
                stage.update();
            }
            if (msg.title == 'wordscramble' && msg.type == 'guess') {     
                toRespond.splice(toRespond.indexOf(msg.id), 1);
                if (msg.correct) {
                    winners.push(msg.id);
                }
            }
            if (msg.title == 'wordscramble' && msg.type == 'state') {
                if (msg.state == 'scoring' && end == false) {
                    displayWinners(winners);
                    end = true;
                }
            }
        })

        function onTick(event){
            stage.update();
            $guess.render();
            $guess.renderCanvas();
            if((timerTicks <= 0 || toRespond.length === 0 ) && state == 'running'){
                if (socket.host == true) {
                    socket.emit("game message",{title:'wordscramble',type:'state',state:'scoring'});
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

        function displayWinners(winners){
            stage.removeAllChildren();
            stage.update();
            try {
                $guess.destroy();
            } catch(err) {
                console.log("err destroy");
            }

            var wintxt = new createjs.Text();
            wintxt.text = "";
            wintxt.font = "40px Arial";
            wintxt.color = "#000000";
            wintxt.textAlign = "center";
            wintxt.x = $('#demoCanvas').width()/2;
            wintxt.y = $('#demoCanvas').height()/3;


            if (winners.length == 0){
                wintxt.text = 'No one solved the scramble';
            } else {
                for (var i = 0; i < winners.length; i++) {
                    console.log(users[winners[i]].nickname);
                    if (i == winners.length -1) {
                        wintxt.text += users[winners[i]].nickname;
                    } else {
                        wintxt.text += users[winners[i]].nickname + ", ";
                    }
                }
                wintxt.text += " solved the scramble";
            }


            stage.addChild(wintxt);
            stage.update();
            console.log("Win ", winners);
            
            createjs.Tween.get(wintxt).to({alpha:1},2000).call(function(){
                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();

                callback(winners);
            }); 
        }

    }
}