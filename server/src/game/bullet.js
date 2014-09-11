/*jslint node: true, white: true */

var SPEED_FACTOR = 1;

var Bullet = function(source, originPosition, direction, startT) {
	//Player that the bullet originated from
	this.source = source;
	//Position of the player when shot
	this.position = originPosition;
	//Angle bullet was fired, with down being 0, increasing counter clockwise
	this.direction = direction;

	this.turnStartPositon = {};

	this.startT = startT;

	this.alive = true;
	this.destroyedAt = -1;
};

Bullet.prototype.updateTurnStartPosition = function() {
	this.startT = 0;
	this.turnStartPositon.x = this.position.x;
	this.turnStartPositon.y = this.position.y;
}

Bullet.prototype.move = function(dt) {
	var dx = Math.cos(this.direction) * dt * SPEED_FACTOR;
	var dy = Math.sin(this.direction) * dt * SPEED_FACTOR;

	this.position.x += dx;
	this.position.y += dy;
};

Bullet.prototype.destroyed = function(t) {
	this.destroyedAt = t;
	this.alive = false;
}

Bullet.prototype.isAlive = function() {
	return this.alive;
}

Bullet.prototype.getSource = function() {
	return this.source;
}

Bullet.prototype.distanceTo = function(obj) {
	var objectsPosition = obj.getCurrentPosition();

	return Math.sqrt(Math.pow(objectsPosition.x - this.position.x, 2) + Math.pow(objectsPosition.y - this.position.y, 2));
};

Bullet.prototype.getCurrentPosition = function() {
	return {
		x: this.position.x,
		y: this.position.y
	}
}

Bullet.prototype.getBulletInfo = function() {
	return {
		startT: this.startT,
		turnStartPositon: this.turnStartPositon,
		destroyed: this.alive,
		destroyedAt: this.destroyedAt,
		direction: this.direction
	}
}

module.exports = function() {
	return Bullet;
}