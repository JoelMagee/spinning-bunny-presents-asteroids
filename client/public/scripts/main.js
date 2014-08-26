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
	socket.emit('session', {});
	
	socket.on('connect', function() {
		console.log("Connected to websocket on localhost");
	});
	
	
	var loginVM = new LoginVM(socket);
	var lobbyListVM = new LobbyListVM(socket);
	var lobbyVM = new LobbyVM(socket);
	var gameVM = new GameVM();
	
	lobbyListVM.on('lobby-select', function(lobby) {
		lobbyVM.displayLobby(lobby);
	});

    ko.applyBindings(loginVM, $('#loginScreen')[0]);
	ko.applyBindings(lobbyListVM, $('#lobbyListScreen')[0]);
	ko.applyBindings(lobbyVM, $('#lobbyScreen')[0]);
	ko.applyBindings(gameVM, $('#gameScreen')[0]);
	
});