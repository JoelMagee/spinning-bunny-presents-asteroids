define([
    'knockout',
    'jquery',
	'models/DashboardVM',
	'models/LobbyVM',
	'models/LoginVM',
	'models/GameVM3',
	'models/Session',
	'socketio'
], function (ko, $, DashboardVM, LobbyVM, LoginVM, GameVM, Session, io) {
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

	var socket = io('http://sl-ws-230:5000/');
	
	socket.on('connect', function() {
		console.log("Connected to websocket on localhost");
		socket.emit('session', {});
	});
	
	var session = new Session();
	
	var loginVM = new LoginVM(socket, session);
	var dashboardVM = new DashboardVM(socket, session);
	var lobbyVM = new LobbyVM(socket, session);
	var gameVM = new GameVM(socket, session);
	
    ko.applyBindings(loginVM, $('#login-screen')[0]);
	ko.applyBindings(dashboardVM, $('#dashboard-screen')[0]);
	ko.applyBindings(lobbyVM, $('#lobby-screen')[0]);
	ko.applyBindings(gameVM, $('#game-screen')[0]);

	$('#login-screen').show();
});