define([
    'knockout',
    'jquery',
    'models/ViewModel',
	'models/LobbyListVM',
	'models/LobbyVM',
	'models/LoginVM'
], function (ko, $, ViewModel, LobbyListVM, LobbyVM, LoginVM) {
    'use strict';

    // var viewModel = new ViewModel();
	
	var lobbyListVM = new LobbyListVM();
	
	var loginVM = new LoginVM();
	
	var lobbyVM = new LobbyVM();

    ko.applyBindings(loginVM, document.getElementById('loginScreen'));
	ko.applyBindings(lobbyListVM, document.getElementById('lobbyListScreen'));
	ko.applyBindings(lobbyVM, document.getElementById('lobbyScreen'));
	
	
});