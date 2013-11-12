(function(GB){
	GB.ControllerModel = Simple.Model.extend({
		gameCode: null,
		playerName: null,
		gameStarted: false,
		players: [],
		numberOfPlayers: 0,
		initialize: function(){
			//socket = io.connect("192.168.1.2", {port: 8000, transports: ["websocket"]});
			//socket = io.connect("78.91.69.82", {port: 8000, transports: ["websocket"]});
			socket = io.connect("54.229.160.210", {port: 8000, transports: ["websocket"]});
			
			this.setEventHandlers(socket);	
			Simple.Events.on("controller:join-game", this.joinGame.bind(this));		
			window.addEventListener("deviceorientation", this.onDeviceOrientation.bind(this));	
		},

		setEventHandlers: function(socket){
			socket.on('playerJoinedRoom', function(){ 
				Simple.Events.trigger("controller:joined-room"); 
			});	
			socket.on('error', function(){ 
				Simple.Events.trigger("controller:error-joining-room"); 
			});	
			socket.on('playerInitialized', this.setPlayerSettings.bind(this));
		},
		joinGame: function(data){
			this.gameCode = data.GameCode;
			this.playerName = data.PlayerName;
			this.playerId = socket.socket.sessionid;
			data.SocketId = socket.socket.sessionid;
			socket.emit('joinNewGame', data);
		},
		setPlayerSettings: function(data){
			this.gameStarted = true;
			this.players.push(data);
			data.SocketId = socket.socket.sessionid;
			this.numberOfPlayers = data.NumberOfPlayers;
			if(this.players.length == this.numberOfPlayers){
				Simple.Events.trigger("controller:player-init", this.players);	
			}			
		},
		onDeviceOrientation: function(event){
			if (this.gameStarted) {	
				var rotationBeta = (event.beta/180)*Math.PI;
				var rotationGamma = (event.gamma/180)*Math.PI; 
				var time = Date.now();
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Beta: rotationBeta, Gamma: rotationGamma, Time: time});
			}
		}		
	});
})(window.GB = window.GB || {});		
