/*jslint white: true */

var redis;

var GlobalChat = function(sessionManager) {
	this.sessionManager = sessionManager;

	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	var self = this;

	globalChatSub.on('pmessage', function(channelPattern, actualChannel, message) {
		console.log("GlobalChat object received global chat message");

		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;

		if (self.sessionManager.loggedIn(sessionID)) {
			globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:messageObj.data}));
		} else {
			console.log("Global message received from client which was not logged in. Not broadcasting..");
			globalChatPub.publish('output message:' + sessionID, JSON.stringify({sessionID: sessionID, channel: "global message", data: { success: false, message: "Error, you must be logged in to send a global chat message."}}));
		}
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};