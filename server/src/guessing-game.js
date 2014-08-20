/*jslint white: true, node: true */

var GuessingGame = function(id, usernames) {
	console.log("New guessing game created");
	this.id = id;
	this.usernames = usernames;

	this.randomNumber = 0;

	this.turnHistory = [];
	this.turnResults = [];
	this.lastTurn = [];

	this.currentTurn = 0;
	this.totalTurns = 1;

	this.onTurnBeginCallbacks = [];
	this.onTurnEndCallbacks = [];
	this.onGameEndCallbacks = [];
	this.onPlayerLeaveCallbacks = [];

	this.result = {};
	this.finished = false;

	this.init();
};

GuessingGame.prototype.init = function() {
	//Assign a random number between 1 and 100
	this.randomNumber = Math.floor(Math.random()*100 + 1);
}

GuessingGame.prototype.addTurn = function(username, turnData) {
	this.lastTurn.push({username: username, turnData: turnData});
};

GuessingGame.prototype.startTurn = function() {
	this.currentTurn++;

	//Run each of the turn begin callbacks we have saved
	for (var i = 0; i < this.onTurnBeginCallbacks; i++) {
		this.onTurnBeginCallbacks[i](this); 
	}
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

	//Run each of the turn end callbacks we have saved
	for (var i = 0; i < this.onTurnEndCallbacks.length; i++) {
		this.onTurnEndCallbacks[i](this); 
	}

	if (this.checkFinishConditions()) {
		this.gameFinished();
	}
};

GuessingGame.prototype.on = function(event, callback) {
	if (event === 'turn-begin') {
		this.onTurnBeginCallbacks.push(callback);
	} else if (event === 'turn-end') {
		this.onTurnEndCallbacks.push(callback);
	} else if (event === 'game-end') {
		this.onGameEndCallbacks.push(callback);
	} else if (event === 'player-leave') {
		this.onGameEndCallbacks.push(callback);
	} else {
		console.error("Adding callback for an event that doesn't exist");
	}
}

GuessingGame.prototype.checkFinishConditions = function() {
	if (this.currentTurn >= this.totalTurns) {
		this.gameFinished();
	}
}

GuessingGame.prototype.gameFinished = function() {
	this.finished = true;
	this.result.winner = this.turnResults[this.turnResults.length - 1].closest;

	for (var i = 0; i < this.onGameEndCallbacks.length; i++) {
		this.onGameEndCallbacks[i](this); 
	}
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