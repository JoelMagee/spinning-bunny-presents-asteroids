/*jslint white: true */

var Lobby = require('../src/lobby/lobby')();

describe("lobby creation", function() {

	var name = "A lobby";
	var id = 10;

	var lobby;

	beforeEach(function() {
		lobby = new Lobby(id, name);
	});

	it("should create a lobby with the correct name", function() {
		expect(lobby.name).toBe("A lobby");
	});

	it("should create a lobby with the correct id", function() {
		expect(lobby.id).toBe(10);
	})
});

describe("lobby users joining", function() {

	var name = "A lobby";
	var id = 10;

	var lobby;

	var user1 = "sam";
	var user2 = "joel";

	beforeEach(function() {
		lobby = new Lobby(id, name);
	});

	it("should allow a user to join", function() {
		lobby.join(user1);

		expect(lobby.getUsers().length).toBe(1);

		expect(lobby.getUsers()[0]).toBe("sam");
	});

	it("should allow multiple players to join", function() {
		lobby.join(user1);
		lobby.join(user2);

		expect(lobby.getUsers().length).toBe(2);
		expect(lobby.getUsers().indexOf("sam")).toNotBe(-1);
		expect(lobby.getUsers().indexOf("joel")).toNotBe(-1);
	});

	it("should emit a user join event when a player joins a lobby", function() {

	});
});


describe("lobby user joins async", function() {


	var name = "A lobby";
	var id = 10;

	var lobby;

	var user1 = "sam";
	var user2 = "joel";

	var flag = false;
	var username;

	var userJoined = function(_username) {
		flag = true;
		username = _username;
	};

	beforeEach(function() {
		lobby = new Lobby(id, name);
		lobby.on('user join', userJoined);
	});

	it("should fire a user join event", function() {
		
		waitsFor(function() {
			lobby.join(user1);
			return flag;
		}, "the user join function should have been called", 500);

		runs(function() {
			expect(flag).toEqual(true);
			expect(username).toEqual("sam");
		});

		flag = false;

		waitsFor(function() {
			lobby.join(user2);
			return flag;
		}, "the user join function should have been called", 500);

		runs(function() {
			expect(flag).toEqual(true);
			expect(username).toEqual("joel");
		});
	});
});

describe("users leaving lobby", function() {
	var name = "A lobby";
	var id = 10;

	var lobby;

	var user1 = "sam";
	var user2 = "joel";

	var username;

	var userLeft = function(_username) {
		flag = true;
		username = _username;
	};

	beforeEach(function() {
		lobby = new Lobby(id, name);
		lobby.join(user1);
		lobby.join(user2);
		lobby.on('user leave', userLeft);
	});

	it("should let a user leave and remove them", function() {
		expect(lobby.getUsers().length).toBe(2);

		lobby.leave(user1);

		expect(lobby.getUsers().length).toBe(1);

		lobby.leave(user2);

		expect(lobby.getUsers().length).toBe(0);
	});

	it("should fire a user leave event", function() {
		
		waitsFor(function() {
			lobby.leave(user1);
			return flag;
		}, "the user leave function should have been called", 500);

		runs(function() {
			expect(flag).toEqual(true);
			expect(username).toEqual("sam");
		});

		flag = false;

		waitsFor(function() {
			lobby.leave(user2);
			return flag;
		}, "the user join function should have been called", 500);

		runs(function() {
			expect(flag).toEqual(true);
			expect(username).toEqual("joel");
		});
	});
});

describe("lobby information", function() {
	var name = "A lobby";
	var id = 10;

	var lobby;

	var user1 = "sam";
	var user2 = "joel";

	beforeEach(function() {
		lobby = new Lobby(id, name);
		lobby.join(user1);
		lobby.join(user2);
	});

	it("should return an object with id, name and users properties", function() {
		var lobbyInfo = lobby.info();

		expect(lobbyInfo.id).toBe(10);
		expect(lobbyInfo.name).toBe("A lobby");
		expect(lobbyInfo.usernames.length).toBe(2);
	});
});