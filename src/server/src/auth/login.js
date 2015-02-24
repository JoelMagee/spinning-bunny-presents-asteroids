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

							loginUsernamePub.publish('internal:login:username:' + username, JSON.stringify({ sessionID: sessionID, username: username }));

							// Horrible horrible code from here out
							var logoutListener = redis.createClient();

							logoutListener.on('message', function(channelPattern, message) {
								console.log("Logout listener triggered");

								var messageObj = JSON.parse(message);

								if (messageObj.sessionID !== sessionID) {
									logoutPub.publish('logout:' + sessionID, JSON.stringify({ sessionID: sessionID }));
									removeListeners();
								}
							});

							logoutListener.subscribe('internal:login:username:' + username);

							var disconnectListener = redis.createClient();

							disconnectListener.on('message', function() {
								logoutPub.publish('internal:logout:username:' + sessionID, JSON.stringify({ sessionID: sessionID, username: username }));
								removeListeners();
							});

							disconnectListener.subscribe('disconnect:' + sessionID);
							disconnectListener.subscribe('internal:logout:' + sessionID);

							var removeListeners = function() {
								console.log("Logout listener quit");
								disconnectListener.unsubscribe('disconnect:' + sessionID);
								disconnectListener.unsubscribe('internal:logout:' + sessionID);
								disconnectListener.quit();
								logoutListener.unsubscribe('login:' + username);
								logoutListener.quit();
							}
						} else{
							response.data.success = false;
							response.data.message = "Invalid password";
							loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
						}
					});
				}
			});
		} catch (e) {
			console.log("Login error");
			throw e;
			response.data.success = false;
			response.data.message = "Unknown exception when attempting to log in: " + e.message;
			loginSessionPub.publish('output message:' + sessionID, JSON.stringify(response));
		}

	});

	loginSub.psubscribe('login:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return Login;
};