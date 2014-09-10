define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';

	var FireDirectionPhase = function(stage, mouse, ui, ships) {
		this.stage = stage;
		this.mouse = mouse;
		this.ui = ui;
		this.ships = ships;
	};
	
	FireDirectionPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	FireDirectionPhase.prototype.onStart = function () {
		console.log("Fire Direction phase has started");
		
		var self = this;
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
				self.ui.startDrag();
			} else if (data.originalEvent.which === 1) {
				if (self.ui.setFireDestination()) {
					self.emitEvent('fire direction set');
				}
	
			}

		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
	};
	
	FireDirectionPhase.prototype.draw = function () {
		// console.log("Fire Direction phase is drawing");
		
		this.ui.clearMovementLine();
		this.ui.drawMovementLine();
		
		this.ui.clearFirePoint();
		this.ui.drawFirePoint();
		
		this.ui.clearFireLine();
		this.ui.drawFireLine();
		
		this.ships.forEach(function(ship) {
			ship.draw();
		});
	};
	
	FireDirectionPhase.prototype.update = function () {
		// console.log("Fire Direction phase is updating");
		
		this.ui.possibleFireDestination.x = this.mouse.x();
		this.ui.possibleFireDestination.y = this.mouse.y();

	};
	
	FireDirectionPhase.prototype.onEnd = function () {
		console.log("Fire Direction phase has ended");
		
		this.ui.clearMovementLine();
		this.ui.clearFirePoint();
		this.ui.clearFireLine();
		
		this.stage.mousedown = function () {};
		this.stage.mouseup = function () {};

	};
	
	return FireDirectionPhase;
	
});