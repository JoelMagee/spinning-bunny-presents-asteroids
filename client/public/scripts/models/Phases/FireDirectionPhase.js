define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';

	var FireDirectionPhase = function(stage, mouse, ui, ships, phaseTitle) {
		this.stage = stage;
		this.mouse = mouse;
		this.ui = ui;
		this.ships = ships;
		this.phaseTitle = phaseTitle;
	};
	
	FireDirectionPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	FireDirectionPhase.prototype.onStart = function () {
		console.log("Fire Direction phase has started");
		
		var self = this;
		
		this.phaseTitle('Select your firing direction');
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) {
				self.ui.startDrag(data);
			} else if (data.originalEvent.which === 1) {
				if (self.ui.setFireDestination()) {
					self.emitEvent('fire direction set');
				}
			}
		};
		
		this.stage.mousemove = function(data) {
			self.ui.drag(data);
		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
		
		this.ui.fireDestinationLineTo = this.ui.possibleFireDestination;
	};
	
	FireDirectionPhase.prototype.draw = function () {
		
		this.ui.clientShip.drawGhost(this.ui.movementPosition.x, this.ui.movementPosition.y);
		
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
		
		this.ui.possibleFireDestination.x = this.mouse.x();
		this.ui.possibleFireDestination.y = this.mouse.y();

	};
	
	FireDirectionPhase.prototype.onEnd = function () {
		console.log("Fire Direction phase has ended");
		
		this.phaseTitle('');
		
		this.ui.clientShip.clearGhost();
		
		this.ui.clearMovementLine();
		this.ui.clearFirePoint();
		this.ui.clearFireLine();
		
		this.stage.mousedown = function () {};
		this.stage.mouseup = function () {};

	};
	
	return FireDirectionPhase;
	
});