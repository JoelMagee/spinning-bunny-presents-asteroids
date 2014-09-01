var events = require('events');
var util = require("util");

var Lobby = function(id, name) {
	this.id = id;
	this.name = name;
	this.users = [];

	events.EventEmitter.call(this);
};

util.inherits(Lobby, events.EventEmitter);

Lobby.prototype.join = function(username) {
	this.users.push(username);
	this.emit('user join', username);
};

Lobby.prototype.leave = function(username) {
	this.users.splice(this.users.indexOf(username), 1);
	this.emit('user leave', username);
};

Lobby.prototype.getUsers = function() {
	return this.users;
}

Lobby.prototype.hasUser = function(username) {
	return this.users.indexOf(username) !== -1;
};

Lobby.prototype.info = function() {
	return {
		id: this.id,
		name: this.name,
		usernames: this.users
	};
};

Lobby.prototype.destroy = function() {
	this.name = "[Destroyed] " + this.name;
	this.emit('lobby destroyed');
};

Lobby.prototype.getLeader = function() {
	if(this.users.length > 0) {
		return this.users[0];
	}

	return null;
};

Lobby.prototype.startGame = function(game) {
	this.emit('game start', game);
	this.name = "[Started] " + this.name;
};

module.exports = function() {
	return Lobby;
};