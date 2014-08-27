/*jslint white: true, node: true */

//Mock Logic class
var AsteroidsLogic = function(players, world) {};
AsteroidsLogic.prototype.processTurnResult = function(turnData) {};

var AsteroidsGame = require('../src/game/asteroids-game')(AsteroidsLogic);

describe("Asteroids game initialistation", function() {

	var id = 0;
	var expectedPlayers = ["sam", "joel"];
	var game;

	beforeEach(function() {
		game = new AsteroidsGame(id, expectedPlayers);
	});

	it("should be created with a given ID and remeber that ID", function() {
		expect(game.id).toBe(0);
	});

	it("should create a new game with the given world size", function() {
		expect(game.expectedPlayers.length).toBe(2);
		expect(game.expectedPlayers[0]).toBe("sam");
		expect(game.expectedPlayers[1]).toBe("joel");
	});
});

describe("Asteroids world initialistation", function() {

	var id = 0;
	var expectedPlayers = ["sam", "joel"];
	var options = {
		world: {
			worldHeight: 5000,
			worldWidth: 5000
		}
	};

	var game;

	it("should create a new world of the default size (10,000 * 10,000)", function() {
		game = new AsteroidsGame(id, expectedPlayers);
		expect(game.world.getWidth()).toBe(10000);
		expect(game.world.getHeight()).toBe(10000);
	});

	it("should use the options to create a new world of the correct size", function() {
		game = new AsteroidsGame(id, expectedPlayers, options);
		expect(game.world.getWidth()).toBe(5000);
		expect(game.world.getHeight()).toBe(5000);
	});
});

describe("Asteroids player joins", function() {

	var id = 0;
	var expectedPlayers;
	var game;

	beforeEach(function() {
		expectedPlayers = ["sam", "joel"];
		game = new AsteroidsGame(id, expectedPlayers);
	});

	it("should allow an expected player to join", function() {
		expect(game.players.length).toBe(0);
		var successful = game.addPlayer("sam");
		expect(successful).toBe(true);
		expect(game.hasPlayer("sam")).toBe(true);
		expect(game.hasPlayer("joel")).toBe(false);
		expect(game.hasPlayer("frank")).toBe(false);
	});

	it("should not allow a player which is not expected to join", function() {
		expect(game.players.length).toBe(0);
		var successful = game.addPlayer("frank");
		expect(successful).toBe(false);
		expect(game.hasPlayer("frank")).toBe(false);
		expect(game.hasPlayer("sam")).toBe(false);
		expect(game.hasPlayer("joel")).toBe(false);
	});


});

