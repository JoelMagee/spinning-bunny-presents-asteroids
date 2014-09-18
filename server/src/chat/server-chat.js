/*jslint white: true */

var redis;

var ServerChat = function() {
	var loginSub = redis.createClient();
	var logoutSub = redis.createClient();
	var globalChatPub = redis.createClient();

	loginSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;
		var username = messageObj.username;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just logged in";
		newMessageObj.message.username = "Server";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));

	});

	loginSub.psubscribe("internal:login:username:*");

	logoutSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;
		var username = messageObj.username;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just logged out";
		newMessageObj.message.username = "Server";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));
	});

	logoutSub.psubscribe("internal:logout:username:*");

	console.log("Server chat module loaded");
};

module.exports = function(_redis) {
	redis = _redis;

	return ServerChat;
};