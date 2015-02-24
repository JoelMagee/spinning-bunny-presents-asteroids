/*jslint white: true */

var SessionManager = require('../src/session/session-manager')();

describe("session creation", function() {
	var sessionManager = new SessionManager();

	var sessionID = 100;
	var anotherSessionID = 200;

	it("should create a new session with a new ID", function() {
		var creationSuccessful = sessionManager._createSession(sessionID);

		expect(creationSuccessful).toNotBe(false);
		expect(creationSuccessful).toBe(100);
	});
	
	it("should not allow creation of a new session with the same ID", function() {
		var creationSuccessful = sessionManager._createSession(sessionID);

		expect(creationSuccessful).toBe(false);
	});


	it("should create a new session with a different session ID", function() {
		var creationSuccessful = sessionManager._createSession(anotherSessionID);

		expect(creationSuccessful).toBe(200);
	});

	it("should create a new session with a randomly generated ID and not fail", function() {
		var sessionID = sessionManager.createSession();
		var anotherSessionID = sessionManager.createSession();

		expect(sessionID).toNotBe(false);
		expect(anotherSessionID).toNotBe(false);
		expect(sessionID).toNotBe(anotherSessionID);
	});
});

describe("session exists", function() {
	var sessionManager = new SessionManager();

	it("should setup a new session and validate that it exists", function() {
		var sessionID = sessionManager.createSession();

		expect(sessionID).toNotBe(false);

		var sessionExists = sessionManager._sessionExists(sessionID);

		expect(sessionExists).toBe(true);
	});
});

describe("session setting properties", function() {
	var sessionManager = new SessionManager();

	var sessionID = 1;
	var property = "my name";
	var val = "Sam";

	it("should create a new session with a new ID", function() {
		var createdSessionID = sessionManager._createSession(sessionID);
		expect(createdSessionID).toBe(1);
	});

	it("should set a property on the session object", function() {
		var setValSuccessful = sessionManager._setSessionProperty(sessionID, property, val);

		expect(setValSuccessful).toBe(true);
	});

	it("should be able to retrieve the set value from the stored session", function() {
		var sessionValue = sessionManager._getSessionProperty(sessionID, property);

		expect(sessionValue).toBe("Sam");
	});
});

describe("unsetting session properties", function() {

	var sessionManager = new SessionManager();

	var sessionID = 1;
	var property = "my name";
	var val = "Sam";

	var createdSessionID = sessionManager._createSession(sessionID);

	it("should set the session property", function() {
		var setSuccessful = sessionManager._setSessionProperty(sessionID, property, val);

		expect(setSuccessful).toBe(true);

		var getValue = sessionManager._getSessionProperty(sessionID, property);

		expect(getValue).toBe("Sam");

		var anotherGetValue = sessionManager.getSessionProperty(sessionID, property);

		expect(anotherGetValue).toBe("Sam");
	});

	it("should unset the session property", function() {
		var unsetSuccessful = sessionManager._deleteSessionProperty(sessionID, property);

		expect(unsetSuccessful).toBe(true);

		var getValue = sessionManager.getSessionProperty(sessionID, property);

		expect(getValue).toBe(null);
	});

});

describe("session logging in properties", function() {
	var sessionManager = new SessionManager();

	var sessionID = sessionManager.createSession();
	var username = "samsam";


	it("should log a user in by storing their username in the session", function() {
		
		var alreadyLoggedIn = sessionManager.loggedIn(sessionID);

		expect(alreadyLoggedIn).toBe(false);

		sessionManager.loginUser(sessionID, username);

		var nowLoggedIn = sessionManager.loggedIn(sessionID);

		expect(nowLoggedIn).toBe(true);

		var fetchedUsername = sessionManager.getLoggedInUser(sessionID);

		expect(fetchedUsername).toNotBe(false);
		expect(fetchedUsername).toBe("samsam");
	});
});

describe("session logging out", function() {

	var sessionManager = new SessionManager();

	var sessionID = sessionManager.createSession();
	var username = "samsam";
	var property = "testing";
	var value = "is cool";

	sessionManager.loginUser(sessionID, username);

	it("should have the user now logged in and store some extra properties", function() {
		var nowLoggedIn = sessionManager.loggedIn(sessionID);

		expect(nowLoggedIn).toBe(true);

		sessionManager.setSessionProperty(sessionID, property, value);

		var fetchedValue = sessionManager.getSessionProperty(sessionID, property);

		expect(fetchedValue).toBe("is cool");
	});

	it("should log out the user and clear all stored session information", function() {
		sessionManager.logoutUser(sessionID);

		var nowLoggedIn = sessionManager.loggedIn(sessionID);

		expect(nowLoggedIn).toBe(false);

		var fetchedValue = sessionManager.getSessionProperty(sessionID, property);

		expect(fetchedValue).toBe(null);
	});
});
