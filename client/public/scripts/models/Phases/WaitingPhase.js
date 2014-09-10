define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var WaitingPhase = function(ui, socket) {
		this.ui = ui;
		this.socket = socket;
	};
	
	WaitingPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	WaitingPhase.prototype.onStart = function () {
		console.log("Waiting phase has started");
		
	};
	
	WaitingPhase.prototype.draw = function () {
		// console.log("Waiting phase is drawing");
		
		this.ui.clearMovementLine();
		this.ui.drawMovementLine();
		
		this.ui.clearFirePoint();
		this.ui.drawFirePoint();
		
		this.ui.clearFireLine();
		this.ui.drawFireLine();
	};
	
	WaitingPhase.prototype.update = function () {
		// console.log("Waiting phase is updating");
	};
	
	WaitingPhase.prototype.onEnd = function () {
		console.log("Waiting phase has ended");
	};
	
	return WaitingPhase;
	
});