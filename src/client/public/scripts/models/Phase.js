define([
	'jquery',
	'libs/EventEmitter'
], function ($, EventEmitter) {
    'use strict';
	
	var Phase = function () {};
	
	Phase.prototype = $.extend(true, {}, EventEmitter.prototype);
	
	Phase.prototype.onStart = function() {};
	
	Phase.prototype.draw = function () {};
	
	Phase.prototype.update = function () {};
	
	Phase.prototype.onEnd = function() {};

	return Phase;
	
});