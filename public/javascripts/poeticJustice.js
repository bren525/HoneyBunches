var currentGame = {
	init: function (users, socket, stage, callback) {
		console.log("running poeticJustice...");

		var toRespond = Object.keys(users);
		var toVote = Object.keys(users);
		console.log('OOGBLOOG', toRespond, toVote);

		var winnerScore = 0;
		var winnerId = undefined;

		// time from spray the most
		createjs.Ticker.addEventListener("tick", onTick);
		createjs.Ticker.setFPS(60);

		var txt2 = new createjs.Text();
		txt2.text = "90";
		txt2.font = "50px Arial";
		txt2.color = "#ffffff";
		txt2.outline = false;
		txt2.x = 10;

		var txt3 = new createjs.Text();
		txt3.text = "90";
		txt3.font = "50px Arial";
		txt3.color = "#000000";
		txt3.outline = 5;
		txt3.x = 10;

		state ="naming"

		stage.addChild(txt3);
		stage.addChild(txt2);

		var header = new createjs.Text();
		header.text = "Write the best haiku about:";
		header.font = "25px Arial Bold";
		header.color = "#FF00AA"
		header.x = $('#demoCanvas').width()/2 - header.getMeasuredWidth()/2;
		header.y = $('#demoCanvas').height()/10;
		header.lineWidth = 400;

		stage.addChild(header);
		var L1X =  $('#demoCanvas').width()/2 - 150 -75 ;
		var L1Y =  header.y+1.5*$('#demoCanvas').height()/8;

		var $L1 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L1X,
			y: L1Y,
			width:300,
		});

		var L2X =  $('#demoCanvas').width()/2 - 150-75;
		var L2Y =  L1Y+1.5*$('#demoCanvas').height()/16;

		var $L2 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L2X,
			y: L2Y,
			width:300,
		});

		var L3X =  $('#demoCanvas').width()/2 - 150-75;
		var L3Y =  L2Y+1.5*$('#demoCanvas').height()/16;

		var $L3 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L3X,
			y: L3Y,
			width:300,
		});

		var background = new createjs.Shape();
		background.name = "background";
		background.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 120, 35, 5);

		var label = new createjs.Text("Submit Haiku", "bold 12px Arial", "black");
		label.name = "label";
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.x = 60;
		label.y = 35/2;

		var button = new createjs.Container();
		button.name = "button";
		button.x = $('#demoCanvas').width()/2 - label.getMeasuredWidth()/2 + 150;
		button.y = $L2.y();
		button.addChild(background, label);

		var responseButtons = new Array();

		function makeButtons(responses) {
			console.log('making buttons');
			for (var i = 0; i<responses.length; i++) {
				var rlabel = new createjs.Text(responses[i].poem[0], "bold 12px Arial", "black");
				rlabel.name = responses[i].id;
				rlabel.textAlign = "center";
				rlabel.textBaseline = "middle";
				rlabel.lineWidth = 220;
				rlabel.x = 120;
				rlabel.y = 35/2;

				var rlabel2 = new createjs.Text(responses[i].poem[1], "bold 12px Arial", "black");
				rlabel2.name = responses[i].id;
				rlabel2.textAlign = "center";
				rlabel2.textBaseline = "middle";
				rlabel2.lineWidth = 220;
				rlabel2.x = 120;
				rlabel2.y = 35;

				var rlabel3 = new createjs.Text(responses[i].poem[2], "bold 12px Arial", "black");
				rlabel3.name = responses[i].id;
				rlabel3.textAlign = "center";
				rlabel3.textBaseline = "middle";
				rlabel3.lineWidth = 220;
				rlabel3.x = 120;
				rlabel3.y = 3*35/2;

				var rbackground = new createjs.Shape();
				rbackground.name = responses[i].id;
				rbackground.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 240, 70, 5);

				responseButtons.push(new createjs.Container());
				responseButtons[i].name = responses[i].id;
				responseButtons[i].addChild(rbackground, rlabel,rlabel2,rlabel3);
				responseButtons[i].x = header.x/3 +(i % 3) * ((800 / 3) + 50);
				responseButtons[i].y = button.y + Math.floor(i / 3) * 100;
				responseButtons[i].addEventListener("click", voteClick);
				stage.addChild(responseButtons[i]);
				console.log('Add button');
			}
			stage.update();
		}

		stage.addChild(button);
		stage.update();
		button.addEventListener("click", handleClick);

		var txt;
		if (socket.host) {
			$.get("../randomWord")
			.done(function(data, status) {
				socket.emit('game message', {title: 'poeticJustice', business: data});
			});
		}

		var timerTicks = 90;
		var msgTime;
		var voteTime;
		var scoreTime;
        socket.on('timer_message',function(msg){
            if(state == 'naming'){
                timerTicks = 90 - msg;
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

		stage.update();
		function onTick(event){
			//console.log(createjs.Ticker.getTime())
			stage.update();
			if(state == "naming"){
				$L1.render();
				$L2.render();
				$L3.render();
			}
			if ((timerTicks === 0 || toRespond.length === 0 ) && state === "naming") {
				console.log("Voting!");
				getVoting();
			}
			if ((timerTicks === 0 || toVote.length === 0)  && state === "voting") {
				console.log('Scoring!');
				getScore();
			}
			if(timerTicks === 0 && state === "scoring"){
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
			$L1.destroy();
			$L2.destroy();
			$L3.destroy();
			stage.update();
			socket.emit('game message', {title: 'poeticJustice', id: socket.id, poem: [$L1.value(), $L2.value(), $L3.value()]})
		}

		function voteClick(e) {
			console.log("yes");
			console.log(e.target.name);
			socket.emit('game message', {title: 'poeticJustice', vote: e.target.name, id: socket.id});
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
			voteText.x = header.x;
			voteText.y = button.y;
			voteText.lineWidth = 400;
			stage.addChild(voteText);
			stage.update();
		}

		var responses = [];
		var votes = [];
		socket.on('game message', function(msg) {
			console.log(msg);
			if (msg.title === "poeticJustice") {
				if (msg.poem) {
					responses.push({id: msg.id, poem: msg.poem});
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
					txt.font = "20px Arial";
					txt.color = "#000000";
					txt.x = $('#demoCanvas').width()/2 - txt.getMeasuredWidth()/2;
					txt.y = header.y+.75*$('#demoCanvas').height()/10;
					txt.lineWidth = 400;
					stage.addChild(txt);
					stage.update();
				}
			}
		});

		function getVoting() {
			console.log("Vote: " + responses);
			voteTime = 25 + msgTime;
			toRespond.push("Done");
			try {
				$L1.destroy();
				$L2.destroy();
				$L3.destroy();
				stage.removeChild(button);
			} catch(err){
				console.log(err);
			}
			header.text = "Vote for the best haiku";
			stage.update();
			makeButtons(responses);
			state="voting"
		}

		function getScore() {
			stage.removeAllChildren();
			state = "scoring";
			scoreTime = 5 + msgTime;
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
				console.log(users[responses[i].id].nickname);
				if (votes[responses[i].id]) {
					scores.push(new createjs.Text(users[responses[i].id].nickname + ": " + votes[responses[i].id]));
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
