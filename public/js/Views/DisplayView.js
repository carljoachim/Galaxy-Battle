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
			$(".players-status").text("Venter på " + data.NumberOfPlayers + " spillere");
		},

		renderPlayersList: function(data){
			$(".players-list").empty();
			$(".players-status").text("Venter på " + data.NumberOfPlayersNotConnected + " spillere");
			var playersList = $(".players-list");
			for (var i = 0; i < data.Players.length; i++){
				playersList.append("<h2> " + data.Players[i].SocketId  + "</h2><br>");
			};

		},

		startGame:function(players){
			//this.initiateWorld();			
			console.log(players);
			this.initiateField(players);						
			this.initiatePlayers(players);
			this.initiateBall();	
		},
		//degree: 0,
		initiateField: function(players){
			this.el.html(this.gamePlayTemplate);			
			this.canvasEl = document.getElementById("gameCanvas");
			this.canvasEl.width = window.innerHeight;
			this.canvasEl.height = window.innerHeight;
			var fieldCenterScaled = this.canvasEl.height / 20;

			this.world = boxbox.createWorld(this.canvasEl, {
				scale: 10, 
				gravity: {x: 0, y: 0}
				//collisionOutlines: true
			});

			var goalRadius = 5;
			var coordinates = [];
			
			for(var i = 0; i < players.length; i++){
				var angle = (( 2*Math.PI*i ) / players.length);
				var coordX = fieldCenterScaled - Math.sin(angle)*(fieldCenterScaled*0.8);
				var coordY = fieldCenterScaled - Math.cos(angle)*(fieldCenterScaled*0.8);
				coordinates.push({x: coordX, y: coordY});
			}

			for (var i = 0; i < players.length; i++) {
				var goal = {
			        name: 'goal' + players[i].SocketId,
			        shape: 'circle',
			        color: players[i].Color,
			        radius: goalRadius,
			        fixedRotation: true,
			        friction: 9999999,
			        density: 99999,
			        //image: '/img/planet_blue.png',
			        //imageStretchToFit: true,
			        restitution: 0,	
			        $rotation: (90 - (360*i/players.length)),
			        $rotationSpeed: (fieldCenterScaled*0.8*2*Math.PI)/10,
			        $points: 3
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
						  y: yPos,
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
						Simple.Events.trigger("display:point-update", goal);
					}
				});
			}
		},
		initiatePlayers: function(players){
			for(var i = 0; i < players.length; i++){		
				var xPos = this.canvasEl.width/20;
				var yPos = this.canvasEl.width/20;
				var player = this.world.createEntity({
						  name: players[i].SocketId,
						  shape: "circle",
						  radius: 2,
						  color: players[i].Color,
						  x: xPos,
						  y: yPos,
						  type: "dynamic",
						  //image: '/img/space_0000FF.png',
						  //imageStretchToFit: true,
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
})(window.KOTH = window.KOTH || {}, Mustache);