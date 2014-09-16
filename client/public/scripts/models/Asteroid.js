define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Asteroid = function Asteroid(position, radius) {
        this.midX = position.x;
        this.midY = position.y;
		this.color = 0xFFFFFF;
		this.radius = radius;
		this.graphics = new PIXI.Graphics();
		
    };
	
    Asteroid.prototype = {
		draw: function () {
			this.graphics.clear();
			this.graphics.beginFill(this.color);
			this.graphics.drawCircle(this.midX, this.midY, this.radius);
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