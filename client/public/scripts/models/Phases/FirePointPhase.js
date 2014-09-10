define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';

	var FirePointPhase = function(stage, mouse, ui, ships) {
		this.stage = stage;
		this.mouse = mouse;
		this.ui = ui;
		this.ships = ships;
	};
	
	FirePointPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	FirePointPhase.prototype.onStart = function () {
		console.log("Fire Point phase has started");
		
		var self = this;
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
				self.ui.startDrag();
			} else if (data.originalEvent.which === 1) {
				if (self.ui.setFirePoint()) {
					self.emitEvent('fire point set');
				}
	
			}

		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
	};
	
	FirePointPhase.prototype.draw = function () {
		// console.log("Fire Point phase is drawing");
		
		this.ui.clearMovementLine();
		this.ui.drawMovementLine();
		
		this.ui.clearFirePoint();
		this.ui.drawFirePoint();
		
		this.ships.forEach(function(ship) {
			ship.draw();
		});
	};
	
	FirePointPhase.prototype.update = function () {
		// console.log("Fire Point phase is updating");
		
		this.ui.firePoint = {'x': this.mouse.x(), 'y': this.mouse.y()};
	};
	
	FirePointPhase.prototype.onEnd = function () {
		console.log("Fire Point phase has ended");
		
		this.ui.clearMovementLine();
		this.ui.clearFirePoint();
		
		this.stage.mousedown = function () {};
		this.stage.mouseup = function () {};
	};
	
	return FirePointPhase;
	
});