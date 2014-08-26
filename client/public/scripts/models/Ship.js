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
		
    };
	
    Ship.prototype = {
		draw: function () {	
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
				this.graphics.beginFill(0xFFFF00);
				this.graphics.drawCircle(0, 0, this.width/3);
				this.graphics.endFill();
		}
    };

    return Ship;
});