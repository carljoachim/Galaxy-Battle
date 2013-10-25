(function(GB){
	GB.DisplayModel = Simple.Model.extend({
		gameCode: null,
		numberOfPlayers: 0,
		socketId: null,
		players: [],
				   //red,    green        blue      yellow   lightblue    rose       grey       white
		colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#FFFFFF'],

		initialize: function(){
			//socket = io.connect("localhost", {port: 8000, transports: ["websocket"]});
			socket = io.connect("http://ec2-54-229-164-44.eu-west-1.compute.amazonaws.com", {port: 8000, transports: ["websocket"]});
			
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
				this.gameCode = (""+Math.random()).substring(2,4);
				//this.gameCode = 7;
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
				this.players.push({SocketId: data.SocketId, UserName: data.UserName});	
				Simple.Events.trigger("display:player-joined", {Players: this.players, NumberOfPlayersNotConnected: this.numberOfPlayers-this.players.length});
				if(this.players.length == this.numberOfPlayers){
					for (var i = 0; i < this.players.length; i++) {
						this.players[i].Color = this.colors[i];
					}
					Simple.Events.trigger("display:start-game", this.players);
					//socket.emit('startNewGame', {GameCode: this.gameCode});
				}
			}
		}

	});	
})(window.GB = window.GB || {});