/*jslint white: true, node: true */

var AsteroidsLogic = function(players, world) {
	this.players = players;
	this.world = world;

	this.initState();
};

AsteroidsLogic.prototype.initState = function() {
	//Give each player a starting position
	for (var i = 0; i < this.players.length; i++) {
		var position = this.generateStartingPosition();
		this.players[i].position = {};
		this.players[i].position.x = position.x;
		this.players[i].position.y = position.y;
	}
};

AsteroidsLogic.prototype.generateStartingPosition = function() {
	return {
		x: Math.random() * this.world.getWidth(),
		y: Math.random() * this.world.getHeight()
	};
};

AsteroidsLogic.prototype.processTurnResult = function(turnData) {

	for (var i = 0; i < this.players.length; i++) {
		var p = this.players[i];
		
		if (turnData.hasOwnProperty(p.username)) {
			//This player has turn data for this round
			p.position.x = turnData[p.username].destination.x;
			p.position.y = turnData[p.username].destination.y;
		} else {
			//Player has no turn data for this round.. what do?
		}
	}
};

AsteroidsLogic.prototype.getTurnResultData = function() {
	var turnResultData = {};

	turnResultData.moves = [];

	for (var i = 0; i < this.players.length; i++) {
		turnResultData.moves.push(
		{
			username: this.players[i].username,
			position: {
				x: this.players[i].position.x,
				y: this.players[i].position.y
			}
		});
	}

	return turnResultData;
};

AsteroidsLogic.prototype.getPlayerPositions = function() {
	var playerPositions = {};

	for (var i = 0; i < this.players.length; i++) {
		playerPositions[this.players[i].username] = {
			position: {
				x: this.players[i].position.x,
				y: this.players[i].position.y
			}
		}
	}

	return playerPositions;
};

module.exports = function() {
	return AsteroidsLogic;
}