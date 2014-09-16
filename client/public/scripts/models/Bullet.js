define([
	'jquery',
	'pixi'
], function ($, PIXI) {
    'use strict';

    var Bullet = function Bullet(bullet) {
		
		this.destroyed = bullet.destroyed;
		this.destroyedAt = bullet.destroyedAt;
		this.direction = bullet.direction;
		this.originPosition = bullet.originPosition;
		this.startT = bullet.startT;
		this.turnStartPosition = bullet.turnStartPosition;
		this.speed = bullet.speed;
		
		this.width = 50;
		this.color = 0x00F0EE;
		this.graphics = new PIXI.Graphics();
		this.rotation = this.direction-Math.PI;
		if (!bullet.turnStartPosition.hasOwnProperty('x')) {
			this.position = this.originPosition;
		} else {
			this.position = this.turnStartPosition;
		}
		
		this.timeElapsed = 0; // Time elapsed in ms in current replay
		this.replayTime = 2000;		
    };
	
    Bullet.prototype = {
		draw: function () {	
			if (this.timeElapsed/this.replayTime >= this.startT) {
				this.graphics.clear();
				this.graphics.beginFill(this.color);
				this.graphics.drawRect(0-this.width/2, 0-this.width/2, this.width, this.width);
				this.graphics.endFill();
				
				this.graphics.x = this.position.x;
				this.graphics.y = this.position.y;
				this.graphics.rotation = this.rotation;
			}
		},
		update: function (timeDif) {
			
			this.timeElapsed += timeDif;
			
			var t = 1;
			
			var dt = timeDif/this.replayTime;
			
			if (this.timeElapsed <= this.replayTime) {
				t = this.timeElapsed/this.replayTime;
			}
			
			if (t < this.startT) {
				return;
			}
			
			if (this.destroyed && t > this.destroyedAt) {
				return;
			}

			var dx = Math.cos(this.direction) * dt * this.speed;
			var dy = Math.sin(this.direction) * dt * this.speed;

			this.position.x += dx;
			this.position.y += dy;
			
		},
		destroy: function () {
			//bullet gets destroyed
			
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

    return Bullet;
});