(function(KOTH){
	KOTH.ControllerModel = Simple.Model.extend({
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
		initialize: function(){
			//socket = io.connect("78.91.68.120", {port: 8080, transports: ["websocket"]});
			socket = io.connect("http://ec2-54-229-164-44.eu-west-1.compute.amazonaws.com", {port: 8000, transports: ["websocket"]});

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
		onDeviceMotion: function(e){
			if (this.gameStarted) {
				
				this.sensors.x = (e.accelerationIncludingGravity.x); 
			    this.sensors.y = (e.accelerationIncludingGravity.y);
			   
			    var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
	
				if (landscapeOrientation) {
					this.vx = this.vx + this.sensors.y * 5;
					this.vy = this.vy + this.sensors.x * 5;
				} else {
					this.vy = this.vy - this.sensors.y * 5;	
					this.vx = this.vx + this.sensors.x * 5;
				}	
			
				this.x = Math.round(this.x + ((this.vx * 0.98) / 180));
				this.y = Math.round(this.y + ((this.vy * 0.98) / 180));

			    socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, X: this.x, Y: this.y});
			}
		},
		onDeviceOrientation: function(event){
			if (this.gameStarted) {
				var rotationGamma = event.gamma; 
				var rotationBeta = event.beta;
				var arctan = Math.atan2(rotationGamma, -rotationBeta);
				var hypotenus = Math.sqrt((rotationBeta*rotationBeta) + (rotationGamma*rotationGamma));
				//var fixedHyp = Math.pow((hypotenus/10),2);

				var angle = (arctan/Math.PI)*180;
				if(angle < 0){
					angle = 360 + angle;
				}
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Hypotenus: hypotenus});
			}
		}	
	});
})(window.KOTH = window.KOTH || {});		
