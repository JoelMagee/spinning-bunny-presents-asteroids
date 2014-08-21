/*jslint white: true, node: true */

var events = require('events');
var util = require("util");

var GuessingGame = function(id, usernames) {
	console.log("New guessing game created");
	this.id = id;
	this.usernames = usernames;

	this.randomNumber = Math.floor(Math.random()*100 + 1);

	this.turnHistory = [];
	this.turnResults = [];
	this.lastTurn = [];

	this.currentTurn = 0;
	this.totalTurns = 1;

	this.result = {};
	this.finished = false;

	events.EventEmitter.call(this);

	this.init();
};

util.inherits(GuessingGame, events.EventEmitter);

GuessingGame.prototype.addTurn = function(username, turnData) {
	this.lastTurn.push({username: username, turnData: turnData});
};

GuessingGame.prototype.startTurn = function() {
	this.currentTurn++;
};

GuessingGame.prototype.processTurnResult = function() {
	var usersWithNoTurn = this.usernames.slice(0);

	var currentlyClosest = undefined;

	for (var i = 0; i < this.lastTurn.length; i++) {
		if (usersWithNoTurn.indexOf(this.lastTurn[i].username) === -1) {
			console.error("Somehow received turn result from someone not in the game :|");
			continue;
		}

		usersWithNoTurn.splice(usersWithNoTurn.indexOf(this.lastTurn[i].username));

		if ((currentlyClosest === undefined) || (closestTo(this.randomNumber, currentlyClosest.turnData.guess, this.lastTurn[i].turnData.guess) > 0)) {
			currentlyClosest = this.lastTurn[i];
		}
	}

	//Maybe do something with players that had no turn?

	this.turnResults.push({
		closest: currentlyClosest
	});


	if (this.checkFinishConditions()) {
		this.gameFinished();
	}
};


GuessingGame.prototype.checkFinishConditions = function() {
	if (this.currentTurn >= this.totalTurns) {
		this.gameFinished();
	}
}

GuessingGame.prototype.gameFinished = function() {
	this.finished = true;
	this.result.winner = this.turnResults[this.turnResults.length - 1].closest;

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