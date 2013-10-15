(function(KOTH){
	KOTH.AppModel = Simple.Model.extend({
		gameCode: null,
		numberOfPlayers: 0,
	
		initialize: function(){
			socket = io.connect("78.91.70.225", {port: 8080, transports: ["websocket"]});
			this.setEventHandlers(socket);	
			
			Simple.Events.on("display:generate-game", this.generateGame);
			Simple.Events.on("controller:join-game", this.joinGame);
		},

		setEventHandlers: function(socket){
			socket.on('connect', this.onConnected);
			socket.on('playerJoinedRoom', this.onPlayerJoinedRoom);
			socket.on('error', this.onErrorJoining);
		},

		onConnected: function(){
			console.log("Connected!");
		},

		generateGame: function(numberOfPlayers){
			if(this.numberOfPlayers != numberOfPlayers){
				this.numberOfPlayers = numberOfPlayers;
				this.gameCode = (""+Math.random()).substring(2,6);
				Simple.Events.trigger("display:game-generated", this.gameCode);
				socket.emit('hostNewGame', {GameCode: this.gameCode, NumberOfPlayers: this.numberOfPlayers});
			}
		},

		

	});
})(window.KOTH = window.KOTH || {});
