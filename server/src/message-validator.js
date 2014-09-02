/*jslint white: true node: true */

var sessionFunction = function(sessionID) {
	return sessionID !== undefined;
};

var loginFunction = function(sessionID) {
	return this.sessionManager.loggedIn(sessionID)
};


var hasProperty = function(property) {
	return function(sessionID, message) {
		return this.message.hasOwnProperty(property);
	};
}

var MessageValidator = function(sessionManager, next, err) {
	this.sessionManager = sessionManager;
	this.requirements = [];

	this.internalChannel = internalChannel;
	this.responseChannel = responseChannel;

	this.next = next;
	this.err = err;
};

MessageValidator.prototype.hasSession = function() {
	this.requirements.push(sessionFunction);

	return this;
}

MessageValidator.prototype.loggedIn = function() {
	this.requirements.push(loginFunction);

	return this;
};

MessageValidator.prototype.prepare = function() {
	return function(sessionID, message) {

		var valid = true;

		requirements.forEach(function(e) {
			valid = valid && e(sessionID, message);
		});

		if (valid) {
			return this.next(sessionID, message);
		} 

		return this.err(sessionID, message);
	};
};

MessageValidator.prototype.hasProperty = function(property) {
	var self = this;

	if (property instanceof Array) {
		property.forEach(function(e) {
			self.requirements.push(hasProperty(e));
		});
	} else {
		self.requirements.push(hasProperty(property));
	}

	return this;
};

module.exports = function() {
	return {
		create = function(sessionID, sessionManager) {
			return new MessageValidator(sessionID, sessionManager);
		}
	}
}