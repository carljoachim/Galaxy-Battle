(function(GB){
	GB.ScoreBoardView = Simple.View.extend({
	      scoreBoardTemplate: "<div class='scoreBoard'> " +
        					"<h1 class='header'> Galaxy Battle </h1> <br> " + 					
        					"</div>",

        initialize: function(options){       	
			    this.model = options.model;			
        	Simple.Events.on("display:start-game", this.showScoreBoard.bind(this));
        	Simple.Events.on("display:point-update", this.updateScoreBoard)
        },
        showScoreBoard: function(){
        	this.el.html(this.scoreBoardTemplate);
        	for (var i = 0; i < this.model.players.length; i++) {
        		$(".scoreBoard").append(
        			"<div class='player' data-id=" + this.model.players[i].SocketId + ">" + 
        				"<div class='player-name'>" + this.model.players[i].UserName + "</div>" + 
        				"<div class='player-score-wrapper'>" + 
        					"<div class='player-score' data-id=" + this.model.players[i].SocketId +  " data-score-count=0 style='background-color:" + this.model.players[i].Color + "'></div>" +
        					"<div class='player-score' data-id=" + this.model.players[i].SocketId +  " data-score-count=1 style='background-color:" + this.model.players[i].Color + "'></div>" +
        					"<div class='player-score' data-id=" + this.model.players[i].SocketId +  " data-score-count=2 style='background-color:" + this.model.players[i].Color + "'></div>" +
        					"<div class='player-score' data-id=" + this.model.players[i].SocketId +  " data-score-count=3 style='background-color:" + this.model.players[i].Color + "'></div>" +
        					"<div class='player-score' data-id=" + this.model.players[i].SocketId +  " data-score-count=4 style='background-color:" + this.model.players[i].Color + "'></div>" +
        				"</div>" + 
        			"</div>");
        	};
        },
        updateScoreBoard: function(data){
           	var players = $(".player");

           	 for(var i = 0; i < players.length; i++){
           	 	if("planet" + players.eq(i).data("id") == data.name()){
           	 	    var points = data.$points;
           	 	   	var playerScores = players.eq(i).find(".player-score");
           	 	   	for(var j = 0; j < playerScores.length; j++){
           	 	   		if(playerScores.eq(j).data("score-count") == points){
           	 	   			playerScores.eq(j).hide();
           	 	   		}
           	 	   	}
           	 	}
           	 }         
        }
           	  

	});
})(window.GB = window.GB || {});