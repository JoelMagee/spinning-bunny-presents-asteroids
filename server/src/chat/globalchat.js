/*jslint white: true */

var redis;

var GlobalChat = function() {
	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	globalChatSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;

		if (messageObj.data.hasOwnProperty('message') && (typeof messageObj.data.message === 'string')) {
			globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:messageObj.data.message}));
		} else {
			//Error, trying to send invalid global chat message, we're not doing anything as it's not important enough for feedback
		}
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};