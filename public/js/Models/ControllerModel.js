(function(GB){
	GB.ControllerModel = Simple.Model.extend({
		gameCode: null,
		playerName: null,
		gameStarted: false,
		sensors: {x: 0, y: 0},
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		players: [],
		numberOfPlayers: 0,
		spaceshipSpeed: 85,
		initialize: function(){
			//socket = io.connect("192.168.1.4", {port: 8000, transports: ["websocket"]});
			//socket = io.connect("78.91.68.169", {port: 8000, transports: ["websocket"]});
			socket = io.connect("54.229.160.210", {port: 8000, transports: ["websocket"]});
			
			this.setEventHandlers(socket);	

			Simple.Events.on("controller:join-game", this.joinGame.bind(this));

		 	window.addEventListener("deviceorientation", this.onDeviceOrientation.bind(this), false);		
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
			this.x = data.X;
			this.y = data.Y;
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

				var x = Math.sin(rotationGamma);
				var y = -Math.sin(rotationBeta)*Math.cos(rotationGamma);
				var z = Math.cos(rotationBeta)*Math.cos(rotationGamma);

				if(z <= 0 && (Math.abs(rotationGamma) >= Math.PI/2)){
					y = -y ;
				}

				var theta = Math.atan2(x, y);
				var phi = Math.atan2(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)), z) * this.spaceshipSpeed;

				var angle = (theta/Math.PI)*180;
				angle += 90; // for sidelengs spillings
				if(angle < 0){
					angle = 360 + angle;
				}

				angle = angle.toPrecision(4);
				phi = phi.toPrecision(3);
				
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Phi: phi, Gamma: rotationGamma});
							
			}
		},
		mathSign: function(number){
			return (number >= 0) ? 1 : -1;
		}
	});
})(window.GB = window.GB || {});		
