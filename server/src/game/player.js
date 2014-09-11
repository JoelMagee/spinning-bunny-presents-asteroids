/*jslint white: true, node: true */

var PREDICTION_FACTOR = 1.3;

var calculateBezierPoint = function(v0, v1, v2, t) {
	return (1 - t) * (1 - t) * v0 + 2 * (1 - t) * t * v1 + (t * t * v2)
};

var Player = function(username) {
	this.username = username;
	this.position = {};
	this.oldPosition = {};
	this.prediction = {};
	this.oldPrediction = {};
	this.destination = {};

	this.lives = 1;
	this.collisionHistory = [];

	this.currentTurnCollisions = [];

	this.destroyed = false;
};

Player.prototype.alive = function() {
	return this.lives > 0;
};

Player.prototype.destroyed = function() {
	return this.destroyed;
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

Player.prototype.setDestination = function(destinationX, destinationY) {
	this.addPrediction(destinationX, destinationY);

	this.destination.x = destinationX;
	this.destination.y = destinationY;

	this.oldPosition.x = this.position.x;
	this.oldPosition.y = this.position.y;

	this.currentTurnCollisions = [];
};

Player.prototype.addPrediction = function(destinationX, destinationY) {
	this.oldPrediction.x = this.prediction.x;
	this.oldPrediction.y = this.prediction.y;

	this.prediction.x = calculateBezierPoint(this.oldPosition.x, this.oldPrediction.x, destinationX, PREDICTION_FACTOR);
	this.prediction.y = calculateBezierPoint(this.oldPosition.y, this.oldPrediction.y, destinationY, PREDICTION_FACTOR);	
};

Player.prototype.moveOnCurrentArc = function(t) {
	this.position.x = calculateBezierPoint(this.oldPosition.x, this.oldPrediction.x, this.destination.x, t);
	this.position.y = calculateBezierPoint(this.oldPosition.y, this.oldPrediction.y, this.destination.y, t);	
};

Player.prototype.addCollision = function(t) {
	this.lives--;

	if (this.lives < 0) {
		this.lives = 0;
	}
	
	this.currentTurnCollisions.push({t: t, livesLeft: this.lives});
	this.collisionHistory.push({t: t, livesLeft: this.lives});
};

Player.prototype.getPlayerData = function() {
	return {
		username: this.username,
		position: this.position,
		prediction: this.prediction
	}
};

Player.prototype.getPositionOnArc = function(t) {
	return {
		x: calculateBezierPoint(this.oldPosition.x, this.oldPrediction.x, this.destination.x, t),
		y: calculateBezierPoint(this.oldPosition.y, this.oldPrediction.y, this.destination.y, t)
	}
}

Player.prototype.getTurnData = function() {
	return {
		collisions: this.currentTurnCollisions,
		oldPosition: this.oldPosition,
		oldPrediction: this.oldPrediction,
		position: this.position,
		prediction: this.prediction,
		destination: this.destination
	}
}

Player.prototype.getPlayerPosition = function() {
	return {
		position: this.position,
		prediction: this.prediction
	}
};

Player.prototype.getUsername = function() {
	return this.username;
};

Player.prototype.distanceTo = function(obj) {
	var objectsPosition = obj.getCurrentPosition();

	return Math.sqrt(Math.pow(objectsPosition.x - this.position.x, 2) + Math.pow(objectsPosition.y - this.position.y, 2));
};

Player.prototype.getCurrentPosition = function() {
	return {
		x: this.position.x,
		y: this.position.y
	};
};

module.exports = function() {
	return Player;
};