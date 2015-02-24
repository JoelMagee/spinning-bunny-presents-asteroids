/*jslint white: true, node: true */

var xtend = require("xtend");

var defaultOptions = {
	worldHeight: 10000,
	worldWidth: 10000
}

var World = function(opts) {
	this.options = xtend(defaultOptions, opts);
};


World.prototype.getHeight = function() {
	return this.options.worldHeight;
};

World.prototype.getWidth = function() {
	return this.options.worldWidth;
};

World.prototype.getOptions = function() {
	return this.options;
}

module.exports = function() {
	return World;
};