var redis;

var GlobalChat = function() {
	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	globalChatSub.on('pmessage', function(channel, message) {
		console.log("GlobalChat object received global chat message");

		var messageObj = JSON.parse(message);
		var sessionID = message.sessionID;

		globalChatPub.publish('output message', {sessionID: sessionID, channel: "global message", data:messageObj.message});
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};