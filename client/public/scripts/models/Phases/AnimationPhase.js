define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var AnimationPhase = function(ui, ships, bullets, stage, mouse) {
		this.ui = ui;
		this.ships = ships;
		this.bullets = bullets;
		this.stage = stage;
		this.mouse = mouse;
	};
	
	AnimationPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	AnimationPhase.prototype.onStart = function () {
		console.log("Animation phase has started");
		
		var self = this;
		
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.ships.forEach(function(ship) {
			ship.timeElapsed = 0;
		});
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
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
		
		if (this.elapsedTime >= 2000) {
			this.emitEvent('animation finished');
		}
	};
	
	AnimationPhase.prototype.update = function (timeDiff) {
		// console.log("Animation phase is updating");
		
		this.elapsedTime += timeDiff;
		
		this.ships.forEach(function(ship) {
			ship.update(timeDiff);
		});
		
		// Possible stuff to do for each bullet
		this.bullets.forEach(function(bullet) {
			bullet.update(timeDiff);
		});
	};
	
	AnimationPhase.prototype.onEnd = function () {
		console.log("Animation phase has ended");
		
		this.ships.forEach(function(ship) {
			ship.animateTurn = false;
		});
		
	};
	
	return AnimationPhase;
	
});