/*jslint white: true node: true */

/**
 * LobbyMessageHandler
 *
 * @author : Sam Stonehouse
 * @date : 01/09/2014
 * @version  : 0.1
 * 
 * Handles all messages passed between the clients and the lobby manager
 *
 * LobbyMessageHandler is an event emitter which emits two events: 
 *
 * 'launch game' - When a game has been requested to start by the lobby leader; a launch
 *                 game message is emitted with the lobby as a parameter
 *                 
 * 
 * 'loading game' - When a game has notified the lobby that it's loading the lobby manager
 *                  emits a 'loading game' event with the sessionID, username and game
 *                  objects as parameters
 *                  
 */

var events = require('events');
var util = require("util");

var ChannelUtils = require('../channel-utils')();

var redis;

var LobbyMessageHandler = function(sessionManager, lobbyManager) {
	this.sessionManager = sessionManager;
	this.lobbyManager = lobbyManager;

	this.createSub = redis.createClient();
	this.infoSub = redis.createClient();
	this.joinSub = redis.createClient();
	this.outputPub = redis.createClient();

	this.createSub.on('pmessage', ChannelUtils.messageIn(this.createMessageReceived.bind(this), this.invalidMessage.bind(this)));
	this.createSub.psubscribe('create lobby:*');

	this.joinSub.on('pmessage', ChannelUtils.messageIn(this.joinMessageReceived.bind(this), this.invalidMessage.bind(this)));
	this.joinSub.psubscribe('join lobby:*');

	this.infoSub.on('pmessage', ChannelUtils.messageIn(this.infoMessageReceived.bind(this), this.invalidMessage.bind(this)));
	this.infoSub.psubscribe('info lobby:*');

	events.EventEmitter.call(this);
};

util.inherits(LobbyMessageHandler, events.EventEmitter);

LobbyMessageHandler.prototype.createMessageReceived = function(sessionID, messageData) {
	var lobby = this.lobbyManager.createLobby(messageData.name, this.sendResponse.bind(this));
	this.sendResponse(sessionID, "create lobby", {success: true, message: "Lobby created", id: lobby.id});
};

LobbyMessageHandler.prototype.joinMessageReceived = function(sessionID, messageData) {
	if (!messageData.hasOwnProperty('id')) {
		return this.sendResponse(sessionID, 'join lobby', { success: false, message: 'No lobby with this ID'});
	}

	var username = this.sessionManager.getSessionProperty(sessionID, 'username');

	if (!this.lobbyManager.lobbyExists(messageData.id)) {
		this.sendResponse(sessionID, 'join lobby', { success: false, message: 'No lobby with this ID'});
	}

	var lobby = this.lobbyManager.getLobby(messageData.id);
	lobby.join(username);

	console.log("LOBBY");
	console.log(lobby);

	this.sendResponse(sessionID, "join lobby", {
		id: messageData.id,
		success: true,
		message: "Successfully joined lobby"
	});	

	this.setUpLobbyListeners(sessionID, username, lobby);
};

LobbyMessageHandler.prototype.setUpLobbyListeners = function(sessionID, username, lobby) {
	var leaveSub = redis.createClient();
	leaveSub.subscribe('leave lobby:' + sessionID);
	leaveSub.subscribe('logout:' + sessionID);
	leaveSub.subscribe('disconnect:' + sessionID);
	leaveSub.subscribe('join lobby:' + sessionID);

	var destroySub = redis.createClient();
	destroySub.subscribe('destroy lobby:' + sessionID);

	var startGameSub = redis.createClient();
	startGameSub.subscribe('launch game:' + sessionID);

	var userJoin = function(username) {
		this.sendResponse(sessionID, "user join lobby", { id: lobby.id, username: username });
	};

	var userLeave = function(username) {
		this.sendResponse(sessionID, "user leave lobby", { id: lobby.id, username: username });
	};

	var destroy = function() {
		removeListeners();
		this.sendResponse(sessionID, "leave lobby", { id: lobby.id, success: true, message: "The lobby has been destroyed so you have left" });
	};

	var start = function(game) {
		this.sendResponse(sessionID, "loading game", { id: lobby.id, success: true, message: "Game is loading" });
		this.emit('loading game', sessionID, username, game)	
	};

	var removeListeners = function() {
		lobby.removeListener('user join', userJoin);
		lobby.removeListener('user leave', userLeave);
		lobby.removeListener('lobby destroyed', destroy);
		lobby.removeListener('game start', start);
		leaveSub.unsubscribe('leave lobby:' + sessionID);
		leaveSub.unsubscribe('logout:' + sessionID);
		leaveSub.unsubscribe('disconnect:' + sessionID);
		leaveSub.unsubscribe('join lobby:' + sessionID);
		destroySub.unsubscribe('destroy lobby:' + sessionID);
		startGameSub.unsubscribe('launch game:' + sessionID);
	};

	lobby.on('user join', userJoin.bind(this));
	lobby.on('user leave', userLeave.bind(this));
	lobby.on('lobby destroyed', destroy.bind(this));
	lobby.on('game start', start.bind(this));


	var self = this;

	leaveSub.on('message', function(channel, message) {
		lobby.leave(username);
		removeListeners();
		this.sendResponse(sessionID, "leave lobby", { id: lobbyID, message: "You have left the lobby", success: true });
	});

	destroySub.on('message', function(channel, message) {
		if (!lobby.getLeader() === username) {
			//This user is not the lobby leader, they cannot destroy the lobby
			return self.sendResponse(sessionID, "destroy lobby", { success: false, message: "You don't have permission to destroy this lobby" });
		}
		//This user is the lobby leader, they can destroy the lobby
		lobby.destroy();
		self.sendResponse(sessionID, "destroy lobby", { success: true, message: "Lobby successfully closed" });
	});


	startGameSub.on('message', function(channel, message) {
		if (!lobby.getLeader() === username) {
			//This user is not the lobby leader, they cannot destroy the lobby
			return self.sendResponse(sessionID, "launch game", { success: false, message: "You don't have permission to start this game" });
		} else {
			self.sendResponse(sessionID, "launch game", { success: true, message: "Game is launching" });
			self.emit('launch game', lobby);
		}
	});

};

LobbyMessageHandler.prototype.infoMessageReceived = function(sessionID, messageData) {
	if (messageData.hasOwnProperty('id')) {
		//Lobby info for a specific lobby
		if (!this.lobbyManager.lobbyExists(messageData.id)) {
			this.sendResponse(sessionID, 'info lobby', { success: false, message: 'No lobby with this ID'});
		}

		var lobby = this.lobbyManager.getLobby(messageData.id);
		this.sendResponse(sessionID, 'info lobby', { success: true, message: 'Lobby info request successful', lobbyData: lobby.info()});

	} else {
		//Request for info about all lobbies
		this.sendResponse(sessionID, "info lobby", {
			success: true,
			message: "Lobby data retrieval successful",
			lobbyData: this.lobbyManager.getAllLobbies().map(function(e) { return e.info(); })
		});
	}
};

LobbyMessageHandler.prototype.invalidMessage = function(sessionID) {
	this.sendResponse(sessionID, "error", { success: false, message: "Invalid message recieved" });
};

LobbyMessageHandler.prototype.sendResponse = function(sessionID, channel, data) {
	var response = {};
	response.sessionID = sessionID;
	response.channel = channel;
	response.data = data;
	this.outputPub.publish('output message:' + sessionID, JSON.stringify(response));
};

module.exports = function(_redis) {
	redis = _redis;

	return LobbyMessageHandler;
};
