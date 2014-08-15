/*jslint white: true */

var redis;

var GlobalChat = function(sessionManager) {
	this.sessionManager = sessionManager;

	var globalChatSub = redis.createClient();
	var globalChatPub = redis.createClient();

	var self = this;

	// var globalDebug = redis.createClient();

	// globalDebug.on('pmessage', function(a, b, c) {
	// 	console.log("IN QUEUE");
	// 	console.log(a);
	// 	console.log(b);
	// 	console.log(c);
	// });

	// globalDebug.psubscribe("*");

	globalChatSub.on('pmessage', function(channelPattern, actualChannel, message) {
		console.log("GlobalChat object received global chat message");

		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;

		console.log(sessionID);

		//if (self.sessionManager.loggedIn(sessionID)) {
			globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:messageObj.data}));
		//} else {
		//	console.log("Global message received from client which was not logged in. Not broadcasting..");
		//}
	});

	globalChatSub.psubscribe('global message:*');
};

module.exports = function(_redis) {
	redis = _redis;

	return GlobalChat;
};