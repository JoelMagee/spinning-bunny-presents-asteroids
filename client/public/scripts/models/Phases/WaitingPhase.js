define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var WaitingPhase = function(ui, stage, mouse) {
		this.ui = ui;
		this.stage = stage;
		this.mouse = mouse;
	};
	
	WaitingPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	WaitingPhase.prototype.onStart = function () {
		console.log("Waiting phase has started");
		
		var self = this;
		
		this.stage.mousedown = function (data) {

			if (self.mouse.x() < 0 || self.mouse.x() > 10000 || self.mouse.y() < 0 || self.mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
				self.ui.startDrag(data);
			} else if (data.originalEvent.which === 1) {
				
			}
		};
		
		this.stage.mousemove = function(data) {
			self.ui.drag(data);
		};
		
		this.stage.mouseup = function () {
			self.ui.stopDrag();
		};
		
	};
	
	WaitingPhase.prototype.draw = function () {
		// console.log("Waiting phase is drawing");
		
		if (this.ui.moveSet) {
			this.ui.clearMovementLine();
			this.ui.drawMovementLine();
		}
		
		if (this.ui.firePointSet) {
			this.ui.clearFirePoint();
			this.ui.drawFirePoint();
		}
		
		if (this.ui.fireDestinationSet) {
			this.ui.clearFireLine();
			this.ui.drawFireLine();
		}
	};
	
	WaitingPhase.prototype.update = function () {
		// console.log("Waiting phase is updating");
	};
	
	WaitingPhase.prototype.onEnd = function () {
		console.log("Waiting phase has ended");
		
		this.ui.clearMovementLine();
		this.ui.clearFirePoint();
		this.ui.clearFireLine();
		
		this.ui.clientShip.t = null;
		this.ui.clientShip.angle = null;
		
		this.ui.moveSet = false;
		this.ui.firePointSet = false;
		this.ui.fireDestinationSet = false;
	};
	
	return WaitingPhase;
	
});