/*jslint white: true, node: true */

var Player = function(username) {
	this.username = username;
	this.position = {};

	this.lives = 1;
};

Player.prototype.getUsername = function() {
	return this.username;
};

module.exports = function() {
	return Player;
};