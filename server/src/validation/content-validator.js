/*jslint white: true node: true*/

var MessageValidator = function() { };

MessageValidator.prototype.hasProperty = function(property) {
	if (property instanceof Array) {
		return function(request, next) {
			for (var i = 0; i < property.length; i++) {
				if (!request.message.hasOwnProperty(property[i])) {
					request.failMessage = "Expected message to have property: " + property[i] + " but it doesn't";
					return next(null, false);
				}
			}

			return next(null, true);
		}
	}

	return function(request, next) {
		if (!request.message.hasOwnProperty(property)) {
			request.failMessage = "Expected message to have property: " + property + " but it doesn't";
			return next(null, false);
		}
		next(null, true)
	}
};


module.exports = function() {
	return MessageValidator;
};