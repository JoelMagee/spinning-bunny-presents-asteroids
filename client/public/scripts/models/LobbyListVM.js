define([
	'models/LobbyVM',
    'knockout',
    'jquery',
	'models/Lobby',
	'moment'
], function (LobbyVM, ko, $, Lobby, moment) {
    'use strict';

	(function() {
		var previous= {};

		$("body").on('click', '.lobby-name', function(e) {
			if (previous === this) {
				$(".active-lobby").removeClass("active-lobby").find(".lobby-info").slideUp();
				previous = {};
				return;
			}

			$(".active-lobby").removeClass("active-lobby").find(".lobby-info").slideUp();
			$(this).parent().addClass("active-lobby").find(".lobby-info").slideDown();
			previous = this;
		});
	})();

    var LobbyListVM = function LobbyListVM(socket) {
	
		var self = this;
		
		this.lobbies = ko.observableArray();
		this.users = ko.observableArray();
		
		this.lobbyName = ko.observable();
        
        this._loadData();
		
		this.socket = socket;
		
		this.lobbySelectEvents = [];
		
		//Chat observables
		this.chatMessage = ko.observable();
		this.chatHistory = ko.observableArray();
		
		//This may need to be changed to hide the relevant pages
		this.socket.on('logout', function(response) {
			if (response.success) {
				console.log("logged out");
				$('#lobbyListScreen').hide();
				$('#scoreboardScreen').hide();
				$('#helpScreen').hide();
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
						var lobby = new Lobby(response.lobbyData[i].id, response.lobbyData[i].name, response.lobbyData[i].usernames);
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
				self.socket.emit('info lobby', {});
			}
			
		});
		
		this.socket.on('global message', function(response) {
			self.chatHistory.unshift({content: response.message.content, time: new Date(), username: response.message.username });
			if(self.chatHistory().length > 100) {
				self.chatHistory.pop();
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
						// var user = new User(data[i].name);
						self.users.push(data[i]);
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
		},
		sendGlobalMessage: function() {
			this.socket.emit('global message', { content: this.chatMessage() });
			this.chatMessage("");
		}
    };
	
    return LobbyListVM;
});