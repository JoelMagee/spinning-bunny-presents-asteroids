/*jslint white: true, node: true */

var events = require('events');
var util = require("util");
var xtend = require("xtend");

var World = require('./world')();
var Player = require('./player')();
var AsteroidsLogic;

var defaultOptions = {
	world: {},
	turnLimit: 100
}



var AsteroidsGame = function(id, expectedPlayers, opts) {
	opts = opts || {};

	this.id = id;
	this.expectedPlayers = expectedPlayers;
	this.options = xtend(defaultOptions, opts);

	this.world = new World(this.options.world);
	this.players = [];

	this.turnsExpected = [];

	this.currentTurn = 0;
	this.turnData = {};

	this.asteroidsLogic = undefined;
	this.turnEnded = false;

	events.EventEmitter.call(this);
};

util.inherits(AsteroidsGame, events.EventEmitter);

AsteroidsGame.prototype.getOptions = function() {
	this.options.world = this.world.getOptions();
	return this.options;
};

AsteroidsGame.prototype.addPlayer = function(username) {
	if (this.expectedPlayers.indexOf(username) === -1) {
		//User can't join as isn't expected in this game
		return false;
	}

	//Remove the player from the expected players
	this.expectedPlayers.splice(this.expectedPlayers.indexOf(username), 1);

	var player = new Player(username);
	this.players.push(player);
	this.emit('player join', player);

	if (this.expectedPlayers.length === 0) {
		this.emit('all players joined');
		this.startGame();
	}

	return true;
};

AsteroidsGame.prototype.removePlayer = function(username) {
	console.log("Player has left: " + username);
	if (!this.hasPlayer(username)) {
		//This player isn't here, how can we remove it??
		return false;
	}

	var player;

	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].getUsername() === username) {
			player = this.players[i];
			//this.players.splice(i, 1);
			player.addCollision(0);
			break;
		}
	}

	if (this.expectedPlayers.indexOf(username) !== -1) {
		this.expectedPlayers.splice(this.expectedPlayers.indexOf(username), 1);

	}

	this.emit('player leave', player);
};

AsteroidsGame.prototype.hasPlayer = function(username) {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].getUsername() === username) {
			return true;
		}
	}

	return false;
};

AsteroidsGame.prototype.getPlayer = function(username) {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].getUsername() === username) {
			return this.players[i];
		}
	}

	return false;
};

AsteroidsGame.prototype.startGame = function() {
	this.asteroidsLogic = new AsteroidsLogic(this.players, this.world);
	this.emit('game loaded', this.getOptions());

	//Check finish conditions to check the game isn't already over
	if (this.checkFinishConditions()) {
		return;
	}

	//Start first turn
	this.startTurn();
}

AsteroidsGame.prototype.startTurn = function() {
	var self = this;

	//Increment turn number
	this.currentTurn++;
	this.turnsAdded = 0;
	this.turnData = {};

	this.players.forEach(function(player) {
		if (player.alive()) {
			self.expectedPlayers.push(player.username);
		}
	});

	this.turnEnded = false;

	this.emit('start turn');
};

/**
 * Checks whether the game finish conditions have been met
 *
 * If some finish conditions are met then it returns true, else false
 *
 * Will call this.gameEnd() if finish conditions are met, with the reason
 * for the end, i.e. 'Less than 2 players'
 * 
 * @return {Boolean} Whether end game conditions are met
 */
AsteroidsGame.prototype.checkFinishConditions = function() {
	//Make sure more than one player is present
	if (this.players.length < 2) {
		this.gameEnd("Less than 2 players connected");
		return true;
	}

	if ((this.options.turnLimit > 0) && (this.currentTurn >= this.options.turnLimit)) {
		this.gameEnd("Maximum number of turns exceeded");
		return true;
	}

	var playerAliveCount = 0;

	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].alive()) {
			playerAliveCount++;
		}
	}

	if (playerAliveCount < 2) {
		this.gameEnd("Less than 2 players alive");
		return true;
	}

	//No finish conditions were met
	return false;
};

AsteroidsGame.prototype.addTurn = function(username, data) {
	if (!this.hasPlayer(username)) {
		//This player is not in this game
		return false;
	}

	if (this.expectedPlayers.indexOf(username) !== -1) {
		this.expectedPlayers.splice(this.expectedPlayers.indexOf(username), 1);
	}

	this.turnData[username] = data;

	this.turnsAdded++;

	return true;
};

AsteroidsGame.prototype.checkTurnEnd = function() {
	if (this.turnEnded) {
		return; //Still processing turn results
	}

	if (this.expectedPlayers.length > 0) {
		return; //Not all players have submitted moves
	}

	this.turnEnd();
}

AsteroidsGame.prototype.turnEnd = function() {
	//Process turn result
	this.turnEnded = true;

	var self = this;

	this.asteroidsLogic.processTurnResult(this.turnData, function(err, turnResultData) {
		self.emit('turn result', turnResultData);

		self.asteroidsLogic.endTurnCleanup();

		self.turnData = {};

		//Check finish conditions to check the game isn't already over
		if (self.checkFinishConditions()) {
			return;
		}

		//Start first turn
		self.startTurn();
	});
};

AsteroidsGame.prototype.getStartData = function() {
	return {
		players: this.asteroidsLogic.getPlayerPositions(),
		asteroids: this.asteroidsLogic.getAsteroids()
	}
};

AsteroidsGame.prototype.gameEnd = function(reason) {
	this.emit('game end', reason);
};

AsteroidsGame.prototype.getPlayers = function() {
	return this.players;
}

AsteroidsGame.prototype.getWinners = function() {
	var winners = [];

	var orderedPlayers = this.players.splice();

	orderedPlayers.sort(function(playerOne, playerTwo) {
		return playerOne.score - playerTwo.score;
	});

	if (orderedPlayers.length === 0) {
		return [];
	};

	var highest = orderedPlayers[0].score;

	orderedPlayers.forEach(function(player) {
		if (player.score === highest) {
			winners.push(player);
		}
	});

	console.log("Winners:");
	console.dir(winners);

	return winners;
}

module.exports = function(_AsteroidsLogic) {
	AsteroidsLogic = _AsteroidsLogic;

	return AsteroidsGame;
};