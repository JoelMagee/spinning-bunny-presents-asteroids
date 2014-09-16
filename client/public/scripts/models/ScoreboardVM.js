define([
    'knockout',
    'jquery'
], function (ko, $) {
    'use strict';

    var ScoreboardVM = function ScoreboardVM(socket) {
	
		var self = this;
		
		this.socket = socket;

    };
	
    ScoreboardVM.prototype.logout = function() {
		this.socket.emit('logout', {});
	};
	
	ScoreboardVM.prototype.showLobbies = function() {
		$('#scoreboardScreen').hide();
		$('#lobbyListScreen').show();
	};
	
	ScoreboardVM.prototype.showHelp = function() {
		$('#scoreboardScreen').hide();
		$('#helpScreen').show();
	};
	
    return ScoreboardVM;
});