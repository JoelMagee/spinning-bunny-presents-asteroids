define([
    'knockout',
    'jquery',
	'models/Lobby',
	'models/User'
], function (ko, $, Lobby, User) {
    'use strict';
	
    var LobbyListVM = function LobbyListVM(socket) {
	
		var self = this;
		
		this.lobbies = ko.observableArray();
		this.users = ko.observableArray();
        
        this._loadData();
		
		this.socket = socket;
		
		this.socket.on('logout', function(response) {
			if (response.success) {
				console.log("logged out");
				$('#lobbyListScreen').hide();
				$('#loginScreen').show();
			} else {
				console.log(response.message);
			}
		});
    };
	
    LobbyListVM.prototype = {
        _loadData: function () {
			var self = this;
            $.ajax({
				// url: '/ladder/rest/players',
				success: function (data) {
					data = [{"id":"1","name":"Awesome lobby!","players":1},{"id":"2","name":"Full","players":6}];
					for(var i = 0; i<data.length; i++) {
						var lobby = new Lobby(data[i].id, data[i].name, data[i].players);
						self.lobbies.push(lobby);
					}
					console.log("loadedLobbies");
				}
			});
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
		joinLobby: function () {
			console.log(this);
			this.players(this.players()+1);
			console.log(this.players);
			console.log(this);
			console.log("joined lobby #" + this.id);
			$('#lobbyListScreen').hide();
			$('#lobbyScreen').show();
		},
		logout: function () {
			this.socket.emit('logout', {});
		}
    };
	
    return LobbyListVM;
});