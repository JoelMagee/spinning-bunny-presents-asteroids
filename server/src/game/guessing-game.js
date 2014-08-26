/*jslint white: true, node: true */

var events = require('events');
var util = require("util");

var GuessingGame = function(id, expectedPlayers) {
	this.id = id;
	this.expectedPlayers = expectedPlayers;
	this.players = [];

	this.randomNumber = Math.floor(Math.random()*100 + 1);

	this.turnHistory = [];
	this.turnResults = [];
	this.lastTurn = [];
	this.turnsSubmitted = [];

	this.currentTurn = 0;
	this.totalTurns = 1;

	this.result = {};
	this.finished = false;

	events.EventEmitter.call(this);
};

util.inherits(GuessingGame, events.EventEmitter);

GuessingGame.prototype.addPlayer = function(username) {
	this.players.push(username);
	this.expectedPlayers.splice(this.expectedPlayers.indexOf(username), 1);

	if (this.expectedPlayers.length === 0) {
		this.emit('all players joined');
	}
};

GuessingGame.prototype.removePlayer = function(username) {
	console.log("Removing player from game: " + username);
	this.players.splice(this.players.indexOf(username), 1);
	this.emit("player leave", username);
}

GuessingGame.prototype.addTurn = function(username, data) {
	console.log("Adding turn");
	if (this.turnsSubmitted.indexOf(username) !== -1) {
		//Error, already a turn for this user
		return;
	}

	this.turnsSubmitted.push(username);

	this.lastTurn.push({username: username, guess: data.guess});
	this.emit('turn added', username);

	if (this.turnsSubmitted.length >= this.players.length) {
		console.log("All turns submitted");
		this.emit('all results submitted');
	} else {
		console.log("Not all turn results submitted");
		console.log(this.turnsSubmitted.length + " - " + this.players.length);
	}
};

GuessingGame.prototype.startTurn = function() {
	console.log("Starting turn");

	//Increment turn number
	this.currentTurn++;

	//Clear list of users who have submitted turns
	this.turnsSubmitted = [];

	//Let listeners know the turn has started
	this.emit('start turn', this.currentTurn);
	
};

GuessingGame.prototype.processTurnResult = function() {
	console.log("Processing game turn result");
	var currentlyClosest = undefined;

	for (var i = 0; i < this.lastTurn.length; i++) {
		if ((currentlyClosest === undefined) || (closestTo(this.randomNumber, currentlyClosest.guess, this.lastTurn[i].guess) > 0)) {
			currentlyClosest = this.lastTurn[i];
		}
	}

	this.turnResults.push({
		closest: currentlyClosest
	});

	this.emit('turn result processed', {closest: currentlyClosest});

	if (!this.checkFinishConditions()) {
		this.startTurn();
	}
};


GuessingGame.prototype.checkFinishConditions = function() {
	console.log("Checking finish conditions");
	if (this.players.length < 2) {
		this.gameFinished("Less than 2 players connected");
		return true;
	};

	if (this.currentTurn >= this.totalTurns) {
		this.gameFinished("Total turns submitted");
		return true;
	};

	if (this.turnResults.length > 0) {
		if (this.turnResults[this.turnResults.length - 1].closest.guess === this.randomNumber) {
			this.gameFinished("Random number guessed correctly");
			return true;
		}
	}

	return false;
}

GuessingGame.prototype.gameFinished = function(reason) {
	console.log("Game finished: " + reason);
	this.finished = true;
	this.result.winner = this.turnResults[this.turnResults.length - 1].closest;
	this.emit('game end');
};

GuessingGame.prototype.getInfo = function() {
	return {
		id: this.id,
		randomNumber: this.randomNumber,
		turnHistory: this.turnHistory,
		turnResults: this.turnResults,
		currentTurn: this.currentTurn,
		totalTurns: this.totalTurns,
		result: this.result,
		finished: this.finished
	};
};

/**
 * Returns a number depending on whether the second or third parameter is
 * closer to the first parameter
 *
 * If the second parameter is closest the result is < 0
 * If both the second and third parameters are closest then the result is 0
 * If the third parameter is closest the result is > 0
 */
var closestTo = function(val, first, second) {
	return Math.abs(val - first) - Math.abs(val - second);
}

module.exports = function() {
	return GuessingGame;
};