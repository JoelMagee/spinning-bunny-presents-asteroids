define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
	
	var GameEndPhase = function(world, ships, bullets, asteroids, explosions, socket, doneScores) {
		this.world = world;
		this.ships = ships;
		this.bullets = bullets;
		this.asteroids = asteroids;
		this.explosions = explosions;
		this.socket = socket;
		this.doneScores = doneScores;
	};
	
	GameEndPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	GameEndPhase.prototype.onStart = function () {
		console.log("Game End phase has started");
		
		this.socket.emit('info lobby', {});

		this.world.removeChildren(2); // removes children from index 2 to the end
		var bulletGraphics = this.world.getChildAt(1);
		if (bulletGraphics.children.length > 0) {
			bulletGraphics.removeChildren();
		}
		this.ships.length = 0;
		this.bullets.length = 0;
		this.asteroids.length = 0;
		this.explosions.length = 0;
		
		console.log(this.doneScores());
		if (this.doneScores()) {	
			$('#end-game-modal').modal('show');
		} else {
			$('.screen').hide();
			$('#dashboard-screen').show();
		}
		
	};
	
	GameEndPhase.prototype.draw = function () {
	};
	
	GameEndPhase.prototype.update = function () {
	};
	
	GameEndPhase.prototype.onEnd = function () {
		console.log("Game End phase has ended");
		
		this.doneScores(false);
		
	};
	
	return GameEndPhase;
	
});