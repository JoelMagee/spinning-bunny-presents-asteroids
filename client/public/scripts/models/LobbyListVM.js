define([
	'models/LobbyVM',
    'knockout',
    'jquery',
	'models/Lobby',
	'models/User'
], function (LobbyVM, ko, $, Lobby, User) {
    'use strict';
	
    var LobbyListVM = function LobbyListVM(socket) {
	
		var self = this;
		
		this.lobbies = ko.observableArray();
		this.users = ko.observableArray();
		
		this.lobbyName = ko.observable();
        
        this._loadData();
		
		this.socket = socket;
		
		this.lobbySelectEvents = [];
		
		this.socket.on('logout', function(response) {
			if (response.success) {
				console.log("logged out");
				$('#lobbyListScreen').hide();
				$('#loginScreen').show();
			} else {
				console.log(response.message);
			}
		});
		
		this.socket.on('info lobby', function(response) {
			if (response.success) {

				if (response.lobbyData instanceof Array) {
					console.log("Info for all lobbies received");
					console.dir(response);
					//We've recieved a list of results
					//Empty the list
					self.lobbies.removeAll();

					for (var i = 0; i < response.lobbyData.length; i++) {
						var lobby = new Lobby(response.lobbyData[i].id, response.lobbyData[i].name, response.lobbyData[i].usernames.length);
						self.lobbies.push(lobby);
					}
				} else {
					
					// ignore		
					
				}

			} else {
				console.error("Loading lobby list failed somehow");
			}
		});
		
		this.socket.on('create lobby', function(response) {
			if (response.success) {
				console.log("Creation of lobby was successful");
				var lobby = new Lobby(response.id, self.lobbyName(), 0);
				self.lobbies.push(lobby);
				self.lobbyName("");
			} else {
				console.log("Creation of lobby failed - " + response.message);

			}
		});
		
		this.socket.on('join lobby', function(response) {
		
			if (!response.success) {
				alert(response.message);
				self.lobbies.remove(function(item) { return item.id === response.id });
			}
			
		});
		
    };
	
    LobbyListVM.prototype = {
		on: function(event, callback) {
			if (event === 'lobby-select') {
				this.lobbySelectEvents.push(callback);
			}
		},
        _loadData: function () {
			var self = this;
			$.ajax({
				// url: '/ladder/rest/players',
				success: function (data) {
					data = [{"name":"User 1"},{"name":"User 2"}];
					for(var i = 0; i<data.length; i++) {
						var user = new User(data[i].name);
						self.users.push(user);
					}
					console.log("loadedUsers");
				}
			});
        },
		refreshLobbies: function () {
			this.socket.emit('info lobby', {});
		},
		createLobby: function () {
			if (this.lobbyName()) {
				this.socket.emit("create lobby", { "name": this.lobbyName()});	
			}
		},
		joinLobby: function (lobby) {
			
			this.socket.emit('join lobby', { id: lobby.id });
			
			for (var i = 0; i < this.lobbySelectEvents.length; i++) {
				this.lobbySelectEvents[i](lobby);
			}
			
		},
		logout: function () {
			this.socket.emit('logout', {});
		}
    };
	
    return LobbyListVM;
});