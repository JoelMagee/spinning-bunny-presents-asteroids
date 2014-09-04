define([
    'knockout',
    'jquery',
	'models/Lobby'
], function (ko, $, Lobby) {
    'use strict';
	
    var LobbyVM = function LobbyVM(socket) {
	
		var self = this;
		
		var started = false;
	
		this.name = ko.observable("Lobby name");
		this.players = ko.observableArray();
	
		this.message = ko.observable();
		this.messages = ko.observableArray();
		
		this.socket = socket;
		
		this.socket.on('info lobby', function(response) {
			if (response.success) {

				if (response.lobbyData instanceof Array) {
					
					//ignore
					
				} else {
			
					//Just the one sir
					console.log("Information for a single lobby received");
					console.log(response.lobbyData);
					self.name(response.lobbyData.name);
					self.players.removeAll();
					for(var i = 0; i<response.lobbyData.usernames.length; i++) {
						self.players.push({"name": response.lobbyData.usernames[i]});
					}
					
					console.log("joined lobby #" + response.lobbyData.id);
			
					$('#lobbyListScreen').hide();
					$('#lobbyScreen').show();
					
				}

			} else {
				console.error("Loading lobby list failed somehow");
			}
		});
		
		this.socket.on('leave lobby', function(response) {
		
			if (!started) {
			
				console.log(response);
			
				console.log(response.message);
				
				$('#lobbyScreen').hide();
				$('#lobbyListScreen').show();
				
				self.socket.emit('info lobby', {});
			
			}
			started = false;
				
		});
		
		this.socket.on('join lobby', function(response) {
			if (response.success) {
				console.log(response.message);
				this.emit('info lobby', { id: response.id });
			}
		});
		
		this.socket.on('user join lobby', function(response) {
			console.log("Player joined: " + response.username);
			self.players.push({"name": response.username});
		});

		this.socket.on('user leave lobby', function(response) {
			console.log("Player left: " + response.username);
			self.players.remove(function(item) { return item.name === response.username; });
		});
		
		this.socket.on('destroy lobby', function(response) {
			if (response.success) {
				console.log(response.message);
			} else {
				console.log(response.message);
				alert(response.message);
			}
		});
		
		this.socket.on('start game' , function(response) {
			if (response.success) {
				$('#lobbyScreen').hide();
				console.log(response.message);
				$('#gameScreen').show();
				started = true;
			} else {
				console.log(response.message);
			}
			
		});
		
		// this.lobby = undefined;
		
    };
	
    LobbyVM.prototype = {
		displayLobby: function (lobby) {
			
			// this.lobby = lobby;
			// this.name(lobby.name);
		},
		sendMessage: function () {
			if (this.message()) {
				this.messages.push(this.message());
				console.log("message sent");
				this.message("");
				$("#chatbody")[0].scrollTop = $("#chatbody")[0].scrollHeight;
			}
		},
		startLobby: function () {
			this.socket.emit('launch game', {});
		},
		leaveLobby: function () {
			this.socket.emit('leave lobby', {});
		},
		closeLobby: function () {
			this.socket.emit('destroy lobby', {});
		}
    };
  
    return LobbyVM;
});