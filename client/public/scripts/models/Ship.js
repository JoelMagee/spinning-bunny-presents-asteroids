define([
	'pixi',
	'models/Helper'
], function (PIXI, Helper) {
    'use strict';

    var Ship = function Ship(username) {
	
		var colors = [0x0000FF, 0xFFFF00, 0xFF0000];
		
        // this.midX = midX;
        // this.midY = midY;
		this.width = 200;
		this.color = colors[Math.floor(Math.random()*3)];
		this.color = colors[0];
		this.graphics = new PIXI.Graphics();
		//this.dest = dest;
		this.username = username;
		this.text = new PIXI.Text(username, {font: '50px Arial'});
		this.text.anchor.x = 0.5;
		this.text.anchor.y = 0.5;
		this.ghostAlpha = 0.5;
		// this.prevX = midX;
		// this.prevY = midY;
		// this.prevDest = this.dest;
		// this.nextX = undefined;
		// this.nextY = undefined;
		
		this.startPosition = {}; //Start position for each turn
		this.position = {}; //Current position
		this.destination = {}; //Next destination for replay
		this.previousPrediction = {}; //Prediction point from previous move
		this.prediction = {}; //Next prediction from ship momentum
		
		this.currentMove = {};
		
		this.replay = false; //Whether the ship is currently animating
		this.timeElapsed = 0; //Time elapsed in ms in current replay
		this.replayTime = 2000; 
		
    };
	
    Ship.prototype = {
		draw: function () {	
			this.graphics.clear();
			this.graphics.beginFill(this.color);
			this.graphics.moveTo(0-this.width/4, 0);
			this.graphics.lineTo(0-this.width/2, 0-this.width/2);
			this.graphics.lineTo(0+this.width/2, 0);
			this.graphics.lineTo(0-this.width/2, 0+this.width/2);
			this.graphics.endFill();
						
			this.graphics.x = this.position.x;
			this.graphics.y = this.position.y;
			
			this.text.x = this.position.x;
			this.text.y = this.position.y-this.width;
		},
		update: function (timeDif) {
			if (!this.replay) {
				return false;
			}
			
			this.timeElapsed += timeDif;
			
			var t = 1;
			
			if (this.timeElapsed <= this.replayTime) {
				t = this.timeElapsed/this.replayTime;
			}
			
			this.position = Helper.getBezier(t, this.startPosition, this.previousPrediction, this.destination);
		},
		setDestination: function(destination, prediction) {
			this.startPosition = this.position;
			this.destination = destination;
			this.previousPrediction = this.prediction;
			this.prediction = prediction;
		},
		startReplay: function() {
			this.replay = true;
		},
		setInitialPosition: function(position) {
			this.startPosition = position;
			this.position = position;
			this.predicition = position;
			this.previousPrediction = position;
		},
		setCurrentMove: function(x, y) {
			this.currentMove.x = x;
			this.currentMove.y = y;
		},
		drawGhost: function (x, y) {
			
			var transformX = x - this.position.x;
			var transformY = y - this.position.y;
			
			this.graphics.beginFill(this.color, this.ghostAlpha);
			this.graphics.moveTo(transformX-this.width/4, transformY);
			this.graphics.lineTo(transformX-this.width/2, transformY-this.width/2);
			this.graphics.lineTo(transformX+this.width/2, transformY);
			this.graphics.lineTo(transformX-this.width/2, transformY+this.width/2);
			this.graphics.endFill();
			
		},
		rotateToPoint: function(x, y) {
			var deltaY = y - this.position.x;
			var deltaX = x - this.position.y;
			var angle = Math.atan2(deltaY, deltaX);
			this.graphics.rotation = angle;
		},
		destroy: function () {
				//ship gets destroyed
				
				var self = this;
				var interval = setInterval(function () {
					if (self.graphics.alpha > 0) {
						self.graphics.alpha -= 0.25;
					} else {
						clearInterval(interval);
					}
				}, 500);
				
		}
    };

    return Ship;
});