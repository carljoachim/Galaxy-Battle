var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));

var server = require('http').createServer(app).listen(8000);
var io = require("socket.io").listen(server);

io.configure(function() {
		io.set("transports", ["xhr-polling"]);
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
	//socket.on("startNewGame", onStartNewGame);
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
	io.sockets.in(data.GameCode.toString()).emit('playerMove', data);
}

function onPlayerCreated(data){
	io.sockets.in(data.GameCode.toString()).emit('playerInitialized', data);
}

