/*jslint white: true */

var redis;

var Register = function(_User) {
	var User = _User;

	var registrationSub = redis.createClient();
	var registrationPub = redis.createClient();

	registrationSub.on('pmessage', function(channelPattern, actualChannel, message) {
		console.log("Registration request from queue");

		var messageObj = JSON.parse(message);

		var sessionID = messageObj.sessionID;
		var username = messageObj.data.username;
		var password = messageObj.data.password;

		var user = new User({
			username: username,
			password: password
		});

		var response = {};
		response.channel = 'register';
		response.data = {};

		user.save(function(err) {
			if (err) {
				response.data.success = false;
				response.data.message = "Error registering user: " + err;
			} else {
				response.data.success = true;
				response.data.message = "Successfully registered user";
			}

			registrationPub.publish('output message:' + sessionID, JSON.stringify(response));
		});
	});

	registrationSub.psubscribe('register:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return Register;
};