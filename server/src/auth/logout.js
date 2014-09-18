/*jslint white: true */

var redis;

var Logout = function(sessionManager) {
	this.sessionManager = sessionManager;

	var logoutSub = redis.createClient();
	var logoutPub = redis.createClient();

	logoutSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var response = {};
		response.channel = 'logout';
		response.sessionID = sessionID;
		response.data = {};

		try {
			var messageObj = JSON.parse(message);
			var sessionID = messageObj.sessionID;

			sessionManager.logout(sessionID);

			response.data.success = true;
			response.data.message = "Successfully logged out";
			logoutPub.publish('output message:' + sessionID, JSON.stringify(response));

			logoutPub.publish('internal:logout:' + sessionID, JSON.stringify({o:o}));
		} catch (e) {
			response.data.success = false;
			response.data.message = "Unknown exception when trying to log out";
			logoutPub.publish('output message:' + sessionID, JSON.stringify(response));
		}

	});

	logoutSub.psubscribe('logout:*');
};



module.exports = function(_redis) {
	redis = _redis;

	return Logout;
};