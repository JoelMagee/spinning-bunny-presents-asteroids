/*jslint white: true node: true */

/**
 * LobbyManager
 *
 * @author : Sam Stonehouse
 * @date : 01/09/2014
 * @version  : 0.3
 *
 * Manages lobbies, inc. creation, destruction and ID generation
 * 
 */

var Lobby = require('./lobby')();


var LobbyIDGenerator = function() {
	this.lobbyCount = 0;
};

LobbyIDGenerator.prototype.generateID = function() {
	return this.lobbyCount++;
};

var LobbyManager = function() {
	this.lobbies = [];
	this.lobbiesMap = {};

	this.lobbyIDGenerator = new LobbyIDGenerator();
};

LobbyManager.prototype.createLobby = function(lobbyName) {
	var newLobby = new Lobby(this.lobbyIDGenerator.generateID(), lobbyName);
	var self = this;

	this.addLobby(newLobby);

	newLobby.on('lobby closed', function() {
		self.removeLobby(newLobby);
	});

	return newLobby;
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

LobbyManager.prototype.getAllLobbies = function() {
	return this.lobbies;
};

module.exports = function() {
	return LobbyManager;
};
