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
	var gameCode, numberOfPlayers;
});


function setEventHandlers(socket){
	socket.on("hostNewGame", onHostNewGame); 
	socket.on("joinNewGame", onJoinNewGame);
	socket.on("movePlayer", onMovePlayer);
	socket.on("playerCreated", onPlayerCreated);
}

function onHostNewGame(data){
	this.gameCode = data.GameCode;
	this.join(this.gameCode.toString());
	io.sockets.in(data.GameCode.toString()).emit('newGameHosted', data);
}

function onJoinNewGame(data){
	var room = this.manager.rooms["/" + data.GameCode];
	this.gameCode = data.GameCode;

	if(room != undefined){
		this.join(this.gameCode.toString());
		io.sockets.in(this.gameCode.toString()).emit('playerJoinedRoom', {GameCode: data.GameCode, UserName: data.UserName, SocketId: this.id});
	} else{
		this.emit('error');
	}
 }

function onMovePlayer(data){
	var rotationBeta = (data.Beta/180)*Math.PI;
	var rotationGamma = (data.Gamma/180)*Math.PI; 

	var x = Math.cos(rotationBeta) * Math.sin(rotationGamma);
	var y = -Math.sin(rotationBeta);
	var z = Math.cos(rotationBeta) * Math.cos(rotationGamma);

	var theta = Math.atan2(x, y);
	var phi = Math.atan2(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)), z) * 65;

	var angle = (theta/Math.PI)*180;
	angle += 90; // for sidelengs spillings
	if(angle < 0){
		angle = 360 + angle;
	}

	angle = angle.toPrecision(4);
	phi = phi.toPrecision(3);

	io.sockets.in(data.GameCode.toString()).emit('playerMove', {Angle: angle, Phi: phi});
}

function onPlayerCreated(data){
	io.sockets.in(data.GameCode.toString()).emit('playerInitialized', data);
}

