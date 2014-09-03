/*jslint white: true node: true */

var redis = require('redis');
var SessionStorage = require('../src/session-storage')(redis);

describe("session creation", function() {

	var sessionStorage;

	beforeEach(function() {
		//Clear current db
		var client = redis.createClient();
		client.FLUSHDB();
		client.quit();

		sessionStorage = new SessionStorage();
		sessionStorage.connect();
	});

	afterEach(function() {
		sessionStorage.disconnect();
	});

	it("should create a new session with the correct sessionID", function() {
		var sessionID = 1;

		var flag = false;
		var sessionExists = false;
		var sessionError = false;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(sessionExists).toBe(true);
			expect(sessionError).toBe(false);
		});

		sessionStorage.create(sessionID);

		sessionStorage.exists(sessionID, function(err, exists) {
			if (err) {
				sessionError = true;
			} else {
				sessionExists = exists;
			}

			flag = true;
		});
	});


	it("should not think an uninitialised session already exists", function() {
		var sessionID = 1;

		var flag = false;
		var sessionExists = undefined;
		var sessionError = false;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(sessionExists).toBe(false);
			expect(sessionError).toBe(false);
		});

		sessionStorage.exists(sessionID, function(err, exists) {
			if (err) {
				sessionError = true;
			} else {
				sessionExists = exists;
			}

			flag = true;
		});
	});

});

describe("setting session properties", function() {
	var sessionStorage;

	beforeEach(function() {
		//Clear current db
		var client = redis.createClient();
		client.FLUSHDB();
		client.quit();

		sessionStorage = new SessionStorage();
		sessionStorage.connect();
	});

	afterEach(function() {
		sessionStorage.disconnect();
	});

	it("should retreive a set session property", function() {

		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedProperty = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedProperty).toBe("sam");
		});

		sessionStorage.create(sessionID);
		sessionStorage.setProperty(sessionID, 'username', 'sam');

		sessionStorage.getProperty(sessionID, 'username', function(err, value) {
			retreievedErr = err;
			retreievedProperty = value;
			flag = true;
		});

	});

	it("should not retreive an unset session property on a set session", function() {

		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedProperty = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedProperty).toBe(null);
		});

		sessionStorage.create(sessionID);

		sessionStorage.getProperty(sessionID, 'username', function(err, value) {
			retreievedErr = err;
			retreievedProperty = value;
			flag = true;
		});
	});

	it("should not retreive an unset session property on an unset session", function() {

		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedProperty = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedProperty).toBe(null);
		});

		sessionStorage.getProperty(sessionID, 'username', function(err, value) {
			retreievedErr = err;
			retreievedProperty = value;
			flag = true;
		});
	});

	it("should tell me a set property exists", function() {
		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedExists = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedExists).toBe(true);
		});

		sessionStorage.create(sessionID);
		sessionStorage.setProperty(sessionID, 'username', 'sam');

		sessionStorage.propertyExists(sessionID, 'username', function(err, exists) {
			retreievedErr = err;
			retreievedExists = exists;
			flag = true;
		});
	});


	it("should tell me an unset property doesnt exist", function() {
		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedExists = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedExists).toBe(true);
		});

		sessionStorage.create(sessionID);

		sessionStorage.propertyExists(sessionID, 'username', function(err, exists) {
			retreievedErr = err;
			retreievedExists = exists;
			flag = true;
		});
	});


	it("should tell me an unset session doesn't have a property", function() {
		var sessionID = 1;
		var flag = false;

		var retreievedErr = undefined;
		var retreievedExists = undefined;

		waitsFor(function() {
			return flag;
		});

		runs(function() {
			expect(retreievedErr).toBe(null);
			expect(retreievedExists).toBe(true);
		});

		sessionStorage.propertyExists(sessionID, 'username', function(err, exists) {
			retreievedErr = err;
			retreievedExists = exists;
			flag = true;
		});
	});
});