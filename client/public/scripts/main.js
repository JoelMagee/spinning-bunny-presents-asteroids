define([
    'knockout',
    'jquery',
	'models/LobbyListVM',
	'models/LobbyVM',
	'models/LoginVM',
	'models/GameVM',
	'socketio'
], function (ko, $, LobbyListVM, LobbyVM, LoginVM, GameVM, io) {
    'use strict';
	
	var socket = io('http://sl-ws-230:8500/');
	// socket.emit('session', {});
	
	socket.on('connect', function() {
		// connectText.html("Connected...");
		console.log("Connected to websocket on localhost");
	});
	
    var gameVM = new GameVM();
	var lobbyListVM = new LobbyListVM();
	var loginVM = new LoginVM();
	var lobbyVM = new LobbyVM();

    ko.applyBindings(loginVM, document.getElementById('loginScreen'));
	ko.applyBindings(lobbyListVM, document.getElementById('lobbyListScreen'));
	ko.applyBindings(lobbyVM, document.getElementById('lobbyScreen'));
	ko.applyBindings(gameVM, document.getElementById('gameScreen'));
	
});