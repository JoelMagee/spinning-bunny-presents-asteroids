/*jslint white: true */

var redis;

var Login = function(sessionManager, User) {
	this.sessionManager = sessionManager;
	this.User = User;

	var loginSub = redis.createClient();
	var loginSessionPub = redis.createClient();
	var loginUsernamePub = redis.createClient();
	var logoutPub = redis.createClient();

	loginSub.on('pmessage', function(channelPattern, actualChannel, message) {

		var response = {};
		response.channel = 'login';
		response.sessionID = sessionID;
		response.data = {};

		try {
			var messageObj = JSON.parse(message);
			var sessionID = messageObj.sessionID;

			var username = messageObj.message.username;
			var password = messageObj.message.password;

			User.find({ username: username }, function(err, users) {
				if (err) {
					response.data.message = "Error when attempting to log in";
					response.data.success = false;
					loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
				} else if (users.length === 0) {
					response.data.message = "Invalid username";
					response.data.success = false;
					loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
				} else {
					//Assume we only got 1 user as username is unique
					users[0].comparePassword(password, function(err, match) {
						if (err) {
							response.data.success = false;
							response.data.message = "Error validating password";
							loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
						} else if (match) {
							sessionManager.login(sessionID, username);
							response.data.success = true;
							response.data.message = "Successfully logged in";

							loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));

							var newMessageObj = {};
							newMessageObj.message = {};
							newMessageObj.message.content = username + " has just logged in";
							newMessageObj.message.username = "Server";
							loginSessionPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));

							// Horrible horrible code from here out

							loginUsernamePub.publish('login:' + username, "{'o':'o'}");

							var logoutListener = redis.createClient();

							logoutListener.on('message', function() {
								logoutPub.publish('logout:' + sessionID, JSON.stringify({'sessionID': sessionID}));
								logoutListener.unsubscribe('login:' + username);
								logoutListener.quit();
							});

							logoutListener.subscribe('login:' + username);
						} else{
							response.data.success = false;
							response.data.message = "Invalid password";
							loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
						}
					});
				}
			});
		} catch (e) {
			response.data.success = false;
			response.data.message = "Unknown exception when attempting to log in";
			loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
		}

	});

	loginSub.psubscribe('login:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return Login;
};