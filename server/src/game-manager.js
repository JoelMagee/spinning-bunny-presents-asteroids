/*jslint white: true node: true */

var redis;
var Game = require('./guessing-game')();

var GameIDGenerator = function() {
	this.currentID = 0;
};

GameIDGenerator.prototype.generateID = function() {
	return this.currentID++;
};

var GameManager = function(sessionManager) {
	this.sessionManager = sessionManager;
	this.gameIDGenerator = new GameIDGenerator();

	this.gameIDMap = {};


	this.init();
};

GameManager.prototype.init = function() {
	var gameTurnSub = redis.createClient();
	var playerLeaveSub = redis.createClient();

	this.gamePub = redis.createClient();

	gameTurnSub.on('pmessage', function(channelPattern, actualChannel, message) {
		console.log("GAME TURN");
	});

	gameTurnSub.psubscribe("game turn:*");

	playerLeaveSub.on('pmessage', function(channelPattern, actualChannel, message) {
		console.log("PLAYER LEAVE");
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;
	});

	playerLeaveSub.psubscribe("player leave:*");
};

// GameManager.prototype.addPlayer = function(game, sessionID, player) {

// }

GameManager.prototype.createGame = function(players, cb) {
	console.log("Players:");
	console.log(players);
	var usernames = players.map(function(e, i) { return e.username; });
	var sessionIDs = players.map(function(e, i) { return e.sessionID; });

	var newGame = new Game(this.gameIDGenerator.generateID());
	
	this.gameIDMap[newGame.id] = newGame;

	var self = this;

	newGame.on('game-end', function(game) {
		console.log("Game end in game manager");
		delete this.gameIDMap[game.id];
	});

	newGame.on('turn-begin', function(game) {
		console.log("Turn begin in game manager");

		var response = {};
		response.data = {};
		response.data.currentTurn = game.currentTurn;

		for (var i = 0; i < sessionIDs.length; i++) {
			response.sessionID = sessionIDs[i];
			//self.gamePub.publish('output message:' + sessionIDs[i], 'turn begin',)
		}
	});

	newGame.on('turn-end', function() {
		console.log("Turn end called in game manager");
	});

	newGame.on('player-leave', function() {
		console.log("Player leave called in game manager");
	});

	cb(newGame);
};


module.exports = function(_redis) {
	redis = _redis;

	return GameManager;
};
