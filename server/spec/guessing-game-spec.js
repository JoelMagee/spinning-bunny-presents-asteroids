/*jslint white: true */

var GuessingGame = require('../src/game/guessing-game')();

describe("game initiation", function() {

	var id = 10;
	var usernames = ["sam", "joel"];

	var guessingGame = new GuessingGame(id, usernames);
	it("should initate a new game with the correct users", function() {
		expect(guessingGame.usernames.length).toBe(2);
	});
	
	it("should have the correct ID", function() {
		expect(guessingGame.id).toBe(10);
	});

	it("should have set the random number", function() {
		expect(guessingGame.randomNumber).toNotBe(0);
	});
	
});

describe("game turn", function() {
	var id = 10;
	var usernames = ["sam", "joel"];
	var guessingGame;

	beforeEach(function() {
		guessingGame = new GuessingGame(id, usernames);
	});

	it("should start a new turn", function() {
		
		guessingGame.startTurn();

		expect(guessingGame.currentTurn).toBe(1);
		expect(guessingGame.finished).toBe(false);
	});

});

describe("game end", function() {
	var id = 10;
	var usernames = ["sam", "joel"];
	var guessingGame;

	beforeEach(function() {
		guessingGame = new GuessingGame(id, usernames);
	});


	it("should finish a game after a single turn", function() {
		guessingGame.startTurn();
		guessingGame.processTurnResult();

		expect(guessingGame.currentTurn).toBe(1);
		expect(guessingGame.finished).toBe(true);
		expect(guessingGame.result.winner).toBe(undefined);
	});

	it("should not have a winner if nobody submits a turn", function() {
		guessingGame.startTurn();
		guessingGame.processTurnResult();

		expect(guessingGame.winner).toBe(undefined);
	});

	it("should have a single winner if a single person submits a turn", function() {
		guessingGame.startTurn();
		guessingGame.addTurn("joel", {guess: 3});
		guessingGame.processTurnResult();

		expect(guessingGame.result.winner).toNotBe(undefined);

		expect(guessingGame.result.winner.username).toBe("joel");
	});

	it("should pick the winner closest to the randomValue", function() {
		guessingGame.randomNumber = 8;
		guessingGame.startTurn();
		guessingGame.addTurn("joel", {guess: 3});
		guessingGame.addTurn("sam", {guess: 5});
		guessingGame.processTurnResult();

		expect(guessingGame.result.winner).toNotBe(undefined);

		expect(guessingGame.result.winner.username).toBe("sam");
	});
});