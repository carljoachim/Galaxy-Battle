(function(KOTH){
	KOTH.IOModel = Simple.Model.extend({

		initialize: function(){
			socket = io.connect("78.91.68.221", {port: 8080, transports: ["websocket"]});
	    	this.setEventHandlers(socket);	
		},

		setEventHandlers: function(socket){
			socket.on('connect', this.onConnected);
		},

		onConnected: function(){
			console.log("Connected!");
		}

	});
})(window.KOTH = window.KOTH || {});