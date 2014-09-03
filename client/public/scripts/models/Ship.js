define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Ship = function Ship(midX, midY, width, color) {
        this.midX = midX;
        this.midY = midY;
		this.width = width;
		this.color = color;
		this.graphics = new PIXI.Graphics();
		this.dest = new PIXI.Point(this.midX+40, this.midY); // +40 from original
		
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
						
			this.graphics.x = this.midX;
			this.graphics.y = this.midY;
		},
		rotateToPoint: function(x, y) {
			var deltaY = y - this.midY;
			var deltaX = x - this.midX;
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