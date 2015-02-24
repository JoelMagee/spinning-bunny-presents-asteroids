/*jslint white: true node: true*/

var SessionValidator = function(sessionManager) {
	this.sessionManager = sessionManager;
};

SessionValidator.prototype.hasSession = function() {
	var self = this;
	return function(request, next) {
		if (typeof request.sessionID === "undefined") {
			request.failMessage = "No session";
			return next(null, false);
		} else  {
			self.sessionManager.exists(request.sessionID, function(err, exists) {
			if (err) { return next(err); }

			if (!exists) {
				request.failMessage = "No session"
				return next(null, false);
			}

			next(null, true);
		});
		}
	};
};

SessionValidator.prototype.hasProperty = function(property) {
	var self = this;
	return function(request, next) {
		self.sessionManager.hasProperty(request.sessionID, property, function(err, exists) {
			if (err) { return next(err); }

			if (!exists) {
				request.failMessage = "Session property expected doesn't exist"
				return next(null, false);
			}

			next(null, true);
		});
	};
};

SessionValidator.prototype.hasntProperty = function(property) {
	var self = this;
	return function(request, next) {
		self.sessionManager.hasProperty(request.sessionID, property, function(err, exists) {
			if (err) { return next(err); }

			if (exists) {
				request.failMessage = "Session property exists when shouldn't exist"
				return next(null, false);
			}

			next(null, true);
		});
	};
};

SessionValidator.prototype.hasValue = function(property, expectedValue) {
	var self = this;
	return function(request, message, next) {
		self.sessionManager.getProperty(request.sessionID, property, function(err, value) {
			if (err) {
				return next(err);
			}

			if (expectedValue !== value) {
				request.failMessage = "Session property exists when shouldn't exist"
				return next(null, false);
			}

			next(null, true);
		});
	};
};

module.exports = function() {
	return SessionValidator;
};