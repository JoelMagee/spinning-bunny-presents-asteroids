define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Explosion = function Explosion(position, collideT, alphaRate, muted) {
        this.midX = position.x;
        this.midY = position.y;
		this.color = 0xFFFFFF;
		this.radius = 0;
		this.alpha = 1;
		this.alphaRate = alphaRate;
		this.graphics = new PIXI.Graphics();
		this.animationTime = 2000;
		this.startAnimation = collideT*this.animationTime;
		this.elapsedTime = 0;
		
		this.sound = new Audio("../../assets/sounds/explosion3.mp3");
		this.muted = muted;
		
    };
	
    Explosion.prototype = {
		draw: function() {
			this.graphics.clear();
			this.graphics.lineStyle(20, this.color, this.alpha);
			this.graphics.drawCircle(this.midX, this.midY, this.radius);
		},
		update: function() {
			this.radius += 10;
			this.alpha -= this.alphaRate;
		},
		playSound: function() {
			this.sound.play();
		}
    };

    return Explosion;
});