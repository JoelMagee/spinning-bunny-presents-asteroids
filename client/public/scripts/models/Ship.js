define([
	'pixi',
	'models/Helper'
], function(PIXI, Helper) {
    'use strict';

    var Ship = function Ship(username) {
		
		this.width = 200;
		this.color = 0xF05800;
		this.graphics = new PIXI.Graphics();
		this.ghostGraphics = new PIXI.Graphics();
		this.explosionGraphics = new PIXI.Graphics();
		// this.explosionGraphics.alpha = 0;
		this.explosionWidth = 0;
		this.text = new PIXI.Text(username, {font: '100px Verdana', fill: '#FFFFFF'});
		this.username = username;
		this.text.anchor.x = 0.5;
		this.text.anchor.y = 0.5;
		this.ghostAlpha = 0.5;
		this.rotation = 0;
		
		this.animateTurn = false;
		
		this.startPosition = {}; //Start position for each turn
		this.position = {}; //Current position
		this.destination = {}; //Next destination for replay
		this.previousPrediction = {}; //Prediction point from previous move
		this.prediction = {}; //Next prediction from ship momentum

		this.currentMove = {};
		
		this.timeElapsed = 0; //Time elapsed in ms in current replay
		this.replayTime = 2000;

    };
	
    Ship.prototype = {
		draw: function() {

			this.explosionGraphics.clear();
			this.explosionGraphics.lineStyle(20, 0xFFFFFF, 1);
			this.explosionGraphics.drawCircle(0, 0, this.explosionWidth);
			// this.explosionGraphics.lineStyle(20, 0xFF00FF, 1);
			// this.explosionGraphics.drawCircle(0, 0, this.explosionWidth/2);
			// this.explosionGraphics.lineStyle(20, 0x00FFFF, 1);
			// this.explosionGraphics.drawCircle(0, 0, this.explosionWidth/3);
			
			this.graphics.clear();
			this.graphics.beginFill(this.color);
			this.graphics.moveTo(0-this.width/4, 0);
			this.graphics.lineTo(0-this.width/2, 0-this.width/2);
			this.graphics.lineTo(0+this.width/2, 0);
			this.graphics.lineTo(0-this.width/2, 0+this.width/2);
			this.graphics.endFill();
			
			this.graphics.x = this.position.x;
			this.graphics.y = this.position.y;
			
			this.explosionGraphics.x = this.position.x;
			this.explosionGraphics.y = this.position.y;
			
			this.text.x = this.position.x;
			this.text.y = this.position.y-this.width;
			
			this.graphics.rotation = this.rotation;
		},
		update: function(timeDif) {
			if (this.animateTurn) {
			
				this.timeElapsed += timeDif;
				
				var t = 1;
				
				if (this.timeElapsed <= this.replayTime) {
					t = this.timeElapsed/this.replayTime;
				}
				
				if (this.dead && t > this.collideT) {
					t = this.collideT;
					// this.explosionGraphics.alpha = 1;
					this.explosionWidth += 10;
				}
				
				this.position = Helper.getBezier(t, this.startPosition, this.previousPrediction, this.destination);
				var delta = Helper.getBezier(t+0.001, this.startPosition, this.previousPrediction, this.destination);
				delta.x = delta.x-this.position.x;
				delta.y = delta.y-this.position.y;
				this.rotation = Math.atan2(delta.y, delta.x);
			} else {
				this.explosionWidth += 10;
			}
			
		},
		setDestination: function(destination, prediction) {
			this.animateTurn = true;
			console.log("[Ship] Setting destination to: " + destination.x + ", " + destination.y + " and prediction to: " + prediction.x + ", " + prediction.y);
			this.startPosition = this.position;
			this.destination = destination;
			this.previousPrediction = this.prediction;
			this.prediction = prediction;
		},
		setInitialPosition: function(position) {
			console.log("[Ship] Setting initial position: " + position.x + ", " + position.y);
			this.startPosition = position;
			this.position = position;
			this.prediction = position;
			this.previousPrediction = position;
		},
		setCurrentMove: function(x, y) {
			console.log("[Ship] Setting current move position to: " + x + ", " + y);
			this.currentMove.x = x;
			this.currentMove.y = y;
		},
		addCollisions: function(collisionData) {
			var self = this;
			collisionData.forEach(function(collision) {
				if (collision.livesLeft === 0) {
					self.dead = true;
				}
				self.collideT = collision.t;
			});
		},
		drawGhost: function(x, y) {
			
			this.ghostGraphics.clear();
			this.ghostGraphics.beginFill(this.color, this.ghostAlpha);
			this.ghostGraphics.moveTo(0-this.width/4, 0);
			this.ghostGraphics.lineTo(0-this.width/2, 0-this.width/2);
			this.ghostGraphics.lineTo(0+this.width/2, 0);
			this.ghostGraphics.lineTo(0-this.width/2, 0+this.width/2);
			this.ghostGraphics.endFill();
			
			this.ghostGraphics.x = x;
			this.ghostGraphics.y = y;
			
			var prevPos = Helper.getBezier(1, this.position, this.prediction, {'x': x, 'y': y});
			var delta = Helper.getBezier(1+0.001, this.position, this.prediction, {'x': x, 'y': y});
			delta.x = delta.x-prevPos.x;
			delta.y = delta.y-prevPos.y;
			this.ghostGraphics.rotation = Math.atan2(delta.y, delta.x);
			
		},
		clearGhost: function() {
			this.ghostGraphics.clear();
		},
		destroy: function() {
			//ship gets destroyed
			
			var self = this;
			var interval = setInterval(function() {
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