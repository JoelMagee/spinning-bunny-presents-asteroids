define([
    'knockout',
    'jquery',
	'models/LobbyListVM',
	'models/ScoreboardVM',
	'models/HelpVM',
	'models/LobbyVM',
	'models/LoginVM',
	'models/GameVM3',
	'models/Session',
	'socketio'
], function (ko, $, LobbyListVM, ScoreboardVM, HelpVM, LobbyVM, LoginVM, GameVM, Session, io) {
    'use strict';
	
	//Knockout plugin for adding function calls when enter is pressed
	ko.bindingHandlers.executeOnEnter = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var allBindings = allBindingsAccessor();
			$(element).keypress(function (event) {
				var keyCode = (event.which ? event.which : event.keyCode);
				if (keyCode === 13) {
					allBindings.executeOnEnter.call(viewModel);
					return false;
				}
				return true;
			});
		}
	};

	var socket = io('http://sl-ws-230:8500/');
	socket.emit('session', {});
	
	socket.on('connect', function() {
		console.log("Connected to websocket on localhost");
	});
	
	var session = new Session();
	
	var loginVM = new LoginVM(socket, session);
	var lobbyListVM = new LobbyListVM(socket);
	var scoreboardVM = new ScoreboardVM(socket);
	var helpVM = new HelpVM(socket);
	var lobbyVM = new LobbyVM(socket);
	var gameVM = new GameVM(socket, session);
	
	lobbyListVM.on('lobby-select', function(lobby) {
		lobbyVM.displayLobby(lobby);
	});

    ko.applyBindings(loginVM, $('#loginScreen')[0]);
	ko.applyBindings(lobbyListVM, $('#lobbyListScreen')[0]);
	ko.applyBindings(scoreboardVM, $('#scoreboardScreen')[0]);
	ko.applyBindings(helpVM, $('#helpScreen')[0]);
	ko.applyBindings(lobbyVM, $('#lobbyScreen')[0]);
	ko.applyBindings(gameVM, $('#gameScreen')[0]);
	
	

});