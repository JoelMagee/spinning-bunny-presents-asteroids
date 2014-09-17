/*jslint white: true, node: true */

var Bullet = require('./bullet')();
var Asteroid = require('./asteroid')();

var TURN_TICKS = 5000;

var COLLISION_DISTANCE = 100;

var BULLET_SPEED_FACTOR = 5000;

var POINTS_PER_ROUND = 2;
var POINTS_PER_KILL = 10;

var MIN_AST = 12;
var MAX_AST = 30;

var MAX_AST_RADIUS = 500;
var MIN_AST_RADIUS = 20;


var positionOnBezier = function(p0, p1, p2, t) {
	return {
		x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
		y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
	};
};

var AsteroidsLogic = function(players, world) {
	this.players = players;
	this.world = world;

	this.asteroids = [];

	this.bullets = [];
	this.allBullets = [];

	this.initState();
};

AsteroidsLogic.prototype.initState = function() {
	var self = this;

	//Add Asteroids
	var numAsteroids = MIN_AST + Math.floor(Math.random() * (MAX_AST - MIN_AST));

	for (var i = 0; i < numAsteroids; i++) {
		var x = Math.random() * this.world.getWidth();
		var y = Math.random() * this.world.getHeight();
		var radius = MIN_AST_RADIUS + Math.random() * (MAX_AST_RADIUS - MIN_AST_RADIUS);

		var ast = new Asteroid(x, y, radius);

		this.asteroids.push(ast);
	}

	var failCount = 0;

	this.players.forEach(function(playerOne, i) {
		var positionFound = false;

		do {
			var temp = {};
			temp.position = self.generateStartingPosition();

			var playerOk = true;

			for (var j = 0; j < i; j++) {
				var playerTwo = self.players[j]; 
				if ((playerTwo.distanceTo(temp) < 700)) {
					console.log("Failed creating position - another player");
					playerOk = false;
					break;
				}
			}

			if (!playerOk) {
				failCount++;
				continue;
			}

			var asteroidsOk = true;

			for (var k = 0; k < self.asteroids.length; k++) {
				if (self.asteroids[k].distanceTo(temp) <= COLLISION_DISTANCE) {
					console.log("Failed creating position - asteroid");
					asteroidsOk = false;
					break;
				}
			}

			if (!asteroidsOk) {
				failCount++;
				continue;
			}

			positionFound = true;
			playerOne.setInitialPosisiton(temp.position.x, temp.position.y);
		} while (!positionFound);
	});

	console.log("All player positions set, there were: " + failCount + " suggested positions which failed");
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

	var newBullets = [];
	this.allBullets = this.bullets.slice();

	//Check all players submitted turns
	this.players.forEach(function(player) {
		if (player.alive()) {
			if (!turnData.hasOwnProperty(player.username)) {
				//If player doesn't have a turn submission, make it attempt to return to the same point
				turnData[player.username].destination.x = player.position.x;
				turnData[player.username].destination.y = player.position.y;
			} else {
				//If they have fire data, use it to create a bullet object
				if (turnData[player.username].hasOwnProperty('shot') && turnData[player.username]['shot'].hasOwnProperty('t') && turnData[player.username]['shot'].hasOwnProperty('direction')) {
					newBullets.push( { 
							t: turnData[player.username]['shot']['t'],
							player: player,
							direction: turnData[player.username]['shot']['direction']
						});
				}
			}
		}
	});

	//Update player scores
	this.players.forEach(function(player) {
		player.score+= POINTS_PER_ROUND;
	});

	//Update move information
	this.players.forEach(function(player) {
		if (!player.alive()) {
			return;
		}
		player.setDestination(turnData[player.username].destination.x, turnData[player.username].destination.y);
	});

	//Reset all projectiles
	this.bullets.forEach(function(bullet) {
		bullet.updateTurnStartPosition();
	});

	for (var j = 1; j <= TURN_TICKS; j++) {
		var t = j/TURN_TICKS;

		if (j === TURN_TICKS) {
			t = 1;
		}

		//Update all player positions
		this.players.forEach(function(player) {
			if (!player.alive()) {
				return; //We don't want to move a destroyed player
			}

			player.moveOnCurrentArc(t);
		});

		//Update all projectile positions
		this.bullets.forEach(function(bullet) {
			bullet.update(1/TURN_TICKS);
		});

		//Check for players going out of bounds
		this.players.forEach(function(player) {
			if (!player.alive()) {
				return; //We don't need to check if they're dead
			}

			var position = player.getCurrentPosition();

			if (position.x < 0 || position.x > self.world.getWidth() || position.y < 0 || position.y > self.world.getHeight()) {
				console.log("Player: " + player.username + " went out of bounds");
				player.addCollision(t);
			}
		});

		//Check all projectiles going out of bounds
		this.bullets.forEach(function(bullet) {
			var position = bullet.getCurrentPosition();

			if (position.x < 0 || position.x > self.world.getWidth() || position.y < 0 || position.y > self.world.getHeight()) {
				console.log("Bullet out of bounds");
				bullet.setDestroyed(t);
			}
		});

		//Check for player collisions between each other
		this.players.forEach(function(playerOne) {
			self.players.forEach(function(playerTwo) {
				if (playerOne === playerTwo) {
					return; //We don't want to check collisions against itself
				}

				if (!playerOne.alive() || !playerTwo.alive()) {
					return; //We don't want to check collisions if either player has been destroyed
				}

				if (playerOne.distanceTo(playerTwo) < COLLISION_DISTANCE) {
					console.log("collision between " + playerOne.username + " and " + playerTwo.username);
					playerOne.addCollision(t);
					playerTwo.addCollision(t);
					playerOne.score+= POINTS_PER_KILL;
					playerTwo.score+= POINTS_PER_KILL;  //TODO: Move scoring into player class
					playerOne.destroyedPlayer(playerTwo);
					playerTwo.destroyedPlayer(playerOne);
				}
			});
		});		

		//Check for collisions between players and asteroids
		
		this.players.forEach(function(player) {
			self.asteroids.forEach(function(asteroid) {
				if (!player.alive()) {
					return; //We don't want to check collisions if either player has been destroyed
				}

				if (asteroid.distanceTo(player) <= COLLISION_DISTANCE/2) {
					console.log("Player: " + player.username + " was rekt by an asteroid");
					player.addCollision(t);
				}
			});
		});

		//Check all the bullets waiting to be fired, add new ones as necessary
		newBullets.forEach(function(bullet) {
			if ((bullet.t <= t) && (bullet.player.alive())) {
				console.log("Adding new bullet");
				var newBullet = new Bullet(bullet.player, bullet.player.getPositionOnArc(bullet.t), bullet.direction, BULLET_SPEED_FACTOR, bullet.t);
				self.bullets.push(newBullet);
				self.allBullets.push(newBullet);
				newBullets.splice(newBullets.indexOf(bullet), 1);
			}
		});

		//Check collisions between projectiles
		this.bullets.forEach(function(firstBullet) {
			self.bullets.forEach(function(secondBullet) {
				if (firstBullet === secondBullet) {
					//We don't want to check collisions between the same bullet
					return;
				}

				if (firstBullet.distanceTo(secondBullet) < COLLISION_DISTANCE) {
					firstBullet.setDestroyed(t);
					secondBullet.setDestroyed(t);
				}
			});
		});

		//Check collisions between projectiles and players
		this.players.forEach(function(player) {
			if (!player.alive()) {
				return; //We don't want to check collisions if this player has been destroyed
			}

			self.bullets.forEach(function(bullet) {
				// if (bullet.getSource() === player) {
				// 	return; //We don't want to check collisions against the player who fired the bullet
				// }


				if (player.distanceTo(bullet) < COLLISION_DISTANCE) {
					console.log("Player " + player.username + " was hit by a bullet");
					player.addCollision(t);
					bullet.setDestroyed(t);
					bullet.getSource().score+= POINTS_PER_KILL;
					bullet.getSource().destroyedPlayer(player);
				} 
			});
		});

		//Check collisions between projectiles and asteroids
		this.asteroids.forEach(function(asteroid) {
			self.bullets.forEach(function(bullet) {
				if (asteroid.distanceTo(bullet) <= 0) {
					console.log("Bullet sent by: " + bullet.getSource().username + " was rekt by an asteroid!");
					bullet.setDestroyed(t);
				}
			});
		});

		//Remove expired bullets from the list
		this.bullets.forEach(function(bullet, i) {
			if (bullet.isDestroyed()) {
				self.bullets.splice(self.bullets.indexOf(bullet), 1);
			}
		});
	}

	//Create result
	var result = {};
	result.players = {};
	result.bullets = [];

	this.players.forEach(function(player) {
		if (!player.destroyed) {
			result.players[player.username] = player.getTurnData();
		}
	});

	this.allBullets.forEach(function(bullet) {
		result.bullets.push(bullet.getBulletInfo());
	});


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

AsteroidsLogic.prototype.getAsteroids = function() {
	return this.asteroids;
}

AsteroidsLogic.prototype.endTurnCleanup = function() {

}

module.exports = function() {
	return AsteroidsLogic;
}