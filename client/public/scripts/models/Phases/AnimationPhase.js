define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var AnimationPhase = function(ui, ships, bullets, explosions, stage, mouse, phaseTitle) {
		this.ui = ui;
		this.ships = ships;
		this.bullets = bullets;
		this.explosions = explosions;
		this.startedExplosions = [];
		this.stage = stage;
		this.mouse = mouse;
		this.phaseTitle = phaseTitle;
	};
	
	AnimationPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	AnimationPhase.prototype.onStart = function () {
		console.log("Animation phase has started");
		
		var self = this;
		
		this.phaseTitle('Animating');
		
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.ships.forEach(function(ship) {
			ship.timeElapsed = 0;
		});
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) {
				self.ui.startDrag(data);
			} else if (data.originalEvent.which === 1) {
				// do nothing
			}
		};
		
		this.stage.mousemove = function(data) {
			self.ui.drag(data);
		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
	};
	
	AnimationPhase.prototype.draw = function () {
		// console.log("Animation phase is drawing");
		
		this.ships.forEach(function(ship) {
			ship.draw();
		});
		
		this.bullets.forEach(function(bullet) {
			bullet.draw();
		});
		
		this.startedExplosions.forEach(function(explosion) {
			explosion.draw();
		});
		
		// console.log(
		if (this.elapsedTime >= 2000) {
			console.log("emitting animation finished");
			this.emitEvent('animation finished');
		}
	};
	
	AnimationPhase.prototype.update = function (timeDiff) {
		// console.log("Animation phase is updating");
		
		var self = this;
		
		this.elapsedTime += timeDiff;
		
		this.ships.forEach(function(ship) {
			ship.update(timeDiff);
			
			if (self.elapsedTime >= ship.startSound && ship.shotThisTurn && !ship.muted()) {
				ship.playSound();
				ship.shotThisTurn = false;
			}
		});
		
		this.bullets.forEach(function(bullet) {
			bullet.update(timeDiff);
		});
			
		this.explosions.forEach(function(explosion) {
			if (self.elapsedTime >= explosion.startAnimation) {
				if (!explosion.muted()) {
					explosion.playSound();
				}
				self.startedExplosions.push(explosion);
				self.explosions.splice(self.explosions.indexOf(explosion), 1);
			}
		});
		
		this.startedExplosions.forEach(function(explosion) {
			if (explosion.alpha < 0 ) {
				self.startedExplosions.splice(self.startedExplosions.indexOf(explosion), 1);
			}
			explosion.update();
		});
	};
	
	AnimationPhase.prototype.onEnd = function () {
		console.log("Animation phase has ended");
		
		this.phaseTitle('');
		
		this.ships.forEach(function(ship) {
			ship.animateTurn = false;
		});
		
	};
	
	return AnimationPhase;
	
});