/*jslint white: true node: true */

var events = require('events');
var util = require("util");

var MessageValidator = function() {
	this.requirements = [];
	this.requirementsChain = [];

	events.EventEmitter.call(this);
};

util.inherits(MessageValidator, events.EventEmitter);

MessageValidator.prototype.requirement = function(reqFn) {
	this.requirements.push(function(next) {
		return function(request) {
			return reqFn(request, next(request));
		};
	});

	return this;
};

var validatorMiddleware = function(onSucc, onFail, onErr) {
	return function(request) {
		return function(err, valid) {
			if (err) {
				onErr(err, request);
				return;
			}

			if (!valid) {
				onFail(request);
				return;
			}

			onSucc(request);
			return;
		};
	};
};

MessageValidator.prototype.prepare = function() {
	var self = this;
	this.requirementsChain = [];

	var onSuccess = function(request) {
		self.emit('success', request);
	}

	var onFail = function(request) {
		self.emit('fail', request);
	};

	var onError = function(err, request) {
		self.emit('error', err, request);
	};

	this.requirementsChain.push(onSuccess);

	for (var i = this.requirements.length - 1; i >= 0; i--) {
		var req = this.requirements[i];

		this.requirementsChain.unshift(
			req(validatorMiddleware(this.requirementsChain[0],  onFail, onError))
		);
	}
};

MessageValidator.prototype.validate = function(request) {
	if (this.requirementsChain.length === 0) {
		this.prepare();
	}

	this.requirementsChain[0](request);
};

module.exports = function() {
	return MessageValidator;
};
