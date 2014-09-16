/*jslint white: true */

var redis;

var UserInfo = function(_User) {
	var User = _User;

	var userInfoSub = redis.createClient();
	var userCountSub = redis.createClient();

	var userPub = redis.createClient();

	userInfoSub.on('pmessage', function(channelPattern, actualChannel, requestString) {
		var request = JSON.parse(requestString);
		var sessionID = request.sessionID;

		try {
			if (request.message.hasOwnProperty('username')) {
				//Request for a single user
				
				User.findOne({username: request.message.username}, function(err, user) {
					if (err) {
						return userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', data: { success: false, message: "Unknown error getting user information, please try again!"}}));
					}

					if (user === null) {
						return userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', data: { success: false, message: "No such user" }} ));
					}

					userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', data: { success: true, message: "Successfully retrieved single user", user: user.getPublicData() }}));
				});
			} else {
				var lim = request.message.limit || 25;
				var pg = request.message.page || 1;
				var sort = request.message.sort || { username: 'asc' };

				User.find({}).limit(lim)
					.skip((pg - 1) * lim)
					.sort(sort)
					.exec(function(err, users) {
						if (err) {
							return userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', data: { success: false, message: "Unknown error getting user information, please try again!"}}));
						}

						userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', 
							data: { 
								success: true,
								message: "Successfully retrieved single user",
								users: users.map( function(user) { return user.getPublicData(); } )
						 	}
						}));
					});
			}
		} catch (e) {
			console.error(e);
			userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', data: { success: false, message: "Unknown error getting user information, please try again!"}}));
		}

	});

	userInfoSub.psubscribe('user info:*');

	userCountSub.on('pmessage', function(channelPattern, actualChannel, requestString) {
		var request = JSON.parse(requestString);
		var sessionID = request.sessionID;

		try {
			User.count({}, function(err, count) {
				if (err) {
					return  userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user count', data: { success: false, message: "Unknown error getting user information, please try again!"}}));
				}

				userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user info', 
					data: { 
						success: true,
						message: "Successfully retrieved user count",
						count: count
				 	}
				}));
			});
		} catch (e) {
			console.error(e);
			userPub.publish('output message:' + sessionID, JSON.stringify({ channel: 'user count', data: { success: false, message: "Unknown error getting user information, please try again!"}}));
		}
	});

	userCountSub.subscribe('user count:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return UserInfo;
};