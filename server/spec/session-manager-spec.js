var SessionManager = require('../src/session-manager')();

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
	});
});