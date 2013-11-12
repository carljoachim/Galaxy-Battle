var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));

var io = require("socket.io").listen(require('http').createServer(app).listen(8000));

io.configure(function() {
		io.set("transports", ["websocket"]);
		io.set("log level", 2); 
});


io.sockets.on('connection', function(socket) {
	console.log("Connected " + socket.id);
	setEventHandlers(socket);
});


function setEventHandlers(socket){
	socket.on("hostNewGame", onHostNewGame); 
	socket.on("joinNewGame", onJoinNewGame);
	socket.on("movePlayer", onMovePlayer);
	socket.on("playerCreated", onPlayerCreated);
}


var playersList = [];

function onHostNewGame(data){
	this.join(data.GameCode.toString());
	io.sockets.in(data.GameCode.toString()).emit('newGameHosted', data);

	playersList.push({room: data.GameCode, players: []});
}

function onJoinNewGame(data){
	var room = this.manager.rooms["/" + data.GameCode];

	if(room != undefined){
		this.join(data.GameCode.toString());
		io.sockets.in(data.GameCode.toString()).emit('playerJoinedRoom', {GameCode: data.GameCode, UserName: data.UserName, SocketId: this.id});
		var playerValues = {id: data.SocketId, Values: {lastAngle: -1, lastX: 2, lastZ: 2}};
		
		for (var i = 0; i < playersList.length; i++) {
			if(playersList[i].room == data.GameCode){
				playersList[i].players.push(playerValues);
			}
		};
	} else{
		this.emit('error');
	}
}

var gameSpeed = 75;
function onMovePlayer(data){
	for (var i = 0; i < playersList.length; i++) {
		if(playersList[i].room == data.GameCode){
			for (var j = 0; j < playersList[i].players.length; j++) {
				if(playersList[i].players[j].id == data.PlayerId){

					var playerValues = playersList[i].players[j].Values;

					var x = -Math.sin(data.Beta)*Math.cos(data.Gamma);	
					var y = -Math.sin(data.Gamma);
					var z = Math.cos(data.Beta)*Math.cos(data.Gamma);

					var theta = Math.atan2(x, y);
					var phi = Math.atan2(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)), z);

					var angle = (theta/Math.PI)*180;				
					if(angle < 0){					
						angle = 360 + angle;
					}	
					// if(playerValues.lastAngle == -1){
					// 	playerValues.lastAngle = angle;
					// 	playerValues.lastX = x;
					// 	playerValues.lastZ = z;

					// }else if(mathSign(x) != mathSign(playerValues.lastX) && mathSign(z) != mathSign(playerValues.lastZ)){
					// 	angle = playerValues.lastAngle;
					// 	x = playerValues.lastX;
					// 	z = playerValues.lastZ;
					// }

					phi *= gameSpeed;			
			
					io.sockets.in(data.GameCode.toString()).emit('playerMove', {GameCode: data.GameCode, PlayerId: data.PlayerId, Angle: angle, Phi: phi});

					// playerValues.lastAngle = angle;	
					// playerValues.lastX = x;
					// playerValues.lastZ = z;
				}
			};
		}
	};

}
function mathSign(number){
	return (number < 0) ? -1 : 1;
}

function onPlayerCreated(data){
	io.sockets.in(data.GameCode.toString()).emit('playerInitialized', data);
}

