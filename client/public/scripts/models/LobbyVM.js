define([
    'knockout',
    'jquery'
], function (ko, $) {
    'use strict';
	
	var MAX_CHAT_HISTORY = 100;
	
    var LobbyVM = function LobbyVM(socket, session) {
	
		var self = this;
	
		this.name = ko.observable("Lobby name");
		this.players = ko.observableArray();		

		//Chat observables
		this.chatMessage = ko.observable();
		this.chatHistory = ko.observableArray();

		this.socket = socket;
		this.session = session;
		
		this.lobbyleader = ko.observable(false);
		
		this.socket.on('info lobby', function(response) {
			if (response.success) {
				if (!(response.lobbyData instanceof Array)) {		
					//Just the one sir
					console.log("Information for a single lobby received");
					console.log(response.lobbyData);
					self.name(response.lobbyData.name);
					self.players.removeAll();
					for(var i = 0; i<response.lobbyData.usernames.length; i++) {
						self.players.push({"name": response.lobbyData.usernames[i]});
					}
					
					self.setLobbyLeader();
			
					$('.screen').hide();
					$('#lobby-screen').show();
					
				}

			} else {
				console.error("Loading lobby list failed somehow");
			}
		});
		
		this.socket.on('leave lobby', function(response) {			
				$('.screen').hide();
				$('#dashboard-screen').show();
				
				self.lobbyleader();
				
				self.socket.emit('info lobby', {});
		});
		
		this.socket.on('user join lobby', function(response) {
			console.log("Player joined: " + response.username);
			self.players.push({"name": response.username});
		});

		this.socket.on('user leave lobby', function(response) {
			console.log("Player left: " + response.username);
			self.players.remove(function(item) { return item.name === response.username; });
			self.setLobbyLeader();
		});
		
		this.socket.on('close lobby', function(response) {
			if (response.success) {
				$('.screen').hide();
				$('#dashboard-screen').show();
				
				self.setLobbyLeader();
				
				self.socket.emit('info lobby', {});
			} else {
				console.log(response.message);
			}
		});
		
		this.socket.on('launch game', function(response) {
			if (response.success) {
				console.log(response.message);
			} else {
				console.log(self.session.username);
			}
		});
		
		this.socket.on('start game' , function(response) {
			if (response.success) {
				$('.screen').hide();
				$('#game-screen').show();
			} else {
				console.log(response.message);
			}
			
		});
		
		this.socket.on('global message', function(response) {
			self.chatHistory.unshift({content: response.message.content, time: new Date(), username: response.message.username });
			if(self.chatHistory().length > MAX_CHAT_HISTORY) {
				self.chatHistory.pop(); //Remove old messages
			}
		});
		
    };
	
    LobbyVM.prototype = {
		startLobby: function () {
			this.socket.emit('launch game', {});
		},
		leaveLobby: function () {
			this.socket.emit('leave lobby', {});
		},
		closeLobby: function () {
			this.socket.emit('close lobby', {});
		},
		sendGlobalMessage: function() {
			this.socket.emit('global message', { content: this.chatMessage() });
			this.chatMessage("");
		},
		setLobbyLeader: function() {
			if (this.players()[0] && this.session.username === this.players()[0].name) {
				this.lobbyleader(true);
			} else {
				this.lobbyleader(false);
			}
		}
    };
  
    return LobbyVM;
});