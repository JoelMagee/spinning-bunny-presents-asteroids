define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var LoadingPhase = function() {
	
	};
	
	LoadingPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	LoadingPhase.prototype.onStart = function () {
		console.log("Loading phase has started");
	};
	
	LoadingPhase.prototype.draw = function () {
		// console.log("Loading phase is drawing");
	};
	
	LoadingPhase.prototype.update = function () {
		// console.log("Loading phase is updating");
	};
	
	LoadingPhase.prototype.onEnd = function () {
		console.log("Loading phase has ended");
		//Initiate ships
		this.emitEvent('loading end');
	};
	
	return LoadingPhase;
	
});