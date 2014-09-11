/*jslint white: true */

var redis;

var GlobalChat = function(sessionManager) {
	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	globalChatSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;

		console.dir(messageObj);

		if (messageObj.message && messageObj.message.content && typeof messageObj.message.content === 'string') {

			sessionManager.getProperty(sessionID, 'username', function(err, username) {
				if (err) {
					console.error("Error loading username from session to process global chat message");
					return;
				}

				var newMessageObj = {};
				newMessageObj.message = {};
				newMessageObj.message.content = messageObj.message.content;
				newMessageObj.message.username = username;

				console.log("Broadcasting global chat message");
				console.dir(newMessageObj);
				globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));
			});

		} else {
			//Error, trying to send invalid global chat message, we're not doing anything as it's not important enough for feedback
			console.error("Invalid global chat message recieved, ignoring");
		}
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};