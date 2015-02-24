/*jslint white: true node: true */

var Asteroid = function(x, y, radius) {
	this.position ={};
	this.position.x = x;
	this.position.y = y;
	this.radius = radius;
};

Asteroid.prototype.getCurrentPosition = function() {
	return {
		x: this.position.x,
		y: this.position.y
	}
};

Asteroid.prototype.distanceTo = function(obj) {
	var objectsPosition = obj.getCurrentPosition && obj.getCurrentPosition() || obj.position;
	
	return Math.sqrt(Math.pow(objectsPosition.x - this.position.x, 2) + Math.pow(objectsPosition.y - this.position.y, 2)) - this.radius;
};

module.exports = function() {
	return Asteroid;
}