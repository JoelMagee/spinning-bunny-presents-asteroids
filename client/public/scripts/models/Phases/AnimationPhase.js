define([
	'jquery',
	'../Phase'
], function ($, Phase) {
    'use strict';
		
	var AnimationPhase = function(stage, ships) {
	
	};
	
	AnimationPhase.prototype = $.extend(true, {}, Phase.prototype);
	
	AnimationPhase.prototype.onStart = function () {
		console.log("Animation phase has started");
	};
	
	AnimationPhase.prototype.draw = function () {
		// console.log("Animation phase is drawing");
	};
	
	AnimationPhase.prototype.update = function () {
		// console.log("Animation phase is updating");
	};
	
	AnimationPhase.prototype.onEnd = function () {
		console.log("Animation phase has ended");
	};
	
	return AnimationPhase;
	
});