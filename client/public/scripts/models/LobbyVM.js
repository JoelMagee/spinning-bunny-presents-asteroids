define([
    'knockout',
    'jquery',
	'models/Lobby',
	'models/User'
], function (ko, $, Lobby, User) {
    'use strict';
	
    var LobbyVM = function LobbyVM(socket) {
		this.name = ko.observable("Lobby name");
		this.players = ko.observableArray();
	
		this.message = ko.observable();
		this.messages = ko.observableArray();
        
        this._loadData();
		
		this.socket = socket;
		
		// doesnt trigger yet
		this.socket.on('leave lobby', function(response) {
			console.log("Leave lobby message received");
			console.dir(response);
		});
		
		this.lobby = undefined;
		
    };
	
    LobbyVM.prototype = {
        _loadData: function () {
			var self = this;
			$.ajax({
				// url: '/ladder/rest/players',
				success: function (data) {
					data = [{"name":"Player 1"},{"name":"Player 2"}];
					for(var i = 0; i<data.length; i++) {
						var player = new User(data[i].name);
						self.players.push(player);
					}
					console.log("loadedPlayers");
					// Think about adding empty slot holders
				}
			});
        },
		displayLobby: function (lobby) {
			
			this.lobby = lobby;
			this.name(lobby.name);
		},
		sendMessage: function () {
			if (this.message() !== undefined && this.message() !== "") {
				this.messages.push(this.message());
				console.log("message sent");
				this.message("");
				$("#chatbody")[0].scrollTop = $("#chatbody")[0].scrollHeight;
			}
		},
		startLobby: function () {
			console.log("lobby started");
			$('#lobbyScreen').hide();
			$('#gameScreen').show();
		},
		leaveLobby: function () {
			
			this.socket.emit('leave lobby', { id: this.lobby.id });
			// this.socket.emit('info lobby', { id: this.lobby.id });
		
			console.log("player left lobby");
			$('#lobbyScreen').hide();
			$('#lobbyListScreen').show();
		}
    };
  
    return LobbyVM;
});