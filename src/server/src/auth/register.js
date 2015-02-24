/*jslint white: true */

var redis;

var Register = function(_User) {
	var User = _User;

	var registrationSub = redis.createClient();
	var registrationPub = redis.createClient();

	registrationSub.on('pmessage', function(channelPattern, actualChannel, requestString) {
		try {
			var request = JSON.parse(requestString);

			var sessionID = request.sessionID;
			var username = request.message.username;
			var password = request.message.password;

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
					response.data.message = "Error registering user, this username may have already been taken";
				} else {
					response.data.success = true;
					response.data.message = "Successfully registered user";
				}

				registrationPub.publish('output message:' + sessionID, JSON.stringify(response));
			});	
		} catch (e) {
			registrationPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'register', data: { success: false, message: "Unknown error upon registration attempt, please try again!"}}));
		}

	});

	registrationSub.psubscribe('register:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return Register;
};