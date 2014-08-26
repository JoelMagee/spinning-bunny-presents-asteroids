/*jslint white: true node: true */

var Lobby = require('./lobby')();
var LobbyMessages = require('./lobby-messages');

var redis;

var LobbyIDGenerator = function() {
	this.lobbyCount = 0;
}

LobbyIDGenerator.prototype.generateID = function() {
	return this.lobbyCount++;
}

var LobbyManager = function(sessionManager, gameManager) {
	this.sessionManager = sessionManager;
	this.gameManager = gameManager;

	this.createSub = redis.createClient();
	this.infoSub = redis.createClient();
	this.joinSub = redis.createClient();
	this.outputPub = redis.createClient();

	this.lobbies = [];
	this.lobbiesMap = {};

	this.lobbyIDGenerator = new LobbyIDGenerator();

	this.createSub.on('pmessage', this._createMessageReceived.bind(this));
	this.createSub.psubscribe('create lobby:*');

	this.joinSub.on('pmessage', this._joinMessageReceived.bind(this));
	this.joinSub.psubscribe('join lobby:*');

	this.infoSub.on('pmessage', this._infoMessageReceived.bind(this));
	this.infoSub.psubscribe('info lobby:*');
}

LobbyManager.prototype.createLobby = function(lobbyName) {
	var newLobby = new Lobby(this.lobbyIDGenerator.generateID(), lobbyName);
	var self = this;

	this.addLobby(newLobby);

	newLobby.on('lobby destroyed', function() {
		self.removeLobby(newLobby);
	});

	return newLobby;
};

LobbyManager.prototype._sendResponse = function(sessionID, channel, data) {
	var response = {};
	response.sessionID = sessionID;
	response.channel = channel;
	response.data = data;
	this.outputPub.publish('output message:' + sessionID, JSON.stringify(response));
}

LobbyManager.prototype._createMessageReceived = function(channelPattern, actualPattern, message) {
	console.log("Processing create lobby request");
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;
	var lobbyName = messageObj.data.name;
	var username = this.sessionManager.getSessionProperty(sessionID, 'username');

	var newLobby = this.createLobby(lobbyName, username);

	this._sendResponse(sessionID, "create lobby", LobbyMessages.createLobbySuccessful(newLobby.id));
};

