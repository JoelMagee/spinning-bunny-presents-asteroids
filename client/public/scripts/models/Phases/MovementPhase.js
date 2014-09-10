define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';

	var MovementPhase = function(stage, mouse, ui, ships) {
		this.stage = stage;
		this.mouse = mouse;
		this.ui = ui;
		this.ships = ships;
	};
	
	MovementPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	MovementPhase.prototype.onStart = function () {
		console.log("Movement phase has started");
		//Add mouse movement listeners for bezier curve drawing
		
		var self = this;
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
				self.ui.startDrag();
			} else if (data.originalEvent.which === 1) {
				if (self.ui.setMove()) {
					self.emitEvent('movement set');
				}
			}

		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
	};
	
	MovementPhase.prototype.draw = function () {
		// console.log("Movement phase is drawing");
		this.ui.clearMovementLine();
		this.ui.drawMovementLine();
		
		this.ships.forEach(function(ship) {
			ship.draw();
		});
	};
	
	MovementPhase.prototype.update = function (t) {
		// console.log("Movement phase is updating");
		//Update current points
		this.ui.movementPosition.x = this.mouse.x();
		this.ui.movementPosition.y = this.mouse.y();
	};
	
			
	MovementPhase.prototype.onEnd = function () {
		console.log("Movement phase has ended");
		
		this.ui.clearMovementLine();
		
		this.stage.mousedown = function () {};
		this.stage.mouseup = function () {};
		
		this.emitEvent('movement end');
	};
	
	return MovementPhase;

});