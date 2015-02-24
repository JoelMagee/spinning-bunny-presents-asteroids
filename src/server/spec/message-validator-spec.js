/*jslint white: true */

var MessageValidator = require('../src/validation/message-validator')();

describe("basic validation", function() {

	var onSuccessCalled = false;
	var onErrorCalled = false;
	var onFailCalled = false;
	var flag = false;

	var onSuccess = function() {
		onSuccessCalled = true;
		flag = true;
	};

	var onFail = function() {
		onFailCalled = true;
		flag = true;
	};

	var onError = function() {
		onErrorCalled = true;
		flag = true;
	};

	var messageHasProperty = function(property) {
		return function(sessionID, message, next) {
			next(null, message.hasOwnProperty(property));
		};
	};

	beforeEach(function() {
		onSuccessCalled = false;
		onErrorCalled = false;
		onFailCalled = false;
		flag = false;

		messageValidator = new MessageValidator();
	});

	it("should check the message has the property 'username' before continuing", function() {

		messageValidator.addRequirement(messageHasProperty('username'));
		messageValidator.prepare(onSuccess, onFail, onError);

		waitsFor(function() {
			return flag;
		}, 1000);

		runs(function() {
			expect(onSuccessCalled).toBe(true);
			expect(onErrorCalled).toBe(false);
			expect(onFailCalled).toBe(false);
		});

		console.log(messageValidator.__proto__);

		messageValidator.validate('sdhg', { username: 'sam' });

	});

	it("should check the message has the property 'frank' before continuing", function() {

		messageValidator.addRequirement(messageHasProperty('frank'));
		messageValidator.prepare(onSuccess, onFail, onError);

		waitsFor(function() {
			return flag;
		}, 1000);

		runs(function() {
			expect(onSuccessCalled).toBe(false);
			expect(onErrorCalled).toBe(false);
			expect(onFailCalled).toBe(true);
		});

		messageValidator.validate('sdhg', { username: 'sam' });

	});
});

describe("validation rule chaining", function() {

	var onSuccessCalled = false;
	var onErrorCalled = false;
	var onFailCalled = false;
	var flag = false;

	var onSuccess = function() {
		onSuccessCalled = true;
		flag = true;
	};

	var onFail = function() {
		onFailCalled = true;
		flag = true;
	};

	var onError = function() {
		onErrorCalled = true;
		flag = true;
	};

	var messageHasProperty = function(property) {
		return function(sessionID, message, next) {
			next(null, message.hasOwnProperty(property));
		};
	};

	beforeEach(function() {
		onSuccessCalled = false;
		onErrorCalled = false;
		onFailCalled = false;
		flag = false;

		messageValidator = new MessageValidator();
	});

	it("should pass when two correct checks are done", function() {
		messageValidator.addRequirement(messageHasProperty('username'));
		messageValidator.addRequirement(messageHasProperty('password'));
		messageValidator.prepare(onSuccess, onFail, onError);

		waitsFor(function() {
			return flag;
		}, 1000);

		runs(function() {
			expect(onSuccessCalled).toBe(true);
			expect(onErrorCalled).toBe(false);
			expect(onFailCalled).toBe(false);
		});

		messageValidator.validate('sdhg', { username: 'sam', password: '123' });
	});


	it("should fail when one correct and one incorrect checks are done", function() {
		messageValidator.addRequirement(messageHasProperty('username'));
		messageValidator.addRequirement(messageHasProperty('password'));
		messageValidator.prepare(onSuccess, onFail, onError);

		waitsFor(function() {
			return flag;
		}, 1000);

		runs(function() {
			expect(onSuccessCalled).toBe(false);
			expect(onErrorCalled).toBe(false);
			expect(onFailCalled).toBe(true);
		});

		messageValidator.validate('sdhg', { username: 'sam', passworsd: '123' });
	});


	it("should fail when two incorrect checks are done", function() {
		messageValidator.addRequirement(messageHasProperty('username'));
		messageValidator.addRequirement(messageHasProperty('password'));
		messageValidator.prepare(onSuccess, onFail, onError);

		waitsFor(function() {
			return flag;
		}, 1000);

		runs(function() {
			expect(onSuccessCalled).toBe(false);
			expect(onErrorCalled).toBe(false);
			expect(onFailCalled).toBe(true);
		});

		messageValidator.validate('sdhg', { usernamde: 'sam', passworsd: '123' });
	});
});