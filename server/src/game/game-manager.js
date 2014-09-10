/*jslint white: true node: true */

var redis;

var GameLogic = require('./asteroids-logic')();
var Game = require('./asteroids-game')(GameLogic);

var GameIDGenerator = function() {
	this.currentID = 0;
};

GameIDGenerator.prototype.generateID = function() {
	return this.currentID++;
};

var GameManager = function(models) {
	this.gameIDGenerator = new GameIDGenerator();
	this.gameIDMap = {};
	this.models = models;

	console.log("MODELS");
	console.dir(models);

	this.outputPub = redis.createClient();
};

GameManager.prototype.createGame = function(usernames) {
	console.log("Game manager creating game with users: " + usernames.join(", "));
	var game = new Game(this.gameIDGenerator.generateID(), usernames);
	var self = this;

	this._addGame(game);

	game.on('game end', function() {
		self._removeGame(game);
	});

	return game;
};

GameManager.prototype.joinGame = function(_sessionID, _username, _game) {
	var sessionID = _sessionID;
	var username = _username;
	var game = _game;
	var self = this;

	this.models.UserModel.findOne({username: username}, function(err, _user) {
		if (err) {
			console.error("Error loading user from database when starting a game")
		}

		var user = _user;
		
		//Start game procedure once all expected clients have joined
		var startGame = function() {
			self._sendResponse(sessionID, "start game", {
				success: true,
				message: "Game starting",
				id: game.id,
				data: game.getStartData()
			});

			//Update users stats in the database
			user.gamesStarted++;
			user.save();
		};

		game.once('game loaded', startGame);

		//General game events
		var startTurn = function(turnNumber) {
			console.log("[Game Manager] Turn started");
			self._sendResponse(sessionID, "start turn", { turnNumber: turnNumber });
		};

		var turnResultProcessed = function(turnResult) {
			console.log("[Game Manager] Turn result recieved");
			self._sendResponse(sessionID, "turn result", { turnResult: turnResult });
		};

		var gameEnd = function(endData) {
			console.log("[Game Manager] Game ended");



			//Send response to user
			self._sendResponse(sessionID, "game end", { 
				gameInfo: game.getInfo(),
				endData: endData 
			});

			//Update users stats
			user.gamesFinished++;

			if (endData.type === 'win') {
				//A single player is left alive
				if (user.username === endData.winner) {
					user.gamesWon++;
				}
			} else if (endData.type === 'draw') {
				//Draw case happens when turns run out or all players are destroyed on the same turn
				if (endData.winner.indexOf(user.username) !== -1) {
					user.gamesDrawn++;
				}
			} else if (endData.type === 'default') {
				//Default case happens when all but one players leave
				if (user.username === endData.winner) {
					user.gamesWon++;
				}
			}



			user.save();

			//Cleanup
			removeListeners();
			self._removeGame(game);
		};

		var playerLeave = function() {
			self._sendResponse(sessionID, "player leave", { username: username });
		};

		var allTurnsSubmitted = function() {
			//game.processTurnResult();
			//So do we need to do anything here? Maybe send a 'result being calculated message'
		};

		game.on('start turn', startTurn);
		game.on('turn result', turnResultProcessed);
		game.on('game end', gameEnd);
		game.on('player leave', playerLeave);
		game.on('all results submitted', allTurnsSubmitted);

		var turnSub = redis.createClient();

		turnSub.subscribe('game turn:' + sessionID);

		turnSub.on('message', function(channel, message) {
			var messageObj = JSON.parse(message);
			
			if (game.addTurn(username, messageObj.message)) {
				self._sendResponse(sessionID, "game turn", { success: true, message: "Your turn has been added" });
				game.checkTurnEnd();
			} else {
				self._sendResponse(sessionID, "game turn", { success: false, message: "Adding game turn failed" });
			}
		});


		var leaveSub = redis.createClient();

		leaveSub.subscribe('leave game:' + sessionID);
		leaveSub.subscribe('logout:' + sessionID);
		leaveSub.subscribe('disconnect:' + sessionID);

		leaveSub.on('message', function(channel, message) {
			console.log("[Game Manager] Leave game message recieved");
			removeListeners();
			game.removePlayer(username);
			game.checkTurnEnd();
			self._sendResponse(sessionID, "leave game", { success: true, message: "You have left the game" });
		});

		var removeListeners = function() {
			leaveSub.unsubscribe('leave game:' + sessionID);
			leaveSub.unsubscribe('logout:' + sessionID);
			leaveSub.unsubscribe('disconnect:' + sessionID);
			turnSub.unsubscribe('game turn:' + sessionID);
			game.removeListener('start turn', startTurn);
			game.removeListener('turn result', turnResultProcessed);
			game.removeListener('game end', gameEnd);
			game.removeListener('player leave', playerLeave);
		};

		game.addPlayer(username);

	});
};

GameManager.prototype._addGame = function(game) {
	this.gameIDMap[game.id] = game;
};

GameManager.prototype._removeGame = function(game) {
	game.removeAllListeners();
	delete this.gameIDMap[game.id];
}

GameManager.prototype._sendResponse = function(sessionID, channel, data) {
	var response = {};
	response.sessionID = sessionID;
	response.channel = channel;
	response.data = data;
	this.outputPub.publish('output message:' + sessionID, JSON.stringify(response));
}


module.exports = function(_redis, _models) {
	redis = _redis;

	return GameManager;
};
