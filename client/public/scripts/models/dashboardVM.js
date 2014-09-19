define([
	'models/LobbyVM',
    'knockout',
    'jquery',
	'models/Lobby',
	'moment',
	'bootstrap'
], function (LobbyVM, ko, $, Lobby, moment) {

	var USERS_PER_SCOREBOARD_PAGE = 25;
	var MAX_CHAT_HISTORY = 100;

	//Lobby list animation
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


	var DashboardVM = function(socket, session) {
		this.socket = socket;
		this.session = session;
		var self = this;

		//Lobby list
		this.lobbies = ko.observableArray();
		this.users = ko.observableArray();

		//Chat observables
		this.chatMessage = ko.observable();
		this.chatHistory = ko.observableArray();

		this.lobbyName = ko.observable();
		this.activeTabName = ko.observable('lobbies');

		this.userCount = ko.observable(0);
		this.scoreboardPage = ko.observable(1);
		this.scoreboardInformation = ko.observableArray();

		this.orderBy = 'username';
		this.orderDirection = 'asc';

		this.profile = {
			username: ko.observable(0),
			totalKills: ko.observable(0),
			killStats: ko.observableArray(0),
			totalScore: ko.observable(0),
			gamesWon: ko.observable(0),
			gamesStarted: ko.observable(0),
			gamesFinished: ko.observable(0),
			highestScore: ko.observable(0),
			winPercent: ko.observable("N/A")
		}

		this.socket.on('logout', function(response) {
			if (response.success) {
				$('.screen').hide();
				$('#login-screen').show();
			}
		});

		this.socket.on('info lobby', function(response) {
			if (response.success) {
				$('#lobby-name-input').removeClass('invalid-input');
				$('#lobby-name-input').tooltip('destroy');
				if (response.lobbyData instanceof Array) {
					//Empty the list
					self.lobbies.removeAll();

					for (var i = 0; i < response.lobbyData.length; i++) {
						var lobby = new Lobby(response.lobbyData[i].id, response.lobbyData[i].name, response.lobbyData[i].usernames);
						self.lobbies.push(lobby);
					}
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
				self.joinLobby(lobby);
				$('#lobby-name-input').removeClass('invalid-input');
				$('#lobby-name-input').tooltip('destroy');
			} else {
				console.log("Creation of lobby failed - " + response.message);
				$('#lobby-name-input').addClass('invalid-input');
				$('#lobby-name-input').tooltip({
					title: response.message
				});
				$('#lobby-name-input').tooltip('show');
			}
		});

		this.socket.on('join lobby', function(response) {
			if (response.success) {
				console.log(response.message);
				self.socket.emit('info lobby', { id: response.id });
				$('.screen').hide();
				$('#lobby-screen').show();
			} else {
				alert(response.message);
				self.socket.emit('info lobby', {});
			}
		});

		this.socket.on('global message', function(response) {
			self.chatHistory.unshift({content: response.message.content, time: new Date(), username: response.message.username });
			if(self.chatHistory().length > MAX_CHAT_HISTORY) {
				self.chatHistory.pop(); //Remove old messages
			}
		});

		this.socket.on('user info', function(response) {
			console.log("User info received");
			if (response.success && response.users) {
				//Scoreboard request
				self.scoreboardInformation(response.users);
			} else if (response.success && response.user) {

				var winPercent = "N/A";

				if ((response.user.gamesWon > 0) && (response.user.gamesStarted > 0)) {
					winPercent = (response.user.gamesWon/response.user.gamesStarted).toFixed(4) * 100;
				}

				//We're going to assume this is a profile user request
				self.profile.username(response.user.username);
				self.profile.totalKills(response.user.totalKills);
				self.profile.killStats(response.user.killStats);
				self.profile.totalScore(response.user.totalScore);
				self.profile.gamesWon(response.user.gamesWon);
				self.profile.gamesStarted(response.user.gamesStarted);
				self.profile.gamesFinished(response.user.gamesFinished);
				self.profile.highestScore(response.user.highestScore);
				self.profile.winPercent(winPercent)
			} else {
				//Error loading user info
				console.error(response.message);
			}
		});

		this.socket.on('user count', function(response) {
			console.log(response);
			if (response.success) {
				self.userCount(response.count);
			} else {
				//Error loading user count
				console.error(response.message);
			}
		});
	}

	DashboardVM.prototype = {
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
		},
		logout: function () {
			this.socket.emit('logout', {});
		},
		sendGlobalMessage: function() {
			this.socket.emit('global message', { content: this.chatMessage() });
			this.chatMessage("");
		},
		activateTab: function(tabName) {
			console.log("Activating tab: " + tabName);
			this.activeTabName(tabName);
		},
		updateOrderBy: function(orderBy) {
			if (this.orderBy === orderBy) {
				this.orderDirection = (this.orderDirection === 'asc') ? 'desc' : 'asc';
			} else {
				this.orderBy = orderBy;
				this.orderDirection = 'desc';
			}
			this.updateScoreboard();
		},
		updateScoreboard: function() {
			console.log("Loading page: " + this.scoreboardPage())
			var sort = {};
			sort[this.orderBy] = this.orderDirection;
			this.socket.emit('user info', { limit: USERS_PER_SCOREBOARD_PAGE, page: this.scoreboardPage(), sort: sort });
			this.socket.emit('user count', {});
		},
		updateProfile: function() {
			this.socket.emit('user info', { username: this.session.username })
		},
		previousTab: function() {
			if (this.scoreboardPage() > 1) {
				this.scoreboardPage(this.scoreboardPage() - 1);
				this.updateScoreboard();
			}
		},
		nextTab: function() {
			if (this.scoreboardPage() <= this.userCount()/25) {
				this.scoreboardPage(this.scoreboardPage() + 1);
				this.updateScoreboard();
			}
		}
    };
	
    return DashboardVM;
});