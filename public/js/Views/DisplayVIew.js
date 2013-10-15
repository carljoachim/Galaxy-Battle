(function(KOTH, Mustache){
	KOTH.DisplayView = Simple.View.extend({
		events: {
            "click #generate-game": "createGame",       
        },
		introTemplate: 
		  "<div class='display-new-game-info'> "+
		     "<h3> Velkommen til King of The Hill </h3>" +
   		  	 "<p> - Plukk opp din smart telefon </p>" +
   		  	 "Velg antall spillere <input id='num-of-players' type='number' min='1' max='8' value='1' >" +
   		  	 "<button id='generate-game'> Generer spill </button>" + 
   		     "<p> - Gå inn på 23.23.323.12 på din mobil og skriv inn koden</p>" +
   		     "<h1 class='game-code'></h1><br>" +
   		     "<div class='players-status'></div>" +
   		     "<div class='players-list'></div>" +
   		  "</div>",
		gamePlayTemplate:
   		   "<div class='game-wrapper'><canvas id='gameCanvas'></canvas></div>",
   		canvasWrapper: null,
   		canvasEl: null,
   		world: null,
   		playersList: [],
   		objectsList: [],
   		initialize: function(options){
			this.model = options.model;			
			this.el.html(this.introTemplate);

			Simple.Events.on("display:game-generated", this.showGameCode);			
			Simple.Events.on("display:player-joined", this.renderPlayersList);
			Simple.Events.on("display:start-game", this.startGame.bind(this));			
			Simple.Events.on("display:player-move", this.playerMove.bind(this));
		},

		createGame: function(){
			var numOfPlayers = parseInt($("#num-of-players").val());
			Simple.Events.trigger("display:generate-game", numOfPlayers);
		},

		showGameCode: function(data){
			$(".game-code").html(data.GameCode);
			$(".players-status").text("Venter på " + data.NumberOfPlayers + " spillere");
		},

		renderPlayersList: function(data){
			$(".players-list").empty();
			$(".players-status").text("Venter på " + data.NumberOfPlayersNotConnected + " spillere");
			var playersList = $(".players-list");
			for (var i = 0; i < data.Players.length; i++){
				playersList.append("<h2> " + data.Players[i]  + "</h2><br>");
			};

		},

		startGame:function(players){
			this.initiateWorld();				
			this.initiatePlayers(players);
		},
		initiateWorld: function(){
			this.el.html(this.gamePlayTemplate);			
			this.canvasEl = document.getElementById("gameCanvas");
			this.canvasEl.width = window.innerWidth - 100;
			this.canvasEl.height = window.innerHeight - 100;
			this.world = boxbox.createWorld(this.canvasEl, {
				scale: 10, 
				gravity: {x: 0, y: 0}
			});

			var verticalWall = {
			        name: 'wall',
			        type: 'static',
			        width: 4,
			        color: 'black',
			        height: window.innerHeight / 3,
			    };
			var horizontalWall = {
				        name: 'wall',
				        type: 'static',
				        height: 4,
				        color: 'black',
				        width: window.innerWidth / 3,
				    };	    
		   this.world.createEntity(verticalWall, {x: 0}); 
		   this.world.createEntity(verticalWall, {x: this.canvasEl.width/10});
		   this.world.createEntity(horizontalWall, {y: 0}); 
		   this.world.createEntity(horizontalWall, {y: this.canvasEl.height/10});
		   var objects = this.world.find(0,0,this.canvasEl.width, this.canvasEl.height);

		   for(var i = 0; i < objects.length; i++){
				if(objects[i].name() == "wall"){
					this.objectsList.push(objects[i]);	
				}			
			}
		},
		initiatePlayers: function(players){
			for(var i = 0; i < players.length; i++){		
				var xPos = Math.round(Math.random()*((this.canvasEl.width/10) - 10));
				var yPos = Math.round(Math.random()*((this.canvasEl.height/10) - 10));
				var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
				var player = this.world.createEntity({
						  name: players[i],
						  shape: "circle",
						  radius: 2,
						  color: randomColor,
						  x: xPos,
						  y: yPos,
						  type: "dynamic",
						  friction: 0,
						  restitution: 0
					});
				this.playersList.push(player);
			}	
			Simple.Events.trigger("display:players-created", this.playersList);
		},

		playerMove: function(data){
			for(var i = 0; i < this.playersList.length; i++){
				if(this.playersList[i].name() == data.PlayerId){
					this.playersList[i].setVelocity("player move", data.Hypotenus, data.Angle);
					//this.playersList[i].setForce("player power", data.Hypotenus*50, data.Angle );
				}
			}			
		},


	});
})(window.KOTH = window.KOTH || {}, Mustache);