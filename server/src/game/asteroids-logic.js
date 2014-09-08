/*jslint white: true, node: true */

var TURN_TICKS = 1000;

var positionOnBezier = function(p0, p1, p2, t) {
	return {
		x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
		y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
	};
};

var AsteroidsLogic = function(players, world) {
	this.players = players;
	this.world = world;

	this.initState();
};

AsteroidsLogic.prototype.initState = function() {
	//Give each player a starting position
	for (var i = 0; i < this.players.length; i++) {
		var position = this.generateStartingPosition();
		this.players[i].setInitialPosisiton(position.x, position.y);
	}
};

AsteroidsLogic.prototype.generateStartingPosition = function() {
	return {
		x: Math.random() * this.world.getWidth(),
		y: Math.random() * this.world.getHeight()
	};
};

AsteroidsLogic.prototype.processTurnResult = function(turnData, cb) {
	console.log("Processing turn result");

	var self = this;
	var result = {};

	//Check all players submitted turns
	this.players.forEach(function(player) {
		if (player.alive()) {
			if (!turnData.hasOwnProperty(player.username)) {
				//If it doesn't have a turn submission, make it attempt to return to the same point
				turnData[player.username].destination.x = player.position.x;
				turnData[player.username].destination.y = player.position.y;
			}
		}
	});

	//Update move information
	this.players.forEach(function(player) {
		if (!player.alive()) {
			return;
		}
		player.setDestination(turnData[player.username].destination.x, turnData[player.username].destination.y);
	});

	for (var j = 1; j <= TURN_TICKS; j++) {
		var t = j/TURN_TICKS;

		//Update all player positions
		this.players.forEach(function(player) {
			if (!player.alive()) {
				return; //We don't want to move a destroyed player
			}

			player.moveOnCurrentArc(t);
		});


		//Check for collisions between players
		this.players.forEach(function(player) {
			for (var k = 0; k < self.players.length; k++) {
				if (player === self.players[k]) {
					continue; //We don't want to check collisions against itself
				}

				if (!player.alive()) {
					continue; //We don't want to check collisions if this player has been destroyed
				}

				if (!self.players[k].alive()) {
					continue; //We don't want to check collisions against players who are destroyed
				}

				if (player.distanceTo(self.players[k]) < 400) {
						console.log("collision between " + self.players[k].username + " and " + player.username);
						//Collision
						player.addCollision(t, self.players[k]);
						self.players[k].addCollision(t, player);
				}
			}
		});

		//Update positions for all projectiles

		//Check collisions between projectiles
		
		//Check collisions between projectiles and players
	}

	
	//Create array of results
	for (var i = 0; i < this.players.length; i++) {
		console.log("Creating result array");
		if (!this.players[i].destroyed) {
			result[this.players[i].username] = this.players[i].getTurnData();
		}
	}

	this.players.forEach(function(player) {
		if (!player.alive()) {
			player.destroyed = true;
		}
	});

	cb(null, result);
};

AsteroidsLogic.prototype.getPlayerPositions = function() {
	var playerPositions = {};

	for (var i = 0; i < this.players.length; i++) {
		playerPositions[this.players[i].username] = this.players[i].getPlayerPosition();
	}

	return playerPositions;
};

AsteroidsLogic.prototype.endTurnCleanup = function() {


}

module.exports = function() {
	return AsteroidsLogic;
}