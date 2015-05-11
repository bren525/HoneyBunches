var currentGame = {
	init: function (users, socket, stage, callback) {
		console.log("running isthisforthat...");
		var state = "naming";

		var toRespond = Object.keys(users);
		var toVote = Object.keys(users);

		var winnerScore = 0;
		var winnerId = undefined;

		createjs.Ticker.addEventListener("tick", onTick);
		createjs.Ticker.setFPS(60);

		// timer text
		var txt2 = new createjs.Text();
		txt2.text = "15";
		txt2.font = "50px Arial";
		txt2.color = "#ffffff";
		txt2.outline = false;
		txt2.x = 10;

		var txt3 = new createjs.Text();
		txt3.text = "15";
		txt3.font = "50px Arial";
		txt3.color = "#000000";
		txt3.outline = 5;
		txt3.x = 10;

		stage.addChild(txt3);
		stage.addChild(txt2);

		// Game instructions header text 
		var header = new createjs.Text();
		header.text = "Name this fictional business:";
		header.font = "25px Arial Bold";
		header.color = "#FF00AA";
		header.textAlign = "center";
		header.x = $('#demoCanvas').width()/2;
		header.y = $('#demoCanvas').height()/10;
		header.lineWidth = 400;

		stage.addChild(header);
		var nameX =  $('#demoCanvas').width()/2 - 75-75;
		var nameY =  header.y+2.5*$('#demoCanvas').height()/10;

		// Canvas text input for naming
		var $name = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: nameX,
			y: nameY,
		});

		// background, label, and button all form a button for submission
		var background = new createjs.Shape();
		background.name = "background";
		background.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 120, 35, 5);

		var label = new createjs.Text("Submit Name", "bold 12px Arial", "black");
		label.name = "label";
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.x = 60;
		label.y = 35/2;

		var button = new createjs.Container();
		button.name = "button";
		button.x = $('#demoCanvas').width()/2 - label.getMeasuredWidth()/2 + 75;
		button.y = $name.y();
		button.addChild(background, label);

		var responseButtons = new Array();

		// Buttons to vote for responses
		function makeButtons(responses) {
			console.log('making buttons');
			for (var i = 0; i<responses.length; i++) {
				var rlabel = new createjs.Text(responses[i].name, "bold 12px Arial", "black");
				rlabel.name = responses[i].id;
				rlabel.textAlign = "center";
				rlabel.textBaseline = "middle";
				rlabel.lineWidth = 120;
				rlabel.x = 60 ;
				rlabel.y = 35/2;

				var rbackground = new createjs.Shape();
				rbackground.name = responses[i].id;
				rbackground.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 120, 35, 5);

				responseButtons.push(new createjs.Container());
				responseButtons[i].name = responses[i].id;
				responseButtons[i].addChild(rbackground, rlabel);
				responseButtons[i].x = header.x+(i % 4) * ((300 / 4) + 50);
				responseButtons[i].y = button.y + Math.floor(i / 4) * 50;
				responseButtons[i].addEventListener("click", voteClick);
				stage.addChild(responseButtons[i]);
				console.log('Add button');
			}
			stage.update();
		}

		stage.addChild(button);
		stage.update();
		button.addEventListener("click", handleClick);

		// retrieves the is this for that api item
		var txt;
		if (socket.host) {
			$.get("../isthisforthat")
			.done(function(data, status) {
				socket.emit('game message', {title: 'isThisForThat', business: data});
			});
		}

		// syncs timing with the server
		var timerTicks = 25;
		var msgTime;
		var voteTime;
		var scoreTime;
        socket.on('timer_message',function(msg){
            if(state == 'naming'){
                timerTicks = 25 - msg;
            }
            else if (state == 'voting'){
            	timerTicks = voteTime - msg;
            }
            else if (state == 'scoring') {
            	timerTicks = scoreTime - msg;
            }
			txt3.text = timerTicks.toString();
			txt2.text = timerTicks.toString();
			console.log(state, timerTicks);
			msgTime = msg;
        });

		function onTick(event){
            stage.update();
			if(state == "naming"){
				$name.render();
				$name.renderCanvas();
			}
            if ((timerTicks <= 1 || toRespond.length === 0 ) && state === "naming") {
				console.log("Voting!");
				getVoting();
			}
			if ((timerTicks <= 1 || toVote.length === 0)  && state === "voting") {
				console.log('Scoring!');
				getScore();
			}
			if (timerTicks <= 1 && state === "scoring"){
				console.log('Its game over man');
				gameOver();
			}
        }
		// end

		function handleClick(e) {
			try{
				stage.removeChild(button);
			} catch(err){
				console.log(err);
			}
			$name.destroy();
			stage.update();
			socket.emit('game message', {title: 'isThisForThat', id: socket.id, name: $name.value()})
		}

		function voteClick(e) {
			console.log("yes");
			console.log(e.target.name);
			socket.emit('game message', {title: 'isThisForThat', vote: e.target.name, id: socket.id});
			for (var i = 0; i < responseButtons.length; i++) {
				try{
					stage.removeChild(responseButtons[i]);
				} catch(err){
					console.log(err);
				}
			}
			var voteText = new createjs.Text();
			voteText.text = "You have voted";
			voteText.font = "25px Arial Bold";
			voteText.color = "#FF00AA";
			voteText.x = $('#demoCanvas').width()/2 - voteText.getMeasuredWidth()/2;
			voteText.y = button.y;
			voteText.lineWidth = 400;
			stage.addChild(voteText);
			stage.update();
		}

		var responses = [];
		var votes = [];
		socket.on('game message', function(msg) {
			if (msg.title === "isThisForThat") {
				console.log('MSG', msg);
				if (msg.name) {
					responses.push({id: msg.id, name: msg.name});
					toRespond.splice(toRespond.indexOf(msg.id), 1);

					console.log(responses);
				} else if (msg.vote) {
					if (votes[msg.vote]) {
						votes[msg.vote] += 1;
					} else {
						votes[msg.vote] = 1;
					}
					toVote.splice(toVote.indexOf(msg.id), 1);
					console.log(votes);
				} else if (msg.business) {
					txt = new createjs.Text();
					txt.text = msg.business;
					txt.textAlign = "center";
					txt.font = "20px Arial";
					txt.color = "#000000";
					txt.x = $('#demoCanvas').width()/2;
					txt.y = header.y+$('#demoCanvas').height()/10;
					txt.lineWidth = 400;
					stage.addChild(txt);
					stage.update();
				}
			}
		});

		function getVoting() {
			console.log("Vote: " + responses);
			voteTime = msgTime + 10;

			toRespond.push("Done");
			try {
				$name.destroy();
				stage.removeChild(button);
			} catch(err){
				console.log(err);
			}
			header.text = "Vote for the best name";
			stage.update();
			makeButtons(responses);
			state="voting"
		}

		function getScore() {
			stage.removeAllChildren();
			scoreTime = msgTime + 5;
			state = "scoring";
			toVote.push("Done");
			var tally = new createjs.Text("Vote Totals");
			tally.font = "20px Arial Bold";
			tally.color = "#000000";
			tally.x = 20;
			tally.lineWidth = 280;
			stage.addChild(tally);i
			console.log(votes);
			var scores = new Array();
			for (var i = 0; i < responses.length; i++) {
				console.log(responses[i].id, votes[responses[i].id]);
				if (votes[responses[i].id]) {
					scores.push(new createjs.Text(responses[i].name + ": " + votes[responses[i].id]));
					if (votes[responses[i].id] > winnerScore){
						winnerId = responses[i].id
						winnerScore = votes[responses[i].id]
					}
				} else {
					scores.push(new createjs.Text(responses[i].name + ": 0"));
				}
				scores[i].font = "20px Arial Bold";
				scores[i].color = "#FF00AA";
				scores[i].x = 20;
				scores[i].y = ((i+1) % 15) * (500 / 15);
				scores[i].lineWidth = 280;
				stage.addChild(scores[i]);
			}
			stage.update();
		}

		function gameOver(){
			stage.autoClear = true; // This must be true to clear the stage.
			stage.removeAllChildren();
			stage.update();
			state="game over"

			console.log(winnerId);
			callback([winnerId]);
		}
	}
}
