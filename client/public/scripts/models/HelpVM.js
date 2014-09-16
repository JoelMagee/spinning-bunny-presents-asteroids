define([
    'knockout',
    'jquery'
], function (ko, $) {
    'use strict';

    var HelpVM = function HelpVM(socket) {
	
		var self = this;
		
		this.socket = socket;		
    };
	
    HelpVM.prototype.logout = function() {
		this.socket.emit('logout', {});
	};
	
	HelpVM.prototype.showLobbies = function() {
		$('#helpScreen').hide();
		$('#lobbyListScreen').show();
	};
	
	HelpVM.prototype.showScoreboard = function() {
		$('#helpScreen').hide();
		$('#scoreboardScreen').show();
	};
	
    return HelpVM;
});