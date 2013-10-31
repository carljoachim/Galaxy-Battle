//socket = io.connect("localhost", {port: 8000, transports: ["websocket"]});


//socket.emit('hostNewGame', 
	//{GameCode: this.gameCode, NumberOfPlayers: this.numberOfPlayers});
//socket.emit('joinNewGame', data);
	//this.gameCode = data.GameCode; 	this.playerName = data.PlayerName;  this.playerId = socket.socket.sessionid;  

//socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Hypotenus: hypotenus});

$(document).ready(function() {
	
	//socket = io.connect("http://ec2-54-229-164-44.eu-west-1.compute.amazonaws.com", {port: 8000, transports: ["xhr-polling"]});
	var numOfRooms, playersInRooms;	
	var sockets = [];

	// socket = io.connect("localhost", {'force new connection': true, port: 8000, transports: ["websocket"]});	

	// socket.on('connect', function(){
	// 	sockets.push(this.socket.sessionid);
	// 	console.log(sockets);
	// })


	$("#submit").on("click", function(){
		numOfRooms = $('#numOfRooms').val();
		playersInRooms = $('#playersInRooms').val();
		// socket = io.connect("localhost", {'force new connection': true, port: 8000, transports: ["websocket"]});
		// socket.on('connect', function(){
		// 	sockets.push(this.socket.sessionid);
		// 	console.log(sockets);
		// })
		//hostGames();
		//joinRoom();
		createSockets();
		setInterval(checkIfFinish, 5000);
	})

	function joinRoom(){
		for (var i = 0; i < numOfRooms; i++) {
			socket = io.connect("localhost", {'force new connection': true, port: 8000, transports: ["websocket"]});
		}
	}

	function createSockets(){	
		for (var i = 0; i < 1000; i++) {
			socket = io.connect("localhost", {'force new connection': true, port: 8000, transports: ["websocket"]});
			socket.on('connect', function(){
				sockets.push(this.socket.sessionid);
			})
		//	setTimeout(checkIfFinish(), 500);
		}


	}

	function checkIfFinish(){

		console.log(sockets);
		console.log(sockets.length);
	
	}

	//window.setInterval(checkIfFinish, 200);
	
	//socket = io.connect("localhost", {'force new connection': true, port: 8000, transports: ["websocket"]});


});