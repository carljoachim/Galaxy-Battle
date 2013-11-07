(function(GB){
	GB.ControllerModel = Simple.Model.extend({
		gameCode: null,
		playerName: null,
		gameStarted: false,
		players: [],
		numberOfPlayers: 0,
		spaceshipSpeed: 85,
		initialize: function(){
			//socket = io.connect("192.168.1.4", {port: 8000, transports: ["websocket"]});
			//socket = io.connect("78.91.68.80", {port: 8000, transports: ["websocket"]});
			socket = io.connect("54.229.160.210", {port: 8000, transports: ["websocket"]});
			
			this.setEventHandlers(socket);	
			Simple.Events.on("controller:join-game", this.joinGame.bind(this));
		 	window.addEventListener("deviceorientation", this.onDeviceOrientation.bind(this));	
		},

		setEventHandlers: function(socket){
			socket.on('playerJoinedRoom', function(){ Simple.Events.trigger("controller:joined-room"); });	
			socket.on('error', function(){ Simple.Events.trigger("controller:error-joining-room"); });	
			socket.on('playerInitialized', this.setPlayerSettings.bind(this));
		},
		joinGame: function(data){
			this.gameCode = data.GameCode;
			this.playerName = data.PlayerName;
			this.playerId = socket.socket.sessionid;
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
				var betaAngle = event.beta.toPrecision(3);
				var gammaAngle = event.gamma.toPrecision(3);

				var rotationBeta = (event.beta/180)*Math.PI;
				var rotationGamma = (event.gamma/180)*Math.PI; 

				// var x = Math.cos(rotationBeta) * Math.sin(rotationGamma);
				// var y = -Math.sin(rotationBeta);
				// var z = Math.cos(rotationBeta) * Math.cos(rotationGamma);

				var x = -Math.sin(rotationBeta);
				var y = -Math.cos(rotationBeta)*Math.sin(rotationGamma);
				var z = Math.cos(rotationBeta) * Math.cos(rotationGamma);

				var theta = Math.atan2(x, y);
				var phi = Math.atan2(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)), z) * this.spaceshipSpeed;

				var angle = (theta/Math.PI)*180;
				//angle += 90; // for sidelengs spillings
				if(angle < 0){
					angle = 360 + angle;
				}

				angle = angle.toPrecision(4);
				phi = phi.toPrecision(3);
				
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Phi: phi});
							
			}
		}

	});
})(window.GB = window.GB || {});		
