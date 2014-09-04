/*jslint white: true, node: true */

var bezierT = 1.3;

var calculateBezierPoint = function(v0, v1, v2, t) {
	return (1 - t) * (1 - t) * v0 + 2 * (1 - t) * t * v1 + (t * t * v2)
};

var Player = function(username) {
	this.username = username;
	this.position = {};
	this.oldPosition = {};
	this.prediction = {};
	this.oldPrediction = {};

	this.lives = 1;
};

Player.prototype.setInitialPosisiton = function(x, y) {
	this.position.x = x;
	this.position.y = y;

	this.oldPosition.x = x;
	this.oldPosition.y = y;

	this.prediction.x = x;
	this.prediction.y = y;

	this.oldPrediction.x = x;
	this.oldPrediction.y = y;
};

Player.prototype.moveTo = function(destinationX, destinationY) {
	this.position.x = destinationX;
	this.position.y = destinationY;

	this.prediction.x = calculateBezierPoint(this.oldPosition.x, this.oldPrediction.x, destinationX, bezierT);
	this.prediction.y = calculateBezierPoint(this.oldPosition.y, this.oldPrediction.y, destinationY, bezierT);
};

Player.prototype.updatePrediction = function() {
	this.oldPosition.x = this.position.x;
	this.oldPosition.y = this.position.y;

	this.oldPrediction.x = this.prediction.x;
	this.oldPrediction.y = this.prediction.y;
};

Player.prototype.getPlayerData = function() {
	return {
		username: this.username,
		position: this.position,
		prediction: this.prediction
	}
};

Player.prototype.getPlayerPosition = function() {
	return {
		position: this.position,
		prediction: this.prediction
	}
};

Player.prototype.getUsername = function() {
	return this.username;
};

module.exports = function() {
	return Player;
};