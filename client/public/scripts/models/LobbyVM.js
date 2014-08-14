define([
    'knockout',
    'jquery',
	'models/Lobby',
	'models/User'
], function (ko, $, Lobby, User) {
    'use strict';
	
    var LobbyVM = function LobbyVM() {
		this.name = ko.observable("Lobby name");
		this.players = ko.observableArray();
	
		this.message = ko.observable();
		this.messages = ko.observableArray();
		
		// this.chat = new Chat(this);
        
        this._loadData();
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
		sendMessage: function () {
			this.messages.push(this.message());
			console.log("message sent");
			this.message("");
		},
		startLobby: function () {
			console.log("lobby started");
		},
		leaveLobby: function () {
			console.log("player left lobby");
			$('#lobbyScreen').hide();
			$('#lobbyListScreen').show();
		}
    };
	
	
  
    return LobbyVM;
});