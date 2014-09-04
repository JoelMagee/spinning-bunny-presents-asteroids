/*jslint white: true node: true */

var MessageValidator = function() {
	this.requirements = [];
	this.requirementsChain = [];
};

MessageValidator.prototype.addRequirement = function(reqFn) {
	this.requirements.push(function(next) {
		return function(sessionID, message) {
			return reqFn(sessionID, message, next(sessionID, message));
		};
	});
};

var validatorMiddleware = function(onSucc, onFail, onErr) {
	return function(message, sessionID) {
		return function(err, valid) {
			if (err) {
				onErr(err, message, sessionID);
				return;
			}

			if (valid !== true) {
				onFail(message, sessionID);
				return;
			}

			onSucc(message, sessionID);
			return;
		};
	};
};

MessageValidator.prototype.prepare = function(onSucc, onFail, onErr) {
	this.requirementsChain.push(function(message, sessionID) {
		onSucc(message, sessionID);
	});

	for (var i = this.requirements.length - 1; i >= 0; i--) {
		var req = this.requirements[i];

		this.requirementsChain.unshift(
			req(validatorMiddleware(this.requirementsChain[0],  onFail, onErr))
		);
	}
};

MessageValidator.prototype.validateMessage = function(sessionID, message) {
	if (this.requirementsChain.length === 0) {
		return console.error("Message validator hasn't been prepared, doesn't know what to do");
	}

	this.requirementsChain[0](sessionID, message);
};

module.exports = function() {
	return MessageValidator;
};
// mv.addRequirement(function(message, sessionID, next) {
// 	next(null, true);
// });

// MessageValidator.prototype.messageHasProperty = function(property) {
// 	this.requirements.push(function(next) {
// 		return function(sessionID, message) {
// 			if (message.hasOwnProperty(property)) {
// 				next(sessionID, message)(null, true);
// 			}
// 		};
// 	});
// };

// MessageValidator.prototype.loggedIn = function() {
// 	var self = this;
// 	this.requirements.push(
// 		function(next) {
// 			return function(sessionID, message) {
// 				self.sessionManager.hasProperty(sessionID, 'username', next(sessionID, message));
// 			};
// 		}
// 	);
// 	return this;
// };

// MessageValidator.prototype.sessionHasProperty = function(property) {
// 	this.requirements.push(
// 		function(next) {
// 			return function(sessionID, message) {
// 				self.sessionManager.hasProperty(sessionID, property, next(sessionID, message));
// 			};
// 		};
// 	);
// 	return this;
// };

// MessageValidator.prototype.sessionPropertyEquals = function(property, value) {
// 	this.requirements.push(
// 		function(next) {
// 			return function(sessionID, message) {
// 				self.sessionManager.getProperty(sessionID, prosperty, function(err, val) {
// 					if (err) {
// 						return next(sessionID, message)(err);
// 					};

// 					next(sessionID, message)(null, value === val);
// 				});
// 			};
// 		};
// 	);
// 	return this;
// };


// MessageValidator.prototype.hasSession = function() {
// 	this.requirements.push(
// 		function(next) {
// 			return function(sessionID, message) {
// 				next(null, sessionID !== undefined);
// 			};
// 		};
// 	);
// 	return this;
// };

// MessageValidator.prototype._end = function() {
// 	return function(sessionID, message) {
// 		next(sessionID, message)
// 	};
// };
