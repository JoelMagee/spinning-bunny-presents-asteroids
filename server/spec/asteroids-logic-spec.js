/*jslint white: true, node: true */

//Mock Logic class
var AsteroidsLogic = function(players, world) {};
AsteroidsLogic.prototype.processTurnResult = function(turnData) {};

var Player = require('../src/game/player')();
var World = require('../src/game/world')();

var AsteroidsLogic = require('../src/game/asteroids-logic')();

describe("Asteroids logic initialistation", function() {

	var playerOne;
	var playerTwo;
	var players;

	var world;

	var asteroidsLogic;

	beforeEach(function() {
		playerOne = new Player("sam");
		playerTwo = new Player("joel");
		players = [playerOne, playerTwo];

		world = new World({});

		asteroidsLogic = new AsteroidsLogic(players, world);
	});

	it("should give each player a position", function() {
		expect(playerOne.position.x).toBeDefined();
		expect(playerOne.position.x).toBeGreaterThan(-1);
		expect(playerOne.position.x).toBeLessThan(10001);
	});

	it("should have a get player position function which returns the starting position of all players", function() {
		var playerPositions = asteroidsLogic.getPlayerPositions();
		expect(playerPositions).toNotBe(undefined);
		expect(playerPositions["sam"]).toNotBe(undefined);
		expect(playerPositions["sam"].x).toNotBe(undefined);
		expect(playerPositions["sam"].y).toNotBe(undefined);
		expect(playerPositions["joel"]).toNotBe(undefined);
		expect(playerPositions["joel"].x).toNotBe(undefined);
		expect(playerPositions["joel"].y).toNotBe(undefined);
	});

});

describe("Asteroids turn calculations", function() {
	var playerOne;
	var playerTwo;
	var players;

	var world;

	var asteroidsLogic;

	var playerOneTurn = {
		destination: {
			x: 50,
			y: 80
		}
	}

	var playerTwoTurn = {
		destination: {
			x: 100,
			y: 900
		}
	}

	beforeEach(function() {
		playerOne = new Player("sam");
		playerTwo = new Player("joel");
		players = [playerOne, playerTwo];

		world = new World({});

		asteroidsLogic = new AsteroidsLogic(players, world);
	});

	it("should update the position for player one", function() {
		var turnData = {};
		turnData["sam"] = playerOneTurn;

		asteroidsLogic.processTurnResult(turnData);

		expect(playerOne.position.x).toBe(50);
		expect(playerOne.position.y).toBe(80);

		expect(playerTwo.position.x).toNotBe(100);
		expect(playerTwo.position.y).toNotBe(900);
	});

	it("should update the position for both players", function() {
		var turnData = {};
		turnData["sam"] = playerOneTurn;
		turnData["joel"] = playerTwoTurn;

		asteroidsLogic.processTurnResult(turnData);

		expect(playerOne.position.x).toBe(50);
		expect(playerOne.position.y).toBe(80);

		expect(playerTwo.position.x).toBe(100);
		expect(playerTwo.position.y).toBe(900);
	});

	it("should update the position for player 2", function() {
		var turnData = {};
		turnData["joel"] = playerTwoTurn;

		asteroidsLogic.processTurnResult(turnData);

		expect(playerOne.position.x).toNotBe(50);
		expect(playerOne.position.y).toNotBe(80);

		expect(playerTwo.position.x).toBe(100);
		expect(playerTwo.position.y).toBe(900);
	});

	it("should update the position for neither player", function() {
		var turnData = {};

		asteroidsLogic.processTurnResult(turnData);

		expect(playerOne.position.x).toNotBe(50);
		expect(playerOne.position.y).toNotBe(80);

		expect(playerTwo.position.x).toNotBe(100);
		expect(playerTwo.position.y).toNotBe(900);
	});
});