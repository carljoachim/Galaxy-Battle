(function(GB, Mustache){
	GB.DisplayView = Simple.View.extend({
		events: {
            "click #generate-game": "createGame",       
        },
		introTemplate: 
		  "<div class='display-new-game-info'> "+
		     "<h3 class='header'> Galaxy Battle </h3>" +
   		  	 "Choose the number of players </br></br> <input id='num-of-players' type='number' min='1' max='8' value='1' >" +
   		  	 "<button id='generate-game'> Generate game </button> </br></br>" + 
   		  	 "Grab your phone <br><br> " +	
   		     "Go to </br></br> www.galaxybattle.org </br></br> on your phone type, the generated code and defend your planet!" +
   		     "<h1 class='game-code'></h1><br>" +
   		     "<div class='players-status'></div>" +
   		     "<div class='players-list'></div>" +
   		  "</div>" + 	
	   		  "<div class='planet-image planet-green'></div>" +
	   		  "<div class='planet-image planet-red'></div>" +
		      "<div class='planet-image planet-blue'></div>" +
	          "<div class='planet-image planet-yellow'></div>" +
		      "<div class='planet-image planet-grey'></div>" +
		      "<div class='planet-image planet-white'></div>" +
              "<div class='planet-image planet-lightblue'></div>",

		gamePlayTemplate:
   		   "<div class='game-wrapper'><canvas id='gameCanvas'></canvas></div>",
   		canvasWrapper: null,
   		canvasEl: null,
   		world: null,
   		playersList: [],
   		goals: [],
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
			this.initiateBall();	
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

			var goalRadius = 3;
			var coordinates = [];
			
			for(var i = 0; i < players.length; i++){
				var angle = (( 2*Math.PI*i ) / players.length);
				var coordX = fieldCenterScaled - Math.sin(angle)*(fieldCenterScaled*0.8);
				var coordY = fieldCenterScaled - Math.cos(angle)*(fieldCenterScaled*0.8);
				coordinates.push({x: coordX, y: coordY});
			}

			for (var i = 0; i < players.length; i++) {
				var colorStrippedForHash =  players[i].Color.replace('#','');
				var goal = {
			        name: 'goal' + players[i].SocketId,
			        shape: 'circle',
			        color: players[i].Color,
			        radius: goalRadius,
			        fixedRotation: true,
			        friction: 9999999,
			        density: 99999,
			        image: '/img/planets/planet' + colorStrippedForHash + '.png',
			        imageOffsetX: -1.8,
			        imageOffsetY: -1.8,
			        restitution: 0,	
			        $rotation: (90 - (360*i/players.length)),
			        $rotationSpeed: (fieldCenterScaled*0.8*2*Math.PI)/10,
			        $points: 5
				}
				this.world.createEntity(goal, coordinates[i]); 
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
				if(objects[i].name().substring(0,4) == 'goal'){
					this.goals.push(objects[i]);
				}
			};

			for (var i = 0; i < this.goals.length; i++) {
			 	this.goals[i].onTick(function(){			
			 		this.setVelocity('rotating goal', this.$rotationSpeed, this.$rotation);			 		
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
		initiateBall: function(){
			var xPos = this.canvasEl.width/20;
			var yPos = this.canvasEl.height/20;
			var ball = this.world.createEntity({
						  name: "ball",
						  shape: "circle",
						  radius: 1,
						  x: xPos,
						  y: yPos + 10,
						  type: "dynamic",
						  friction: 3,
						  restitution: 0.5,
						  image: '/img/mario_star.png',
						  imageStretchToFit: true
					});

			for(var i = 0; i < this.goals.length; i++){
				var goal = this.goals[i];
				ball.onStartContact(function(goal){
					if(goal.$points != 1){
						goal.$points -= 1;
						Simple.Events.trigger("display:point-update", goal);
					}else{
						goal.destroy();
						goal.$points = 0;
						Simple.Events.trigger("display:point-update", goal);
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
					this.playersList[i].setVelocity("player move", data.Hypotenus, data.Angle);
					//this.playersList[i].setForce("player power", data.Hypotenus*50, data.Angle );
				}
			}			
		}

	});
})(window.GB = window.GB || {}, Mustache);