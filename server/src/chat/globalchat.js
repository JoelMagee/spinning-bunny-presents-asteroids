/*jslint white: true */

var redis;

var GlobalChat = function() {
	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	globalChatSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;

		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:messageObj.data}));
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};