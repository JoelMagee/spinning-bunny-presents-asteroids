define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
	
	var GameEndPhase = function(world, ships, bullets, asteroids, explosions, socket, scores) {
		this.world = world;
		this.ships = ships;
		this.bullets = bullets;
		this.asteroids = asteroids;
		this.explosions = explosions;
		this.socket = socket;
		this.scores = scores;
		
		this.result = {};
		this.highestScore = Number.NEGATIVE_INFINITY;
	};
	
	GameEndPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	GameEndPhase.prototype.onStart = function () {
		console.log("Game End phase has started");
		
		
		this.result.winners = [];
		
		console.log(this.scores);
		console.log(this.highestScore);
		if (this.scores.hasOwnProperty('result')) {
			for (var username in this.scores.result) {
				if (this.scores.result[username].score > this.highestScore) {
					this.result.winners.push(username);
					this.highestScore = this.scores.result[username].score;
					this.result.score = this.highestScore;
				} else if (this.scores.result[username].score === this.highestScore) {
					this.result.winners.push(username);
				}
			};
		
			alert('Game over! Winner: ' + this.result.winners[0] + ', Score: ' + this.result.score);
		
		} else {
			alert('Left game');
		}
		
		
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
		
		$('.screen').hide();
		$('#dashboard-screen').show();
	};
	
	GameEndPhase.prototype.draw = function () {
	};
	
	GameEndPhase.prototype.update = function () {
	};
	
	GameEndPhase.prototype.onEnd = function () {
		console.log("Game End phase has ended");
		
		this.scores = {};
		
		this.result = {};
		this.highestScore = Number.NEGATIVE_INFINITY;
		
	};
	
	return GameEndPhase;
	
});