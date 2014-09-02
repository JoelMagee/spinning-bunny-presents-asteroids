/*jslint white: true, node: true */

var events = require('events');
var util = require("util");
var xtend = require("xtend");

var World = require('./world')();
var Player = require('./player')();
var AsteroidsLogic;

var defaultOptions = {
	world: {},
	turnLimit: 10
}


var AsteroidsGame = function(id, expectedPlayers, opts) {
	opts = opts || {};

	this.id = id;
	this.expectedPlayers = expectedPlayers;
	this.options = xtend(defaultOptions, opts);

	this.world = new World(this.options.world);
	this.players = [];

	this.currentTurn = 0;
	this.turnData = {};

	this.asteroidsLogic = undefined;

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
	if (!this.hasPlayer(username)) {
		//This player isn't here, how can we remove it??
		return false;
	}

	var player;

	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].getUsername() === username) {
			player = this.players[i];
			this.players.splice(i, 1);
			break;
		}
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
	//Increment turn number
	this.currentTurn++;
	this.turnsAdded = 0;
	this.turnData = {};

	this.emit('turn start');
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

	//No finish conditions were met
	return false;
};

AsteroidsGame.prototype.addTurn = function(username, data) {
	if (!this.hasPlayer(username)) {
		//This player is not in this game
		return false;
	}

	if (this.turnData.hasOwnProperty(username)) {
		//User has already submitted a turn
		return false;
	}

	this.turnData[username] = data;

	this.turnsAdded++;

	return true;
};

AsteroidsGame.prototype.checkTurnEnd = function() {
	if (this.turnsAdded === this.players.length) {
		this.turnEnd();
	}
}

AsteroidsGame.prototype.turnEnd = function() {
	//Process turn result

	this.asteroidsLogic.processTurnResult(this.turnData);
	this.emit('turn result', this.asteroidsLogic.getTurnResultData());

	this.asteroidsLogic.endTurnCleanup();

	this.turnData = {};

	//Check finish conditions to check the game isn't already over
	if (this.checkFinishConditions()) {
		return;
	}

	//Start first turn
	this.startTurn();
};

AsteroidsGame.prototype.getStartData = function() {
	return this.asteroidsLogic.getPlayerPositions();
};

AsteroidsGame.prototype.gameEnd = function(reason) {
	this.emit('game end', reason);
};

AsteroidsGame.prototype.getInfo = function() {
	return {};
}

module.exports = function(_AsteroidsLogic) {
	AsteroidsLogic = _AsteroidsLogic;

	return AsteroidsGame;
};