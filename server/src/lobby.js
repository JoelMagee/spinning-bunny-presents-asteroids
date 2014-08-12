/*
Creates a login object which handles authentication

Requres a storage abstraction to get user objects from
*/

var Lobby = function() {
	this.onReady = function() {
		console.log("Error, no ready function set, lobby can't progress");
	}


};

Lobby.prototype.addPlayer = function(user, socket) {

};

Lobby.prototype.ready = function() {
	this.onReady(this);
}

Lobby.prototype.onReady = function(callback) {
	this.onReady = callback;
}

var LobbyFactory = function() {

};

LobbyFactory.prototype.createLobby = function() {

};

module.exports = {
	Lobby: Lobby,
	LobbyFactory: LobbyFactory
};