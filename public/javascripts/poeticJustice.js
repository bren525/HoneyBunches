var currentGame = {
	init: function (users, socket, stage, callback) {
		console.log("running poeticJustice...");

		var toRespond = Object.keys(users);
		var toVote = toRespond;

		var winnerScore = 0;
		var winnerId = undefined;

		// time from spray the most
		createjs.Ticker.addEventListener("tick", onTick);
		createjs.Ticker.setFPS(60);

		var txt2 = new createjs.Text();
		txt2.text = "10";
		txt2.font = "50px Arial";
		txt2.color = "#ffffff";
		txt2.outline = false;
		txt2.x = 10;

		var txt3 = new createjs.Text();
		txt3.text = "10";
		txt3.font = "50px Arial";
		txt3.color = "#000000";
		txt3.outline = 5;
		txt3.x = 10;

		timerTicks = 0;
		time = 60;
		tickHelp = 60;
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
		var L1X =  $('#demoCanvas').width()/2 - 75-75;
		var L1Y =  header.y+2.5*$('#demoCanvas').height()/10;

		var $L1 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L1X,
			y: L1Y,
		});

		var L2X =  $('#demoCanvas').width()/2 - 75-75;
		var L2Y =  L1Y+2.5*$('#demoCanvas').height()/20;

		var $L2 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L2X,
			y: L2Y,
		});

		var L3X =  $('#demoCanvas').width()/2 - 75-75;
		var L3Y =  L2Y+2.5*$('#demoCanvas').height()/20;

		var $L3 = new CanvasInput ({
			canvas: document.getElementById('demoCanvas'),
			fontSize: 18,
			x: L3X,
			y: L3Y,
		});

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
		button.y = $L2.y();
		button.addChild(background, label);

		var responseButtons = new Array();

		function makeButtons(responses) {
			console.log('making buttons');
			for (var i = 0; i<responses.length; i++) {
				var rlabel = new createjs.Text(responses[i].poem[0]+'/n'+responses[i].poem[1]+'/n'+responses[i].poem[3], "bold 12px Arial", "black");
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

		var txt;
		if (socket.host) {
			$.get("../isthisforthat")
			.done(function(data, status) {
				socket.emit('game message', {title: 'isThisForThat', business: data});
			});
		}

		stage.update();
		function onTick(event){
			//console.log(createjs.Ticker.getTime())
			if(time > 0){
				timerTicks += 1;
				time = tickHelp - Math.floor(timerTicks/60);
				txt3.text = time;
				txt2.text = time;
				stage.update();
				if(state == "naming"){
					$L1.render();
					$L2.render();
					$L3.render();
				}
			}
			if ((time === 0 || toRespond.length === 0 ) && state === "naming") {
				console.log("Voting!");
				getVoting();
			}
			if ((time === 0 || toVote.length === 0)  && state === "voting") {
				console.log('Scoring!');
				getScore();
			}
			if(time === 0 && state === "scoring"){
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
			socket.emit('game message', {title: 'isThisForThat', id: socket.id, poem: [$L1.value(), $L2.value(), $L3.value()]})
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
				if (msg.name) {
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
					txt.x = header.x ;
					txt.y = header.y+$('#demoCanvas').height()/10;
					txt.lineWidth = 400;
					stage.addChild(txt);
					stage.update();
				}
			}
		});

		function getVoting() {
			console.log("Vote: " + responses);
			timerTicks = 0;
			time = 5;
			tickHelp = 15;
			toRespond.push("Done");
			try {
				$L1.destroy();
				$L2.destroy();
				$L3.destroy();
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
			timerTicks = 0;
			time = 5;
			tickHelp = 5;
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
