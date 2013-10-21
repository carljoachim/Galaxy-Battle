(function(GB, Mustache){
	GB.ControllerView = Simple.View.extend({
		introTemplate: 
			"<div class='mobile-join-game-info'>" + 
				"<h3 class='header-mobile'> Galaxy Battle </h3>" + 
				"<p> Name </br> <input type='text' id='name' value='Player'> </br>" +
				"<p> Game Code </br> <input type='text' id='game-code'> <br>" +
				"</br><button id='start-game-button'> Start game</button>" +
				"</br></br><div class='error-message'></div>" +
			"</div>",
		gameTemplate:
			"<div class='controller-game-play-wrapper'></div>",
		events: {
            "click #start-game-button": "startGame",       
        },
		initialize: function(options){
			this.model = options.model;
			this.el.html(this.introTemplate);
			Simple.Events.on("controller:error-joining-room", this.errorJoiningRoom);			
			Simple.Events.on("controller:joined-room", this.joiningRoom);
			Simple.Events.on("controller:player-init", this.setPlayerSettings.bind(this));
			
			document.getElementsByTagName('head')[0].innerHTML += '<meta name="viewport" content="user-scalable=yes, initial-scale=1.0, maximum-scale=2.0, width=device-width" />';			
			document.getElementsByTagName('head')[0].innerHTML += '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />';
	
		},
		startGame: function(){
			var code = $("#game-code").val();
			var user = $("#name").val();
			Simple.Events.trigger("controller:join-game", {GameCode: code, UserName: user});

		},
		errorJoiningRoom: function(){
			$(".error-message").html("Wrong code..");
		},
		joiningRoom: function(){
			$(".error-message").html("Correct code:) </br></br> Waiting for other players..");
			Simple.Events.trigger("controller:")
		},
		setPlayerSettings: function(data){
			var html = Mustache.to_html(this.gameTemplate, data);
			this.el.html(html);
			for(var i = 0; i < data.length; i++){
				if(data[i].PlayerId == data[i].SocketId){
					this.el.find(".controller-game-play-wrapper").css("background", "url(../img/spacecrafts/spacecraft" + data[i].PlayerColor.replace('#','') + ".png) no-repeat");
				}
		
			}

		}

	});
})(window.GB = window.GB || {}, Mustache);