LobbyManager.prototype._joinMessageReceived = function(channelPattern, actualPattern, message) {
	console.log("Processing join lobby request");
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;

	var self = this;

	var lobbyID = messageObj.data.id;
	var username = this.sessionManager.getSessionProperty(sessionID, 'username');

	if (!this.lobbyExists(lobbyID)) {
		self._sendResponse(sessionID, "join lobby", {
			id: lobbyID,
			success: false,
			message: "Lobby doesn't exist"
		});	
		return;
	}
	
	var lobby = this.getLobby(lobbyID);

	lobby.join(username);

	self._sendResponse(sessionID, "join lobby", {
		id: lobbyID,
		success: true,
		message: "Successfully joined lobby"
	});	

	var userJoinLobby = function(username) {
		self._sendResponse(sessionID, "user join lobby", {
			id: lobbyID,
			username: username
		});
	};

	var userLeaveLobby = function(username) {
		self._sendResponse(sessionID, "user leave lobby", {
			id: lobbyID,
			username: username
		});
	};

	var lobbyDestroyed = function() {
		onLeave();
	};

	var gameStart = function(game) {
		self.gameManager.joinGame(sessionID, username, game);
		self._sendResponse(sessionID, "game loading", {
			id: lobbyID,
			success: true,
			message: "Game is loading"
		});	
	};

	lobby.on('user join', userJoinLobby);
	lobby.on('user leave', userLeaveLobby);
	lobby.on('lobby destroyed', lobbyDestroyed);
	lobby.on('game start', gameStart);

	//Process listeners to listen for reasons to leave this lobby
	var leaveSub = redis.createClient();

	var onLeave = function() {
		lobby.removeListener('user join', userJoinLobby);
		lobby.removeListener('user leave', userLeaveLobby);
		lobby.removeListener('lobby destroyed', lobbyDestroyed);
		lobby.removeListener('game start', gameStart);
		leaveSub.unsubscribe('leave lobby:' + sessionID);
		leaveSub.unsubscribe('logout:' + sessionID);
		leaveSub.unsubscribe('disconnect:' + sessionID);
		leaveSub.unsubscribe('join lobby:' + sessionID);
		destroySub.unsubscribe('destroy lobby:' + sessionID);
		self._sendResponse(sessionID, "leave lobby", {
			id: lobbyID,
			message: "You have left the lobby",
			success: true
		});		
	}

	leaveSub.on('message', function(channel, message) {
		console.log(username + " leaving lobby as message recieved on channel: " + channel);
		lobby.leave(username);
		onLeave();
	});

	leaveSub.subscribe('leave lobby:' + sessionID);
	leaveSub.subscribe('logout:' + sessionID);
	leaveSub.subscribe('disconnect:' + sessionID);
	leaveSub.subscribe('join lobby:' + sessionID);

	var destroySub = redis.createClient();

	destroySub.on('message', function(channel, message) {
		if (lobby.getLeader() === username) {
			//This user is the lobby leader, they can destroy the lobby
			lobby.destroy();
			self._sendResponse(sessionID, "destroy lobby", {
				success: true,
				message: "Lobby successfully closed"
			});
		} else {
			//This user is not the lobby leader, they cannot destroy the lobby
			self._sendResponse(sessionID, "destroy lobby", {
				success: false,
				message: "You don't have permission to destroy this lobby"
			});
		}
	});

	destroySub.subscribe('destroy lobby:' + sessionID);

	var startGameSub = redis.createClient();

	startGameSub.on('message', function(channel, message) {
		if (lobby.getLeader() === username) {

			var game = self.gameManager.createGame(lobby.getUsers());
			lobby.startGame(game);
			lobby.destroy();
		} else {
			//This user is not the lobby leader, they cannot destroy the lobby
			self._sendResponse(sessionID, "start game", {
				success: false,
				message: "You don't have permission to start this game"
			});
		}
	});

	startGameSub.subscribe('start game:' + sessionID);
}

LobbyManager.prototype._infoMessageReceived = function(channelPattern, actualPattern, message) {
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;
	var self = this;

	if (messageObj.data.hasOwnProperty('id')) {
		//Request for info about a single lobby
		
		if (!this.lobbiesMap.hasOwnProperty(messageObj.data.id)) {
			//No such lobby
			self._sendResponse(sessionID, "lobby info", {
				success: false,
				message: "No such lobby"
			});

			return;
		}

		var lobby = this.lobbiesMap[messageObj.data.id];

		self._sendResponse(sessionID, "info lobby", {
			success: true,
			message: "Lobby data retrieval successful",
			lobbyData: lobby.info()
		});

		return;	

	} else {
		//Request for info about all lobbies
		self._sendResponse(sessionID, "info lobby", {
			success: true,
			message: "Lobby data retrieval successful",
			lobbyData: this.lobbies.map(function(e,i) { return e.info(); })
		});
	}
};

LobbyManager.prototype.addLobby = function(lobby) {
	this.lobbies.push(lobby);
	this.lobbiesMap[lobby.id] = lobby;
};

LobbyManager.prototype.removeLobby = function(lobby) {
	this.lobbies.splice(this.lobbies.indexOf(lobby), 1);
	delete this.lobbiesMap[lobby.id];
	lobby.removeAllListeners();
};

LobbyManager.prototype.getLobby = function(id) {
	if (this.lobbyExists(id)) {
		return this.lobbiesMap[id];
	}

	return null;
};

LobbyManager.prototype.lobbyExists = function(id) {
	return this.lobbiesMap.hasOwnProperty(id);
};

module.exports = function(_redis) {
	redis = _redis;

	return LobbyManager;
};