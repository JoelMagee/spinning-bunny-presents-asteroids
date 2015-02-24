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

	};
	
	LoadingPhase.prototype.update = function () {

	};
	
	LoadingPhase.prototype.onEnd = function () {
		console.log("Loading phase has ended");
		//Initiate ships
		this.emitEvent('loading end');
	};
	
	return LoadingPhase;
	
});