describe("Asteroids player join events", function() {

	var id = 0;
	var expectedPlayers = ["sam", "joel"];
	var game;

	var playerJoined;
	var allPlayersJoined;
	var player;


	var playerJoinEvent = function(_player) {
		playerJoined = true;
		player = _player;
	};

	var allPlayersJoinedEvent = function() {
		allPlayersJoined = true;
	};

	beforeEach(function() {
		game = new AsteroidsGame(id, expectedPlayers);
		expectedPlayers = ["sam", "joel"];
		playerJoined = false;
		allPlayersJoined = false;
		player = undefined;

		game.on('player join', playerJoinEvent);
		game.on('all players joined', allPlayersJoinedEvent);
	});

	it("should emit a 'player join' event when a new player joins", function() {
		waitsFor(function() {
			return playerJoined;
		}, 'playerJoined should be true', 1000);

		runs(function() {
			expect(playerJoined).toBe(true);
			expect(allPlayersJoined).toBe(false);
		});

		game.addPlayer("sam");
	});

	it("should emit a 'all players joined' when all expected players have joined", function() {
		waitsFor(function() {
			return playerJoined;
		}, 'playerJoined should be true', 1000);

		runs(function() {
			expect(playerJoined).toBe(true);
			expect(allPlayersJoined).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
	});

	it("should emit a player object with a 'getUsername' method on a player join", function() {
		waitsFor(function() {
			return player !== undefined;
		}, 'player should not be undefined', 1000);

		runs(function() {
			expect(playerJoined).toBe(true);
			expect(player.getUsername()).toBe("sam");
		});

		game.addPlayer("sam");
	});
});

describe("Asteroids player leave", function() {

	var id = 0;
	var expectedPlayers;
	var game;

	var playerLeft;


	var playerLeaveEvent = function() {
		playerLeft = true;
	};

	beforeEach(function() {
		expectedPlayers = ["sam", "joel"];
		game = new AsteroidsGame(id, expectedPlayers);
		playerLeft = false;

		game.on('player leave', playerLeaveEvent);
	});

	it("should emit a 'player leave' event when a player leaves", function() {
		waitsFor(function() {
			return playerLeft;
		}, 'playerLeft should be true', 1000);

		runs(function() {
			expect(playerLeft).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.removePlayer("joel");
	});
});

describe("Asteroids game start with one player", function() {


	var id = 0;
	var expectedPlayers;
	var game;

	var gameStart;
	var turnStart;


	var gameStartEvent = function() {
		gameStart = true;
	};

	var turnStartEvent = function() {
		turnStart = true;
	};

	var gameEndEvent = function() {
		gameEnd = true;
	}

	beforeEach(function() {
		expectedPlayers = ["sam"];
		game = new AsteroidsGame(id, expectedPlayers);
		gameStart = false;
		turnStart = false;
		gameEnd = false;

		game.on('game start', gameStartEvent);
		game.on('turn start', turnStartEvent);
		game.on('game end', gameEndEvent);
	});

	it("should not start a turn if only one player joins", function() {
		waitsFor(function() {
			return gameStart;
		}, 'game should have started', 1000);

		runs(function() {
			expect(gameStart).toBe(true);
			expect(turnStart).toBe(false);
		});

		game.addPlayer("sam");
	});

	it("should end the game if only one player starts a game", function() {
		waitsFor(function() {
			return gameStart;
		}, 'game should have started', 1000);

		runs(function() {
			expect(gameStart).toBe(true);
			expect(turnStart).toBe(false);
			expect(gameEnd).toBe(true);
		});

		game.addPlayer("sam");
	});
});

describe("Asteroids game start with multiple players", function() {

	var id = 0;
	var expectedPlayers;
	var game;

	var gameStart;
	var turnStart;
	var gameEnd;
	var gameSettings;

	var gameStartEvent = function(settings) {
		gameStart = true;
		gameSettings = settings;
	};

	var turnStartEvent = function() {
		turnStart = true;
	};

	var gameEndEvent = function() {
		gameEnd = true;
	}

	beforeEach(function() {
		expectedPlayers = ["sam", "joel", "jake"];
		game = new AsteroidsGame(id, expectedPlayers);
		gameStart = false;
		turnStart = false;
		gameEnd = false;
		gameSettings = undefined;

		game.on('game start', gameStartEvent);
		game.on('turn start', turnStartEvent);
		game.on('game end', gameEndEvent);
	});

	it("should start a game once all players have joined", function() {
		waitsFor(function() {
			return gameStart;
		}, 'the game to have started', 1000);

		runs(function() {
			expect(gameStart).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");
	});

	it("should start a turn once all players have joined", function() {
		waitsFor(function() {
			return gameStart;
		}, 'the game should have started', 1000);

		runs(function() {
			expect(gameStart).toBe(true);
			expect(turnStart).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");
	});

	it("should provide the game settings with the game start event", function() {
		waitsFor(function() {
			return gameStart;
		}, 'the game should have started', 1000);

		runs(function() {
			expect(gameStart).toBe(true);
			expect(gameSettings).toNotBe(undefined);
			expect(gameSettings.world.worldHeight).toBe(10000); //Default world size as we didn't pass any options
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");
	});
});

describe("Adding game turns", function() {

	var id = 0;
	var expectedPlayers;
	var game;

	var gameStart;
	var turnStart;
	var gameEnd;

	var gameStartEvent = function(settings) {
		gameStart = true;
	};

	var turnStartEvent = function() {
		turnStart = true;
	};

	var gameEndEvent = function() {
		gameEnd = true;
	}

	beforeEach(function() {
		expectedPlayers = ["sam", "joel", "jake"];
		game = new AsteroidsGame(id, expectedPlayers);
		gameStart = false;
		turnStart = false;
		gameEnd = false;

		game.on('game start', gameStartEvent);
		game.on('turn start', turnStartEvent);
		game.on('game end', gameEndEvent);
	});

	it("should allow a player to submit a turn after the turn has started", function() {
		waitsFor(function() {
			return turnStart;
		}, 'the turn should have started', 1000);

		runs(function() {
			var turnSubmission = game.addTurn("joel", { turndata: 'here'} );
			expect(turnSubmission).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");
	});

	it("should not allow a player not in the game to submit a turn", function() {
		waitsFor(function() {
			return turnStart;
		}, 'the turn should have started', 1000);

		runs(function() {
			var turnSubmission = game.addTurn("jenny", { turndata: 'here'} );
			expect(turnSubmission).toBe(false);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");
	});

	it("should not allow a player to submit a second turn before the next turn has started", function() {
		waitsFor(function() {
			return turnStart;
		}, 'the turn should have started', 1000);

		runs(function() {
			//First turn submission
			var turnSubmission = game.addTurn("joel", { turndata: 'here'} );
			expect(turnSubmission).toBe(true);

			//Second turn submission
			turnSubmission = game.addTurn("joel", { turndata: 'here'} );
			expect(turnSubmission).toBe(false);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");	
	});

	it("should allow all players to submit a turn", function() {
		waitsFor(function() {
			return turnStart;
		}, 'the turn should have started', 1000);

		runs(function() {
			//First turn submission
			var turnSubmission = game.addTurn("joel", {});
			expect(turnSubmission).toBe(true);

			//Second turn submission
			turnSubmission = game.addTurn("sam", {});
			expect(turnSubmission).toBe(true);

			//Thidrd turn submission
			turnSubmission = game.addTurn("jake", {});
			expect(turnSubmission).toBe(true);
		});

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");	
	});

});

describe("Getting turn results", function() {
	var id = 0;
	var expectedPlayers;
	var game;

	var gameStart;
	var turnStart;
	var gameEnd;
	var turnResult;

	var gameStartEvent = function(settings) {
		gameStart = true;
	};

	var turnStartEvent = function() {
		turnStart = true;
	};

	var gameEndEvent = function() {
		gameEnd = true;
	};

	var turnResultEvent = function() {
		turnResult = true;
		turnStart = false;
	};

	beforeEach(function() {
		expectedPlayers = ["sam", "joel", "jake"];
		game = new AsteroidsGame(id, expectedPlayers);
		gameStart = false;
		turnStart = false;
		gameEnd = false;

		game.on('game start', gameStartEvent);
		game.on('turn start', turnStartEvent);
		game.on('game end', gameEndEvent);
		game.on('turn result', turnResultEvent);

		game.addPlayer("sam");
		game.addPlayer("joel");
		game.addPlayer("jake");	

		game.addTurn("joel", {});
		game.addTurn("sam", {});
		game.addTurn("jake", {});
	});

	it("should calculate the turn result after all turns have been submitted", function() {
		waitsFor(function() {
			return turnResult;
		}, 'the turn result should have been fired', 1000);

		runs(function() {
			expect(turnResult).toBe(true);
		});
		
		game.checkTurnEnd();
	});

	it("should start the next turn after a turn result has been calculated and end conditions have not been met", function() {
		waitsFor(function() {
			return turnStart;
		}, 'the turn start should have been fired for the next turn', 1000);

		runs(function() {
			expect(game.currentTurn).toBe(2);
		});
		game.checkTurnEnd();
	});

	it("should increment the turn counter again for the next turn", function() {
		game.checkTurnEnd();
		game.addTurn("joel", {});
		game.addTurn("sam", {});
		game.addTurn("jake", {});
		game.checkTurnEnd();
		expect(game.currentTurn).toBe(3);
	});
});
