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
		initialize: function(){
			//socket = io.connect("192.168.1.4", {port: 8000, transports: ["websocket"]});
			//socket = io.connect("78.91.71.17", {port: 8000, transports: ["websocket"]});
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
				var rotationGamma = event.gamma; 
				var rotationBeta = event.beta;
				var arctan = Math.atan2(rotationGamma, -rotationBeta);
				var hypotenus = Math.sqrt((rotationBeta*rotationBeta) + (rotationGamma*rotationGamma));
			
				var angle = (arctan/Math.PI)*180;
				angle += 90; // for sidelengs spillings
				if(angle < 0){
					angle = 360 + angle;
				}

				angle = angle.toPrecision(4);
				hypotenus = hypotenus.toPrecision(3);
				
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Hypotenus: hypotenus});
			

				/*
				var rotationGamma = (event.gamma/180)*Math.PI; 
				var rotationBeta = (event.beta/180)*Math.PI;
				
				var teta = Math.atan2(-Math.sin(rotationBeta)*Math.cos(rotationGamma), Math.sin(rotationGamma));
				var hypotenus = Math.sqrt((Math.sin(rotationGamma)*Math.sin(rotationGamma)) + (Math.sin(rotationBeta)*Math.cos(rotationGamma)*Math.sin(rotationBeta)*Math.cos(rotationGamma)));

				var angle = (teta/Math.PI)*180;
				//angle += 180; // for sidelengs spillings
				if(angle < 0){
					angle = 360 + angle;
				}


				angle = angle.toPrecision(4);
				hypotenus = hypotenus.toPrecision(3)*30;
				
				socket.emit('movePlayer', {GameCode: this.gameCode, PlayerId: this.playerId, Angle: angle, Hypotenus: hypotenus, Beta: event.beta, Gamma: event.gamma});
				*/


			}
		}	
	});
})(window.GB = window.GB || {});		
