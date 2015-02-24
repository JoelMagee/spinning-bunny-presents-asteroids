define([
    
], function () {
    'use strict';
	
    
    var PhaseManager = function PhaseManager() {
		this.currentPhase = undefined;
    };
	
	PhaseManager.prototype.setCurrentPhase = function(phase) {
		if (this.currentPhase) {
			this.currentPhase.onEnd();
		}
		this.currentPhase = phase;
		this.currentPhase.onStart();
	};
	
	PhaseManager.prototype.getCurrentPhase = function() {
		return this.currentPhase;
	};
	
    return PhaseManager;
});