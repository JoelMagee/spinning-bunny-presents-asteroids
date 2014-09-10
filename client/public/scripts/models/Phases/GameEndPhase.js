define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
	
	var GameEndPhase = function(stage, ships) {
	
	};
	
	GameEndPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	GameEndPhase.prototype.onStart = function () {
		console.log("Game End phase has started");
	};
	
	GameEndPhase.prototype.draw = function () {
		console.log("Game End phase is drawing");
	};
	
	GameEndPhase.prototype.update = function () {
		console.log("Game End phase is updating");
	};
	
	GameEndPhase.prototype.onEnd = function () {
		console.log("Game End phase has ended");
	};
	
	return GameEndPhase;
	
});