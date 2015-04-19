var currentGame = {
    init: function (users, socket, stage, callback) {
        console.log("SprayTheMost init");
        var drawing = false;
        var state = "loading";

        createjs.Ticker.addEventListener("tick", onTick);
        createjs.Ticker.setFPS(60);

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


        var timerTicks = 600;

        if (socket.host == true) {
            socket.emit("game state",{title:'spraythemost',state:'running'});
        }

        function onTick(event){
            stage.update();
            if (socket.host == true) {
                timerTicks -= 1;
                if(timerTicks%60 == 0 && state == "running"){
                    console.log((timerTicks/60));
                    socket.emit("game message",{title:'spraythemost',type:'time',val:(timerTicks/60)});
                }
                if(timerTicks == 0){
                    socket.emit("game state", {title:'spraythemost',state:"scoring"});
                    state = "game over";
                    getScore();
                }
            }
        }

        stage.on('stagemousemove', function(event){
            //console.log(event.stageX, event.stageY,socket.id);
            if(drawing){
                    socket.emit('game message',{title:'spraythemost',type:'paint',id:socket.id,position:{x:event.stageX,y:event.stageY}});
                }
        });

        stage.on('stagemousedown',function(event){
            if(state == "running"){
                drawing = true;
            }
        });
        stage.on('stagemouseup',function(event){
            drawing = false;
        });

        function hashCode(str) { // java String#hashCode
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                   hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                return hash;
        }

            function intToARGB(i){
            return	((i>>16)&0xFF).toString(16) +
                                    ((i>>8)&0xFF).toString(16) +
                                    (i&0xFF).toString(16);
            }

        socket.on('game message', function(msg){
            if(msg.title == "spraythemost" && msg.type == "paint"){
                    var circle = new createjs.Shape();
                    //circle.graphics.beginFill('#'+intToARGB(hashCode(msg.id).toString())).drawCircle(0, 0, 20);
                circle.graphics.beginFill(users[msg.id].colour).drawCircle(0, 0, 20);
                    circle.x = msg.position.x;
                    circle.y = msg.position.y;
                    stage.addChild(circle);
                stage.setChildIndex(circle,stage.getNumChildren()-3);
            }

            if(msg.title == "spraythemost" && msg.type == "time"){
                txt.text = msg.val.toString();
                txt2.text = msg.val.toString();
            }
        });

        socket.on('game state', function(msg){
            state = msg.state;
            console.log(state);
            if(state == 'scoring'){
                drawing = false;
            }
        });

        socket.on('time tracker', function(msg){
           console.log('tracking time');
        });

        function rgbaTOrgb(rgba)
        {
            var bg = {r:255,g:255,b:255};
            var a = rgba.a;

            return {r:(1 - a) * bg.r + a * rgba.r,
                g:(1 - a) * bg.g + a * rgba.g,
                b:(1 - a) * bg.b + a * rgba.b
            };
        }

        function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
        }

        function getScore(){
            var canvas = document.getElementById('demoCanvas');
            var ctx = canvas.getContext('2d');
            var image = ctx.getImageData(0,0,canvas.width,canvas.height).data;
            $.each(users,function(k,v){
                v.score = 0;
            });
            for(i = 0; i < image.length; i+=4){
                    r = image[i]
                    g = image[i+1]
                    b = image[i+2]
                    a = image[i+3]
                    //rgb = image[i].toString()+ ','+ image[i+1].toString() +','+image[i+2].toString();
                var rgb = rgbaTOrgb({r:r,g:g,b:b,a:a});

                /*$.each(users,function(k,v){
                    $.each(v.colour
                });*/
            }
            // console.log(totals)

            stage.autoClear = true; // This must be true to clear the stage.
            stage.removeAllChildren();
            stage.update();
            callback();
            }
    }
    //ED2D39
    //12E491scheme
}
