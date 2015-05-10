var currentGame = {
	init: function (users, socket, stage, callback) {
		console.log("running isthisforthat...");
		var state = "naming";

		// time from spray the most
		createjs.Ticker.addEventListener("tick", onTick);
		createjs.Ticker.setFPS(60);

		var txt3 = new createjs.Text();
		txt3.text = "25";
		txt3.font = "50px Arial";
		txt3.color = "#000000";
		txt3.outline = 5;
		txt3.x = 15;

		var txt2 = new createjs.Text();
		txt2.text = "25";
		txt2.font = "50px Arial";
		txt2.color = "#ffffff";
		txt2.outline = false;
		txt2.x = 15;

		timerTicks = 25;
		socket.on('timer_message',function(msg){
            if(state == 'naming'){
                timerTicks = 25 - msg;
                txt3.text = timerTicks.toString();
                txt2.text = timerTicks.toString();
            }
            if(state == 'voting'){
            	timerTicks = 15 - msg;
            	txt3.text = timerTicks.toString();
            	txt2.text = timerTicks.toString();
            }
        });

		stage.addChild(txt3);
		stage.addChild(txt2);

		function onTick(event){
            stage.update();
            if (socket.host == true) {
                if(timerTicks == 0 && state == 'naming'){
                    state = "voting";
                    if(socket.host){
                        getVoting();
                    }
                }
                else if (timerTicks == 0 && state == 'voting'){
                	state = "game over";
                	getScore();
                }
            }
        }
        /*
		function onTick(event){
			//console.log(createjs.Ticker.getTime())
			if(time > 0){
				timerTicks += 1;
				time = tickHelp - Math.floor(timerTicks/60);
				txt3.text = time;
				txt2.text = time;
				stage.update();
			}
			if (time == 0 && state == "naming"){
				//createjs.Ticker.off("tick",listener)
				state = "voting";
				getVoting();
			}
			if (time == 0 && state == "voting"){
				state = "game over";
				getScore();
			}

		} */
		// end

		var header = new createjs.Text();
		header.text = "Name this fictional business:";
		header.font = "25px Arial Bold";
		header.color = "#FF00AA"
		header.x = 15;
		header.y = 50;
		header.lineWidth = 400;
		stage.addChild(header);

		var background = new createjs.Shape();
		background.name = "background";
		background.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 120, 35, 5);

		var label = new createjs.Text("Submit Name", "bold 12px Arial", "black");
		label.name = "label";
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.x = 120/2;
		label.y = 35/2;

		var button = new createjs.Container();
		button.name = "button";
		button.x = 50;
		button.y = 230;
		button.addChild(background, label);

		var responseButtons = new Array();
		function makeButtons(responses) {
			for (var i = 0; i<responses.length; i++) {
				var rlabel = new createjs.Text(responses[i].name, "bold 12px Arial", "black");
				rlabel.name = responses[i].id;
				rlabel.textAlign = "center";
				rlabel.textBaseline = "middle";
				rlabel.lineWidth = 120;
				rlabel.x = 120/2;
				rlabel.y = 35/2;

				var rbackground = new createjs.Shape();
				rbackground.name = responses[i].id;
				rbackground.graphics.beginFill("#00F5FF").drawRoundRect(0, 0, 120, 35, 5);

				responseButtons.push(new createjs.Container());
				responseButtons[i].name = responses[i].id;
				responseButtons[i].addChild(rbackground, rlabel);
				responseButtons[i].x = (i % 4) * ((300 / 4) + 50);
				responseButtons[i].y = 140 + Math.floor(i / 4) * 50;
				responseButtons[i].addEventListener("click", voteClick);
				stage.addChild(responseButtons[i]);
			}
			stage.update();
		}

		stage.addChild(button);
		stage.update();
		button.addEventListener("click", handleClick);

		function handleClick(e) {
			stage.removeChild(button);
			stage.update();
			socket.emit('game message', {title: 'isThisForThat', id: socket.id, name: $name.val()})
		}

		function voteClick(e) {
			console.log("yes");
			console.log(e.target.name);
			socket.emit('game message', {title: 'isThisForThat', vote: e.target.name});
			for (var i = 0; i < responseButtons.length; i++) {
				stage.removeChild(responseButtons[i]);
			}
			var voteText = new createjs.Text();
			voteText.text = "You have voted";
			voteText.font = "25px Arial Bold";
			voteText.color = "#FF00AA";
			voteText.x = 15;
			voteText.y = 180;
			voteText.lineWidth = 400;
			stage.addChild(voteText);
			stage.update();
		}

		var txt;
		if (socket.host) {
			$.get("../isthisforthat")
			.done(function(data, status) {
				socket.emit('game message', {title: 'isThisForThat', business: data});
			});
		}

		var $name = $("<input type='text' id='name'>");
		$("#inputs").append($name);
		var nameDOM = new createjs.DOMElement($name.attr("id"));
		stage.addChild(nameDOM);

		var canvasPos = $("#demoCanvas").position();
		var namePos = $name.position();
		var namex = canvasPos.left - namePos.left;
		var namey = canvasPos.top - namePos.top;
		nameDOM.x = namex + 50;
		nameDOM.y = namey + 190;
		stage.update();

		var responses = [];
		var votes = [];
		socket.on('game message', function(msg) {
			if (msg.title === "isThisForThat") {
				if (msg.id) {
					responses.push({id: msg.id, name: msg.name});
					console.log(responses);
				} else if (msg.vote) {
					if (votes[msg.vote]) {
						votes[msg.vote] += 1;
					} else {
						votes[msg.vote] = 1;
					}
					console.log(votes);
				} else if (msg.business) {
					txt = new createjs.Text();
					txt.text = msg.business;
					txt.font = "20px Arial";
					txt.color = "#000000";
					txt.x = 15;
					txt.y = 90;
					txt.lineWidth = 400;
					stage.addChild(txt);
					stage.update();
				}
			}
		});

		function getVoting() {
			console.log("Vote: " + responses);
			$name.hide();
			stage.removeChild(nameDOM);
			stage.removeChild(button);
			header.text = "Vote for the best name";
			stage.update();
			makeButtons(responses);
			timerTicks = 15;
		}

		function getScore() {
			stage.removeAllChildren();
			var tally = new createjs.Text("Vote Totals");
			tally.font = "20px Arial Bold";
			tally.color = "#000000"
			tally.x = 20;
			tally.lineWidth = 280;
			stage.addChild(tally);
			var scores = new Array();
			for (var i = 0; i < responses.length; i++) {
				console.log(responses[i].id, votes[responses[i].id]);
				if (votes[responses[i].id]) {
					scores.push(new createjs.Text(responses[i].name + ": " + votes[responses[i].id]));
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
			stage.autoClear = true; // This must be true to clear the stage.
			stage.removeAllChildren();
			stage.update();

			callback();
		}
	}
}
