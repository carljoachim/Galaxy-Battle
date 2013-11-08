(function(GB, Mustache){
	GB.DisplayView = Simple.View.extend({
		events: {
            "click #generate-game": "createGame",       
        },
		introTemplate: 
		  "<div class='display-new-game-info'> "+
		     "<h3 class='header'> Galaxy Battle </h3>" +
   		  	 "Choose the number of players </br></br> <input id='num-of-players' type='number' min='2' max='8' value='2' >" +
   		  	 "<button id='generate-game'> Generate game </button> </br></br>" + 
   		  	 "Grab your phone. <br> </br>" +	
   		     "Go to </br></br> www.galaxybattle.org </br></br> on your phone and type in the generated code. </br> </br> Get ready to defend your planet!" +
   		     "</br> Defend your planet by avoiding the other players to push the star at your planet.</br>" + 
   		     "</br> Your planet is the one with the same color as your spaceship." + 
   		     "</br> Take a look at your mobile screen when the game starts to find your color." +
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
   		planetsRemaining: [],
   		planets: [],
   		initialize: function(options){
			this.model = options.model;			
			this.el.html(this.introTemplate);

			Simple.Events.on("display:game-generated", this.showGameCode);			
			Simple.Events.on("display:player-joined", this.renderPlayersList);
			Simple.Events.on("display:start-game", this.startGame.bind(this));			
			Simple.Events.on("display:player-move", this.playerMove.bind(this));
			Simple.Events.on("display:is-game-over", this.isGameOver.bind(this));
			Simple.Events.on("display:announce-winner", this.announceWinner.bind(this));
			Simple.Events.on("display:planet-hit", this.updatePlanet.bind(this));
		},

		createGame: function(){
			var numOfPlayers = parseInt($("#num-of-players").val());
			Simple.Events.trigger("display:generate-game", numOfPlayers);
		},

		showGameCode: function(data){
			$(".game-code").html(data.GameCode);
			$(".players-status").text("Waiting for " + data.NumberOfPlayers + " player(s)");
		},

		renderPlayersList: function(data){
			$(".players-list").empty();
			$(".players-status").text("Waiting for " + data.NumberOfPlayersNotConnected + " player(s)");
			var playersList = $(".players-list");
			for (var i = 0; i < data.Players.length; i++){
				playersList.append("<h4> " + data.Players[i].UserName  + "</h4><br>");
			};
		},

		startGame:function(players){
			this.initiateField(players);						
			this.initiatePlayers(players);
			this.initiateStar();	
		},
		initiateField: function(players){
			this.el.html(this.gamePlayTemplate);			
			this.canvasEl = document.getElementById("gameCanvas");
			this.canvasEl.width = window.innerHeight * 0.98;
			this.canvasEl.height = window.innerHeight * 0.98;
			var fieldCenterScaled = this.canvasEl.height / 20;

			this.world = boxbox.createWorld(this.canvasEl, {
				scale: 10, 
				gravity: {x: 0, y: 0}
				//collisionOutlines: true
			});

			var planetRadius = 3;
			var coordinates = [];
			
			for(var i = 0; i < players.length; i++){
				var angle = (( 2*Math.PI*i ) / players.length);
				var coordX = fieldCenterScaled - Math.sin(angle)*(fieldCenterScaled*0.8);
				var coordY = fieldCenterScaled - Math.cos(angle)*(fieldCenterScaled*0.8);
				coordinates.push({x: coordX, y: coordY});
			}

			for (var i = 0; i < players.length; i++) {
				var colorStrippedForHash =  players[i].Color.replace('#','');
				var planet = {
			        name: 'planet' + players[i].SocketId,
			        shape: 'circle',
			        color: players[i].Color,
			        radius: planetRadius,
			        fixedRotation: true,
			        friction: 9999,
			        density: 9999,
			        image: '/img/planets/planet' + colorStrippedForHash + '.png',
			        imageOffsetX: -1.8,
			        imageOffsetY: -1.8,
			        restitution: 0,	
			        $rotation: (90 - (360*i/players.length)),
			        $rotationSpeed: (fieldCenterScaled*0.8*2*Math.PI)/10,
			        $points: 5,
			        $playerName: players[i].UserName,
			        $type: 'planet',
			        $color: colorStrippedForHash
				}
				this.world.createEntity(planet, coordinates[i]); 
			};

			var verticalWall = {
				name: 'wall',
				type: 'static',
				color: 'black',
				height: fieldCenterScaled*2,
				width: 2
			}
			this.world.createEntity(verticalWall, {x: 0, y: fieldCenterScaled}); 
			this.world.createEntity(verticalWall, {x: fieldCenterScaled*2, y: fieldCenterScaled}); 

			var horizontalWall = {
				name: 'wall',
				type: 'static',
				color: 'black',
				height: 2,
				width: fieldCenterScaled*2
			}
			this.world.createEntity(horizontalWall, {x: fieldCenterScaled, y: 0}); 
			this.world.createEntity(horizontalWall, {x: fieldCenterScaled, y: fieldCenterScaled*2}); 

			var objects = this.world.find(0,0,fieldCenterScaled*2, fieldCenterScaled*2);
			for (var i = 0; i < objects.length; i++) {
				if(objects[i].name().substring(0,6) == 'planet'){
					this.planets.push(objects[i]);
					this.planetsRemaining.push(objects[i]);
				}
			};
			for (var i = 0; i < this.planets.length; i++) {		
			 	this.planets[i].onTick(function(){			
			 		this.setVelocity('rotating planet', this.$rotationSpeed, this.$rotation);			 		
			 		this.$rotation += 1.8;		 				 		
			 	});
			}
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
		initiateStar: function(){
			var xPos = this.canvasEl.width/20;
			var yPos = this.canvasEl.height/20;
			var star = this.world.createEntity({
						  name: "star",
						  shape: "circle",
						  radius: 1.2,
						  x: xPos,
						  y: yPos + 10,
						  type: "dynamic",
						  friction: 3,
						  restitution: 0.5,
						  image: '/img/mario_star.png',
						  imageStretchToFit: true
					});

			for(var i = 0; i < this.planets.length; i++){
				var planet = this.planets[i];
				star.onStartContact(function(planet){
					if(planet.$points != 1){
						planet.$points -= 1;
						Simple.Events.trigger("display:point-update", planet);						
						Simple.Events.trigger("display:planet-hit", planet);
					}else{
						planet.destroy();
						planet.$points = 0;
						Simple.Events.trigger("display:is-game-over", planet);
						Simple.Events.trigger("display:point-update", planet);
					}
				});
			}
		},
		initiatePlayers: function(players){
			for(var i = 0; i < players.length; i++){		
				var xPos = this.canvasEl.width/20;
				var yPos = this.canvasEl.width/20;
				var colorStrippedForHash =  players[i].Color.replace('#','');
				var player = this.world.createEntity({
						  name: players[i].SocketId,
						  shape: "circle",
						  radius: 2,
						  color: players[i].Color,
						  x: xPos,
						  y: yPos,
						  type: "dynamic",
						  image: '/img/spacecrafts/spacecraft' + colorStrippedForHash + '.png',
						  imageStretchToFit: true,
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
					this.playersList[i].setVelocity("player move", data.Phi, data.Angle);
				}
			}			
		},
		updatePlanet: function(planet){
			if(planet.$type == 'planet'){
				planet.image('/img/planets/planet' + planet.$color + 'hit' + planet.$points + '.png');
			}
		},
		isGameOver: function(planet){
			var planetIndex = this.planetsRemaining.indexOf(planet);
			this.planetsRemaining.splice(planetIndex, 1);

			if(this.planetsRemaining.length == 1){
				var winningPlanet = this.planetsRemaining[0];	
				var objects = this.world.find(0,0, this.canvasEl.width, this.canvasEl.width);	
				for (var i = 0; i < objects.length; i++) {
					objects[i].setVelocity("stop objects", 0, 0);
				};
				Simple.Events.trigger("display:announce-winner", winningPlanet);
			}	
		},
		announceWinner: function(winningPlanet){
			var winnerBanner = "<div class='winner-banner'>Congratulations " + winningPlanet.$playerName + " </br></br>You won!</div>";
			$("body").append(winnerBanner);
		}

	});
})(window.GB = window.GB || {}, Mustache);