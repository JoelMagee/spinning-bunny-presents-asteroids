define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Explosion = function Explosion(position, collideT) {
        this.midX = position.x;
        this.midY = position.y;
		this.color = 0xFFFFFF;
		this.radius = 0;
		this.alpha = 1;
		this.graphics = new PIXI.Graphics();
		this.animationTime = 2000;
		this.startAnimation = collideT*this.animationTime;
		this.elapsedTime = 0;
		
    };
	
    Explosion.prototype = {
		draw: function() {
			this.graphics.clear();
			this.graphics.lineStyle(20, this.color, this.alpha);
			this.graphics.drawCircle(this.midX, this.midY, this.radius);
		},
		update: function() {
			this.radius += 10;
			this.alpha -= 0.01;
		}
    };

    return Explosion;
});