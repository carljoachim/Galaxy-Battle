(function(GB, Mustache){
	GB.ControllerView = Simple.View.extend({
		rotateMessageTemplate: 
			"<div class='rotate-screen-message'> </div>",
		introTemplate: 
			"<div class='mobile-join-game-info'>" + 
				"<h3 class='header-mobile'> Galaxy Battle </h3>" + 
				"<p> Name <input type='text' id='name' value='Player'> </br>" +
				"<p> Game Code <input type='tel' id='game-code'> <br>" +
				"<div id='start-game-button'> Start game</div>" +
				"</br><div class='error-message'></div>" +
			"</div>",
		gameTemplate:
			"<div class='controller-game-play-wrapper'></div>",
		events: {
            "click #start-game-button": "startGame",       
        },
		initialize: function(options){						
			this.model = options.model;
			this.el.html(this.rotateMessageTemplate);

			Simple.Events.on("controller:error-joining-room", this.errorJoiningRoom);			
			Simple.Events.on("controller:joined-room", this.joiningRoom);
			Simple.Events.on("controller:player-init", this.setPlayerSettings.bind(this));		

			$('head').append('<meta name=viewport content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width" />');
			$('head').append('<meta name=apple-mobile-web-app-capable content=yes>');
			$('head').append('<meta name=apple-mobile-web-app-status-bar-style content=black>');	
			
			window.scrollTo(0, 1);
			if(window.orientation == -90){
				this.el.html(this.introTemplate).hide().fadeIn('fast');;
			}	
			window.addEventListener("orientationchange", this.reloadView.bind(this));
		
		},
		reloadView:function(){
			if(!this.model.gameStarted){
				if(window.orientation == -90){
					this.el.html(this.introTemplate);
				}else{
					this.el.html(this.rotateMessageTemplate);
				}		
			}
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
			$(".error-message").html("Correct code:) </br> Waiting for other players..");
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