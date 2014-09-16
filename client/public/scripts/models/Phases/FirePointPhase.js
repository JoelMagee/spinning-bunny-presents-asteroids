define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';

	var FirePointPhase = function(stage, mouse, ui, ships, phaseTitle) {
		this.stage = stage;
		this.mouse = mouse;
		this.ui = ui;
		this.ships = ships;
		this.phaseTitle = phaseTitle;
	};
	
	FirePointPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	FirePointPhase.prototype.onStart = function () {
		console.log("Fire Point phase has started");
		
		var self = this;
		
		this.phaseTitle('Select your firing start point');
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) {
				self.ui.startDrag(data);
			} else if (data.originalEvent.which === 1) {
				if (self.ui.setFirePoint()) {
					self.emitEvent('fire point set');
				}
			}
		};
		
		this.stage.mousemove = function(data) {
			self.ui.drag(data);
		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
	};
	
	FirePointPhase.prototype.draw = function () {
		// console.log("Fire Point phase is drawing");
		
		this.ui.clientShip.drawGhost(this.ui.movementPosition.x, this.ui.movementPosition.y);
		
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
		
		this.ui.firePoint.x = this.mouse.x();
		this.ui.firePoint.y = this.mouse.y();
	};
	
	FirePointPhase.prototype.onEnd = function () {
		console.log("Fire Point phase has ended");
		
		this.phaseTitle('');
		
		this.ui.clientShip.clearGhost();
		
		this.ui.clearMovementLine();
		this.ui.clearFirePoint();
		
		this.stage.mousedown = function () {};
		this.stage.mouseup = function () {};
	};
	
	return FirePointPhase;
	
});