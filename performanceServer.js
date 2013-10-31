var express = require("express");
var app = express();
app.use(express.static(__dirname + '/performance'));

var server = require('http').createServer(app).listen(8000);
var io = require("socket.io").listen(server);

io.configure(function() {
		io.set("transports", ["websocket"]);
		io.set("log level", 1); 
});


io.sockets.on('connection', function(socket) {
	console.log("Connected " + socket.id);
	setEventHandlers(socket);

});


function setEventHandlers(socket){
	socket.on("hostNewGame", onHostNewGame); 
	socket.on("joinNewGame", onJoinNewGame);
	

	socket.on("movePlayer", onMovePlayer);

	socket.on("checkRooms", function(){
		console.log(this.manager.rooms)
	});
}

function onHostNewGame(gameCode){
	this.join(gameCode.toString());
}

function onJoinNewGame(gameCode){
	this.join(gameCode.toString());

	var room = this.manager.rooms["/" + gameCode];

	if(room != undefined){
		this.join(gameCode.toString());
	}else{
		console.log("error");
	}
 }

function onMovePlayer(data){
	io.sockets.in(data.GameCode.toString()).emit('playerMove', data);
}


