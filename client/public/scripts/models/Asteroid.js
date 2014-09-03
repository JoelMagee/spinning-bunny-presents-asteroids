define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Asteroid = function Asteroid(midX, midY) {
        this.midX = midX;
        this.midY = midY;
		var maxWidth = 60;
		var minWidth = 20;
		this.color = 0x000000;
		this.width = Math.floor(Math.random() * (maxWidth-minWidth)) + minWidth;
		this.graphics = new PIXI.Graphics();
		
    };
	
    Asteroid.prototype = {
		draw: function () {	
			this.graphics.clear();
			this.graphics.beginFill(this.color);
			this.graphics.drawCircle(this.midX, this.midY, this.width/2);
			this.graphics.endFill();
		},
		destroy: function () {
				// asteroid gets destroyed
				
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

    return Asteroid;
});