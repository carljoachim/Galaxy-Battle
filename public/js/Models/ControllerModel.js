(function(GB){
	GB.ControllerModel = Simple.Model.extend({
		gameCode: null,
		playerName: null,
		gameStarted: false,
		players: [],
		numberOfPlayers: 0,
		initialize: function(){
			//socket = io.connect("192.168.1.2", {port: 8000, transports: ["websocket"]});
			//socket = io.connect("78.91.70.138", {port: 8000, transports: ["websocket"]});
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
		lastAngle: -1,
		lastX: 2,
		lastZ: 2,
		gameSpeed: 90,
		onDeviceOrientation: function(event){
			if (this.gameStarted) {	
				var rotationBeta = (event.beta/180)*Math.PI;
				var rotationGamma = (event.gamma/180)*Math.PI; 

				var x = -Math.sin(rotationBeta)*Math.cos(rotationGamma);	
				var y = -Math.sin(rotationGamma);
				var z = Math.cos(rotationBeta)*Math.cos(rotationGamma);

				var theta = Math.atan2(x, y);
				var phi = Math.atan2(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)), z);

				var angle = (theta/Math.PI)*180;				
				if(angle < 0){					
					angle = 360 + angle;
				}	
				if(this.lastAngle == -1){
					this.lastAngle = angle;
					this.lastX = x;
					this.lastZ = z;
				}else if(this.mathSign(x) != this.mathSign(this.lastX) && this.mathSign(z) != this.mathSign(this.lastZ)){
					angle = this.lastAngle;
					x = this.lastX;
					z = this.lastZ;
				}

				angle = angle.toPrecision(4);
				phi = phi.toPrecision(3) * this.gameSpeed;

				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Phi: phi, Angle: angle});

				this.lastAngle = angle;	
				this.lastX = x;
				this.lastZ = z;
			}
		},
		mathSign: function(number){
			return (number < 0) ? -1 : 1;
		}
	});
})(window.GB = window.GB || {});		
