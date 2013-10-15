(function(KOTH){
	KOTH.DisplayModel = Simple.Model.extend({
		gameCode: null,
		numberOfPlayers: 0,
		socketId: null,
		players: [],

		initialize: function(){
			socket = io.connect("localhost", {port: 8080, transports: ["websocket"]});
			//socket = io.connect("localhost", {port: 8080, transports: ["websocket"]});
			

			this.setEventHandlers(socket);
			this.socketId = socket.socket.sessionid;

			Simple.Events.on("display:generate-game", this.generateGame.bind(this));
			Simple.Events.on("display:players-created", this.playersCreated.bind(this));
		},

		setEventHandlers: function(socket){			
			socket.on('connect', this.onConnected);
			socket.on('playerJoinedRoom', this.onPlayerJoinedRoom.bind(this));
			socket.on('playerMove', function(data){ Simple.Events.trigger("display:player-move", data); });
		},

		onConnected: function(){
			console.log("Connected!");
		},

		generateGame: function(numberOfPlayers){
			if(this.numberOfPlayers != numberOfPlayers){
				this.numberOfPlayers = numberOfPlayers;
				this.gameCode = (""+Math.random()).substring(2,3);
				Simple.Events.trigger("display:game-generated", {GameCode: this.gameCode, NumberOfPlayers: this.numberOfPlayers});		
				socket.emit('hostNewGame', {GameCode: this.gameCode, NumberOfPlayers: this.numberOfPlayers});
			}
		},
		playersCreated: function(data){
			for(var i = 0; i < data.length; i++){	
				var startX = data[i].position().x;
				var startY = data[i].position().y;
				var playerId = data[i].name();
				var color = data[i].color();
				socket.emit('playerCreated', {GameCode: this.gameCode, X:startX, Y: startY, PlayerId: playerId, PlayerColor: color, NumberOfPlayers: data.length });
			}
		},
		onPlayerJoinedRoom: function(data){
			var playersMissing = this.players.length;
			if(this.players.length < this.numberOfPlayers){
				this.players.push(data.SocketId);	
				Simple.Events.trigger("display:player-joined", {Players: this.players, NumberOfPlayersNotConnected: this.numberOfPlayers-this.players.length});
				if(this.players.length == this.numberOfPlayers){
					Simple.Events.trigger("display:start-game", this.players);
					//socket.emit('startNewGame', {GameCode: this.gameCode});
				}
			}
		}

	});	
})(window.KOTH = window.KOTH || {});